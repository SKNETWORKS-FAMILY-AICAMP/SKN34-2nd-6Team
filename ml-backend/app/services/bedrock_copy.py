"""AWS Bedrock — 기부자 개인화 SMS/이메일 초안."""

from __future__ import annotations

import json
import os
import re
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, ClientError

SYSTEM_PROMPT = """당신은 비영리·기부 단체의 CRM 담당자를 돕는 한국어 카피라이터입니다.
목표: 기부 이탈 위험이 있는 후원자에게 보낼 SMS와 이메일 초안을 작성합니다.

규칙:
1. 입력으로 주어진 기부자 특성·위험도·권장 채널·호칭용 이름만 근거로 개인화합니다.
2. 이메일 주소, 전화번호는 입력·출력에 넣지 않습니다.
3. 호칭 규칙:
   - donor_name이 있으면 SMS/이메일 인사말에 "OO님" 형태로만 사용합니다. (예: 길동님)
   - donor_name이 비어 있으면 "후원자님"을 사용합니다.
   - "고객님"보다 "OO님"/"후원자님"을 우선합니다.
   - 성+이름 전체에 존칭을 어색하게 붙이지 말고, 주어진 이름을 그대로 "OO님"으로 부릅니다.
4. 과장·협박·죄책감 유발 문구를 쓰지 않습니다. 감사·존중·구체적 참여 유도 톤을 유지합니다.
5. 광고성 표현은 최소화하고, 사실 기반·부드러운 제안 위주로 씁니다.
6. SMS 작성 규칙 (중요):
   - 길이: 공백 포함 150~220자. 90자 이하로 짧게 쓰지 마세요.
   - 이모지는 최대 1개만 허용합니다.
   - 반드시 아래 내용을 SMS 본문에 녹여 씁니다 (해석만 하고 본문에 빠진 채 두지 말 것):
     (a) 호칭 인사 + 감사/관계 유지 한 마디
     (b) recommended_channel 맥락에 맞는 접근 안내
     (c) next_step에 나온 구체적 다음 행동을 쉬운 말로 안내
     (d) 부담 없는 재참여 CTA 1개
   - "최근 소식을 나누고 싶습니다"처럼 막연한 한 줄로 끝내지 마세요.
7. 이메일은 제목 1줄 + 본문 4~7문장, 존댓말, 본문 시작에 호칭 인사, 마지막에 짧은 CTA 1개.
   - 이메일 본문에도 next_step·권장 채널 맥락을 반영합니다.
8. recommended_channel이 있으면 그 채널 맥락에 맞는 말투/접근을 반영합니다. (예: SNS면 가볍게, 단체 직접 제공이면 정중하고 신뢰감 있게, 포털이면 플랫폼에서 확인하도록 안내)
9. risk_level에 따라 긴급도를 조절합니다.
   - High: 구체적 다음 행동 명확, 압박하지 않음
   - Medium: 관심 유지·가벼운 참여 유도
   - Low: 감사·관계 유지 중심
10. rationale은 SMS/이메일에 실제로 넣은 전략을 1~2문장으로 요약합니다. 본문에 없는 내용을 rationale에만 쓰지 마세요.
11. 반드시 아래 JSON만 출력합니다. 설명·마크다운·코드펜스 금지.

출력 JSON 스키마:
{
  "sms": "문자열",
  "email_subject": "문자열",
  "email_body": "문자열",
  "rationale": "이 초안이 이 기부자에게 맞는 이유 1~2문장"
}
"""

USER_TEMPLATE = """다음 기부자 정보를 바탕으로 SMS 1통 + 이메일 1통 초안을 작성하세요.
연락처(이메일/전화)는 제공되지 않으며, 메시지 본문에 연락처를 넣지 마세요.
호칭용 이름이 있으면 "OO님"으로 개인화하고, 없으면 "후원자님"을 사용하세요.

[호칭]
- donor_name: {donor_name}

[예측 결과]
- 이탈 확률: {probability_pct}%
- 위험도: {risk_level}
- 권장 채널: {recommended_channel}
- 시스템 권고(next_step): {next_step}

[프로필]
{profile_json}

[작성 조건]
- 채널: SMS와 이메일 둘 다 작성
- SMS: 150~220자, next_step·권장 채널·위험도 톤이 본문에 드러나게 작성
- 이메일: next_step를 CTA로 구체화
- 언어: 한국어
- 단체 호칭: "저희 단체"
- 출력: 지정 JSON만
"""


def _parse_json_payload(text: str) -> dict[str, Any]:
    raw = (text or "").strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError("모델 응답에서 JSON을 찾지 못했습니다.") from None
        data = json.loads(match.group(0))
    required = ("sms", "email_subject", "email_body", "rationale")
    missing = [k for k in required if k not in data]
    if missing:
        raise ValueError(f"JSON 필드 누락: {', '.join(missing)}")
    return {
        "sms": str(data["sms"]).strip(),
        "email_subject": str(data["email_subject"]).strip(),
        "email_body": str(data["email_body"]).strip(),
        "rationale": str(data["rationale"]).strip(),
    }


def generate_copy_draft(
    *,
    donor_name: str = "",
    probability_pct: float,
    risk_level: str,
    recommended_channel: str,
    next_step: str,
    profile: dict[str, Any] | None = None,
) -> dict[str, Any]:
    region = (
        os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "us-east-1"
    ).strip()
    model_id = (
        os.getenv(
            "BEDROCK_MODEL_ID",
            "global.anthropic.claude-haiku-4-5-20251001-v1:0",
        )
        or ""
    ).strip()
    access_key = (os.getenv("AWS_ACCESS_KEY_ID") or "").strip()
    secret_key = (os.getenv("AWS_SECRET_ACCESS_KEY") or "").strip()
    if not access_key or not secret_key:
        raise RuntimeError(
            "AWS 자격 증명이 없습니다. 레포 루트 .env 에 AWS_ACCESS_KEY_ID / "
            "AWS_SECRET_ACCESS_KEY 를 설정·저장하세요."
        )

    # boto3는 환경변수도 읽지만, 공백·미저장 방지를 위해 명시 전달
    os.environ["AWS_ACCESS_KEY_ID"] = access_key
    os.environ["AWS_SECRET_ACCESS_KEY"] = secret_key
    os.environ["AWS_REGION"] = region

    user_prompt = USER_TEMPLATE.format(
        donor_name=(donor_name or "").strip(),
        probability_pct=probability_pct,
        risk_level=risk_level,
        recommended_channel=recommended_channel,
        next_step=next_step,
        profile_json=json.dumps(profile or {}, ensure_ascii=False, indent=2),
    )

    client = boto3.client("bedrock-runtime", region_name=region)
    try:
        response = client.converse(
            modelId=model_id,
            system=[{"text": SYSTEM_PROMPT}],
            messages=[
                {
                    "role": "user",
                    "content": [{"text": user_prompt}],
                }
            ],
            inferenceConfig={
                "temperature": 0.4,
                "maxTokens": 1024,
            },
        )
    except (ClientError, BotoCoreError) as exc:
        raise RuntimeError(f"Bedrock 호출 실패: {exc}") from exc

    parts = response.get("output", {}).get("message", {}).get("content", [])
    text = "".join(p.get("text", "") for p in parts if isinstance(p, dict))
    draft = _parse_json_payload(text)
    draft["model_id"] = model_id
    return draft
