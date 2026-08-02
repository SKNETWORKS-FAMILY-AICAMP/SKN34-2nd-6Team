# structure.md — 프로젝트 구조 & 팀 구현 가이드

이 문서는 **지금 레포가 어떻게 생겼는지**, **데이터가 어떻게 흘러 React에 보이는지**,  
**각자 이름 페이지에서 무엇을 하면 되는지**를 가장 쉽게 정리한 것입니다.

> 최종 갱신: 2026-08-02 (daeho 기준 · 정석 솔루션 UI 합류)

---

## 1. 한 줄로 이해하기

> 사용자가 CSV를 올리면 → Python(FastAPI)이 학습된 XGBoost로 이탈 확률을 계산하고 → React가 리스트·차트로 보여준다.  
> 로그인 사용자면 예측 결과가 **Firestore 기부자 명단**에도 쌓여 마이페이지·후속 조치로 이어진다.

```
[사용자 CSV/Excel]
        │
        ▼
[ml-backend] 컬럼 매핑 → 전처리 → 모델 예측 → JSON 결과
        │
        ├──────────────────────────────┐
        ▼                              ▼
[donor-churn-dashboard]          [Firestore]
 React 표·차트·상세               donorRosters/{uid}/donors
 (대호·정석 등)                    (마이페이지 명단)
```

---

## 2. 폴더가 하는 일 (큰 그림)

```
SKN34-2nd-6Team/
├── donor-churn-dashboard/   ← React 프론트 (화면)
│   └── firestore.rules      ← Firestore Security Rules
├── ml-backend/              ← FastAPI (예측·AI 초안 API)
├── ML/                      ← 학습된 모델 파일 (XGBoost_model_v2.joblib)
├── requirements.txt         ← Python 의존성 (루트 단일)
├── .env.example / .env      ← 환경변수 (루트 단일, Vite+백엔드 공유)
├── setup.ps1 / run-backend.ps1
├── src/util/                ← 원래 학습/전처리 스크립트 참고용
├── docs/                    ← 깃/커밋 가이드 등
├── structure.md             ← 이 문서
└── README.md                ← 팀원 이름
```

| 폴더 | 역할 |
|------|------|
| `donor-churn-dashboard` | 사용자가 보는 웹 UI (Vite + React + Tailwind + Firebase) |
| `ml-backend` | CSV 받아서 예측하고 JSON으로 돌려주는 서버 (+ Bedrock 초안) |
| `ML/` | 이미 학습된 모델 (재학습 없이 로드만) |

### 로컬 실행 (루트에서)

```powershell
.\setup.ps1          # 최초 1회: .venv + requirements + (.env 없으면 example 복사)
.\run-backend.ps1    # API → http://127.0.0.1:8000
cd donor-churn-dashboard; npm install; npm run dev
```

> Python 가상환경은 **루트 `.venv`만** 사용한다. `basic_venv` / `subvenv` 등 다른 이름은 쓰지 않는다.

macOS/Linux: `./setup.sh` → `./run-backend.sh`

`.env`에 `VITE_API_BASE_URL`, `VITE_FIREBASE_*`, (선택) `VITE_KAKAO_JS_KEY`, AWS Bedrock 키를 채운다. 예시는 `.env.example`.

---

## 3. 프론트 구조 (React)

```
donor-churn-dashboard/src/
├── App.jsx                 ← 라우트 정의
├── pages/
│   ├── HomePage.jsx        ← 랜딩 (히어로 + 미리보기 + 기능 카드)
│   ├── LoginPage.jsx / SignupPage.jsx
│   ├── DaehoPage.jsx       ← 기부자 관리 · 배치 스코어링 ✅
│   ├── JeongseokPage.jsx   ← 솔루션 도출 (3탭) ✅
│   ├── HosunPage.jsx       ← 시각화 (스텁)
│   ├── JinhwaPage.jsx      ← 모델 평가·히스토리 (스텁)
│   └── JiyunPage.jsx       ← 마이페이지 · 기부자 명단 ✅
├── components/
│   ├── layout/AppLayout.jsx
│   ├── common/Badge.jsx
│   ├── daeho/              ← BatchScoringPanel, Drawer, 후속조치 등
│   └── jeongseok/          ← SolutionPanel, ChurnDriverPanel, Demographic…
├── services/
│   ├── api.js              ← FastAPI (predictBatch, copy draft…)
│   ├── firebase.js         ← Firebase 초기화
│   ├── userDb.js / kakaoDb.js
│   ├── donorRosterDb.js    ← 기부자 명단 upsert/list/delete
│   └── activityDb.js       ← 활동 기록
├── data/featureLinks.js    ← 헤더/홈 네비·티저
├── context/AuthContext.jsx ← Firebase(+카카오) 로그인 상태
└── utils/requireLogin.js, riskLabels.js, …
```

### 페이지 ↔ URL ↔ 담당 ↔ 상태

| 담당 | URL | 화면 이름 (`featureLinks`) | 상태 |
|------|-----|---------------------------|------|
| 김대호 | `/daeho` | 기부자 관리 | ✅ 배치 예측·리스트·상세·후속조치 |
| 채정석 | `/jeongseok` | 솔루션 도출 | ✅ 위험도·핵심요인·인구통계 3탭 |
| 황호순 | `/hosun` | 호순 | ⬜ 스텁 (시각화 예정) |
| 김진화 | `/jinhwa` | 진화 | ⬜ 스텁 (평가·히스토리 예정) |
| 홍지윤 | `/jiyun` | 마이페이지 | ✅ 프로필·명단·후속조치 |

헤더/홈 카드 문구는 `data/featureLinks.js` 의 `name`, `teaser` 만 바꾸면 됩니다.

---

## 4. 백엔드 구조 (FastAPI)

```
ml-backend/app/
├── main.py
├── api/routes.py
├── schemas.py
└── services/
    ├── column_map.py
    ├── preprocess.py
    ├── predict.py
    └── bedrock_copy.py     ← AI 문자/이메일 초안 (Bedrock)
```

### 주요 API

| Method | Path | 하는 일 |
|--------|------|---------|
| GET | `/health` | 서버·모델 상태 |
| GET | `/api/v1/template/csv` | 예시 템플릿 다운로드 |
| POST | `/api/v1/predict/batch` | CSV/Excel → 이탈 확률 JSON |
| POST | `/api/v1/copy/draft` | 기부자 정보 → AI 초안 |
| GET | `/api/v1/fields` | 라벨↔설문 코드 (디버그) |

> 정석 탭「핵심 요인」은 원래 `GET /api/v1/insights/churn-drivers`를 기대하지만 **아직 백엔드에 없음**.  
> 프론트는 API 실패 시 `churnDriverData.js` 정적 폴백으로 화면이 깨지지 않게 처리함.

프론트·백엔드 공통: 루트 `.env` 의 `VITE_API_BASE_URL=http://localhost:8000`

---

## 5. 데이터는 뭘 쓰고, 어떻게 변환되나?

### 쓰는 데이터 / 모델

1. **입력:** 사용자가 올린 CSV/Excel  
   - 피처: 연령, 성별, 소득, 기부정보 습득경로 등 (한글 라벨 OK)  
   - 연락처(모델 미사용): `이메일`, `전화번호` → 화면 후속 조치용
2. **모델:** `ML/XGBoost_model_v2.joblib` → 전처리 후 **27개 피처**로 이탈 확률(0~1)

### 변환 파이프라인

```
① 업로드 파일 읽기 (CSV/Excel)
        ↓
② 컬럼 이름 맞추기 (column_map.py)
        ↓
③ 학습과 같은 전처리
        ↓
④ model.predict_proba → 이탈 확률
        ↓
⑤ JSON: probability / risk_level / recommended_channel / next_step / email·phone·profile
        ↓
⑥ React 표시 + (로그인 시) Firestore 명단 upsert
```

### React에서 보이는 것 (대호 `/daeho`)

| 단계 | 화면 |
|------|------|
| 1 | 템플릿 다운로드 / 파일 선택 / 배치 예측 |
| 2 | 요약 숫자 + 고위험군 권장 채널 차트 |
| 3 | 결과 리스트 (**위험도 높은 순** 토글) |
| 4 | 행 클릭 → 상세 Drawer + AI 초안·쉬어가기 |

호출: `services/api.js` → `predictBatch(file)`  
UI: `components/daeho/BatchScoringPanel.jsx`  
명단 저장: `upsertDonorsFromBatch` (`donorRosterDb.js`) → 마이페이지에서 `listDonors`

### 5-1. joblib

- 서버가 로드만 하고, 프론트는 joblib을 직접 쓰지 않음
- 위치: `ML/XGBoost_model_v2.joblib`

### 5-2. 사용자용 컬럼 vs 모델용 컬럼

| 계층 | 예시 |
|------|------|
| 사용자용 템플릿 | `연령`, `성별`, … |
| 학습·모델용 | `H선문2_01`, `배문6_정리` 등 27피처 |

업로드 시 `rename_to_survey()`가 이름을 맞춘다.  
관련: `column_map.py`, `preprocess.py`, `inferenceFields.js`

### 5-3. Firestore (로그인 사용자)

| 경로 | 용도 |
|------|------|
| `users/{uid}` | 프로필 |
| `kakaoUsers/{id}` | 카카오 프로필 |
| `activities/{id}` | 활동 기록 |
| `donorRosters/{uid}/donors/{id}` | 기부자 명단 (예측 결과 upsert) |

규칙은 `donor-churn-dashboard/firestore.rules` — Console에 배포 필요.

---

## 6. 로컬에서 돌리는 법

터미널 2개:

```powershell
# 1) API (루트)
.\run-backend.ps1

# 2) 프론트
cd donor-churn-dashboard
npm run dev
```

브라우저에서 홈(`/`) → 기능 카드 또는 `/daeho`, `/jeongseok`, `/jiyun` 등.

> **로그인 가드:** `/daeho`, `/jiyun` 등은 비로그인 시 로그인 유도.  
> 홈 히어로「회원가입」버튼은 **로그인 상태면 숨김**.

---

## 7. 각자 페이지에서 구현하는 방법

다른 사람 폴더는 되도록 건드리지 말고, **자기 `pages/*` + `components/{이름}/` + 필요 시 API** 만 수정.

### 공통 체크리스트

1. `pages/XxxPage.jsx` 열기 (스텁이면 컴포넌트 연결)
2. `src/components/{이름}/` 에 UI 추가
3. API 필요 시 `services/api.js` 또는 `ml-backend` 에 추가
4. `featureLinks.js` 의 `name` / `teaser` 갱신
5. Tailwind + teal/slate 톤 유지

### 대호 참고 파일

| 하고 싶은 것 | 참고 |
|--------------|------|
| 업로드·예측·리스트 | `BatchScoringPanel.jsx` |
| 결과 테이블 | `DonorResultTable.jsx` |
| 상세·후속조치 | `DonorDetailDrawer.jsx`, `FollowUpActions.jsx` |
| API | `services/api.js` |
| 명단 저장 | `donorRosterDb.js` |

### 팀원별 현황

| 담당 | URL | 상태 | 요약 |
|------|-----|------|------|
| **대호** | `/daeho` | ✅ | 배치 스코어링·기부자 관리·Firestore 명단 연동 |
| **지윤** | `/jiyun` | ✅ | Firebase Auth·마이페이지·명단·후속조치 |
| **정석** | `/jeongseok` | ✅ | 솔루션 3탭 (위험도 / 핵심요인 / 인구통계) |
| **호순** | `/hosun` | ⬜ | 이탈·연령별 시각화 (배치/명단 데이터 재사용 권장) |
| **진화** | `/jinhwa` | ⬜ | 모델 평가·히스토리 |

---

### 팀원별 상세

#### 대호 — 기부자 관리 · 배치 스코어링 ✅

- 홈 미리보기(`mode="preview"`) + `/daeho` 전체 모드
- 예측 후 Firebase 사용자면 명단 upsert
- 결과 목록 **위험도 높은 순** 정렬 토글

#### 지윤 — 로그인 + 마이페이지 ✅

- Firebase Auth / (선택) 카카오
- 프로필 CRUD, 기부자 명단, Drawer·쉬어가기 등 대호와 동일 UX 일부 공유
- 명단도 **위험도 높은 순** 정렬 토글

#### 정석 — 솔루션 도출 ✅

| 탭 | 컴포넌트 | 데이터 |
|----|----------|--------|
| 위험도별 솔루션 | `SolutionPanel` + `SolutionSegmentCard` | `predictBatch` 재사용 |
| 핵심 요인 솔루션 | `ChurnDriverPanel` | API 없으면 `churnDriverData.js` 폴백 |
| 인구통계별 솔루션 | `DemographicSolutionPanel` | `demographicChurnData.js` 정적 |

**남은 개선(선택):** 백엔드에 `GET /api/v1/insights/churn-drivers` 추가하면 탭2가 실시간 분석으로 전환됨.

#### 호순 — 이탈/비이탈·연령별 시각화 ⬜

**목적:** 이탈 vs 비이탈, 나이대별 이탈률 등 차트.

**권장 데이터 소스**
1. Firestore 명단 (`listDonors`) — 업로드 결과 재사용
2. 또는 배치 JSON / 정적 샘플

완료 기준: 차트 2종+, 빈 데이터 UI, `featureLinks` teaser 반영.

#### 진화 — 모델 평가 / 히스토리 ⬜

**목적:** 모델 메타·지표(Accuracy 등)·과거 배치/평가 이력.

이력 저장 방식(Firebase / 백엔드 / 로컬)은 팀 합의 후 연동.

---

## 8. 한 장 요약 다이어그램

```
   홈(/) ──┬── /daeho      → 기부자 관리 · 배치 스코어링 ✅
           ├── /jeongseok  → 솔루션 도출 (3탭) ✅
           ├── /jiyun      → 마이페이지 · 명단 ✅
           ├── /hosun      → 이탈 시각화 ⬜
           └── /jinhwa     → 모델 평가 · 히스토리 ⬜

   CSV ──► ml-backend(전처리+XGBoost) ──► JSON ──► React
                                              │
                                              └──► Firestore 명단 (로그인 시)
```

질문 생기면 먼저 **대호 플로우**(`/daeho` → `BatchScoringPanel` → `predictBatch`)를 따라가면  
데이터 → 변환 → 화면 → 명단 연결이 가장 빨리 보입니다.
