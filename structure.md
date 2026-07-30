# structure.md — 프로젝트 구조 & 팀 구현 가이드

이 문서는 **지금 레포가 어떻게 생겼는지**, **데이터가 어떻게 흘러 React에 보이는지**,  
**각자 이름 페이지에서 무엇을 하면 되는지**를 가장 쉽게 정리한 것입니다.

---

## 1. 한 줄로 이해하기

> 사용자가 CSV를 올리면 → Python(FastAPI)이 학습된 XGBoost로 이탈 확률을 계산하고 → React가 리스트·차트로 보여준다.

```
[사용자 CSV/Excel]
        │
        ▼
[ml-backend] 컬럼 매핑 → 전처리 → 모델 예측 → JSON 결과
        │
        ▼
[donor-churn-dashboard] React가 fetch → 화면(테이블/차트/상세)
```

---

## 2. 폴더가 하는 일 (큰 그림)

```
SKN34-2nd-6Team/
├── donor-churn-dashboard/   ← React 프론트 (화면)
├── ml-backend/              ← FastAPI (예측 API)
├── ML/                      ← 학습된 모델 파일 (XGBoost_model_v2.joblib)
├── src/util/                ← 원래 학습/전처리 스크립트 참고용
├── docs/                    ← 깃/커밋 가이드 등
└── README.md                ← 팀원 이름
```

| 폴더 | 역할 |
|------|------|
| `donor-churn-dashboard` | 사용자가 보는 웹 UI (Vite + React + Tailwind) |
| `ml-backend` | CSV 받아서 예측하고 JSON으로 돌려주는 서버 |
| `ML/` | 이미 학습된 모델 (재학습 없이 로드만) |

---

## 3. 프론트 구조 (React)

```
donor-churn-dashboard/src/
├── App.jsx                 ← 라우트(/daeho, /hosun …) 정의
├── pages/                  ← URL마다 1개 페이지
│   ├── HomePage.jsx
│   ├── DaehoPage.jsx       ← 대호 (구현 완료 예시)
│   ├── JeongseokPage.jsx
│   ├── HosunPage.jsx
│   ├── JinhwaPage.jsx
│   └── JiyunPage.jsx
├── components/
│   ├── layout/             ← 헤더, 공통 레이아웃
│   ├── common/             ← Badge 등 공용 UI
│   └── daeho/              ← 대호 기능 컴포넌트 (참고용)
├── services/api.js         ← 백엔드 호출 (fetch)
├── data/
│   ├── featureLinks.js     ← 헤더/홈에 나오는 팀원 링크·티저
│   └── inferenceFields.js  ← 템플릿 필드 설명(프론트 메타)
├── context/AuthContext.jsx ← 로그인 상태
└── utils/requireLogin.js   ← 로그인 유도
```

### 페이지 ↔ URL ↔ 담당

| 이름 | URL | 페이지 파일 | 컴포넌트 폴더 |
|------|-----|-------------|---------------|
| 김대호 | `/daeho` | `pages/DaehoPage.jsx` | `components/daeho/` |
| 채정석 | `/jeongseok` | `pages/JeongseokPage.jsx` | `components/jeongseok/` (만들면 됨) |
| 황호순 | `/hosun` | `pages/HosunPage.jsx` | `components/hosun/` |
| 김진화 | `/jinhwa` | `pages/JinhwaPage.jsx` | `components/jinhwa/` |
| 홍지윤 | `/jiyun` | `pages/JiyunPage.jsx` | `components/jiyun/` |

헤더/홈 카드 문구는 `data/featureLinks.js` 의 `name`, `teaser` 만 바꾸면 됩니다.

---

## 4. 백엔드 구조 (FastAPI)

```
ml-backend/app/
├── main.py                 ← 앱 진입
├── api/routes.py           ← API 엔드포인트
├── schemas.py              ← 응답 JSON 모양
└── services/
    ├── column_map.py       ← 한글라벨 ↔ 설문코드 ↔ 모델피처 매핑
    ├── preprocess.py       ← 업로드 읽기, 전처리, 템플릿 CSV 생성
    └── predict.py          ← 모델 로드 + 배치 스코어링
```

### 주요 API

| Method | Path | 하는 일 |
|--------|------|---------|
| GET | `/api/v1/template/csv` | 예시 5행 템플릿 다운로드 (이메일·전화번호 포함) |
| POST | `/api/v1/predict/batch` | CSV/Excel 업로드 → 이탈 확률 등 JSON |
| GET | `/health` | 서버·모델 살아있는지 확인 |

프론트 `.env`: `VITE_API_BASE_URL=http://localhost:8000`

---

## 5. 데이터는 뭘 쓰고, 어떻게 변환되나?

### 쓰는 데이터 / 모델

1. **입력:** 사용자가 올린 CSV/Excel  
   - 피처 컬럼: 연령, 성별, 소득, 기부정보 습득경로 등 (한글 라벨 OK)  
   - 연락처(모델에 안 넣음): `이메일`, `전화번호` → 화면 후속 조치용으로만 전달
2. **모델:** `ML/XGBoost_model_v2.joblib`  
   - 전처리 후 **27개 피처**로 이탈 확률(0~1) 예측

### 변환 파이프라인 (쉽게)

```
① 업로드 파일 읽기 (CSV/Excel)
        ↓
② 컬럼 이름 맞추기
   "연령" / "age" / "H선문2_01"  →  설문 코드로 통일
   (매핑 표: column_map.py)
        ↓
③ 학습 때와 같은 전처리
   (소득 로그 변환, 채널 multi-hot 등)
        ↓
④ 모델 predict_proba → 이탈 확률
        ↓
⑤ 결과 JSON 만들기
   - probability / risk_level / recommended_channel / next_step
   - email, phone, profile (상세용)
   - 확률 높은 순 정렬
        ↓
⑥ React가 JSON을 받아 표·차트·상세 Drawer로 표시
```

### React에서 보이는 것 (대호 페이지 기준)

| 단계 | 화면 |
|------|------|
| 1 | 템플릿 다운로드 / 파일 선택 / 배치 예측 실행 |
| 2 | 요약 숫자 + 고위험군 권장 채널 차트 |
| 3 | 결과 리스트 (이탈확률 높은 순) |
| 4 | 행 클릭 → 오른쪽 상세 + 문자/이메일/일시정지(시뮬레이션) |

호출 코드: `services/api.js` → `predictBatch(file)`  
UI: `components/daeho/BatchScoringPanel.jsx`

### 5-1. joblib 모델은 어떻게 쓰이나? (쉽게)

> `ML/XGBoost_model_v2.joblib` 은 **엑셀/CSV 데이터가 아니라**,  
> 미리 학습해 둔 **XGBoost 이탈 예측 모델**을 파일로 저장한 것이다.  
> 앱에서는 **다시 학습하지 않고**, 불러와서 **점수만 매긴다**.

#### 비유로 이해하기

| 비유 | 실제 |
|------|------|
| 요리 레시피 책 | joblib 모델 파일 |
| 오늘 들어온 재료 | 사용자가 올린 CSV |
| 요리사가 레시피대로 요리 | FastAPI가 전처리 후 `predict_proba` 실행 |
| 완성된 요리(점수) | 이탈 확률 → React 화면에 표시 |

#### 흐름 (한눈에)

```
1. 서버가 joblib 파일을 메모리에 로드 (처음 한 번)
2. 사용자가 CSV 업로드
3. 컬럼 이름·전처리를 학습 때와 똑같이 맞춤 (27개 피처)
4. 모델이 각 행마다 이탈 확률(0~1) 계산
5. 확률로 High / Medium / Low 나누고 JSON으로 반환
6. React(대호 페이지)가 표·차트로 보여줌
```

#### 코드에서 하는 일

- **로드:** `ml-backend/app/services/predict.py` → `joblib.load(...)`
- **예측:** `model.predict_proba(X)[:, 1]` → 이탈 확률
- **API:** `POST /api/v1/predict/batch`
- **화면:** `services/api.js` → `BatchScoringPanel.jsx`

#### 알아두면 좋은 점

- joblib **안을 열어 데이터를 조회·수정하지 않는다.**
- 프론트(React)는 joblib을 직접 쓰지 않고, **백엔드 API 결과만** 받는다.
- 모델 파일 위치: 주로 `ML/XGBoost_model_v2.joblib`

### 5-2. 사용자용 컬럼 vs 모델용 컬럼 

> **전략 A:** 사람에게 보이는 이름과 학습/모델용 이름을 나눠 두고,  
> 업로드 시 백엔드가 자동으로 바꿔 준다. 별도 변환 스크립트를 새로 만들 필요 없음.

| 계층 | 예시 | 누가 보나 |
|------|------|-----------|
| 사용자용 (템플릿 헤더) | `연령`, `성별`, `월평균 가구소득...` | 사람 / CSV 다운로드 |
| 내부 키 | `age`, `gender`, `income` | 코드 매핑용 |
| 학습·모델용 | `H선문2_01`, `배문1`, `배문6` → `배문6_정리` 등 | 모델 27피처 |

**동작 요약**

1. 템플릿(`GET /api/v1/template/csv`) → **한글 라벨**로 내려줌  
2. 사용자가 CSV를 채워서 업로드  
3. `rename_to_survey()`가 `"연령"` / `"age"` / `"H선문2_01"` 등을 **설문 코드로 통일**  
4. 학습과 같은 전처리 후 모델 예측

**관련 파일:** `ml-backend/app/services/column_map.py`, `preprocess.py`  
**프론트 라벨 참고:** `donor-churn-dashboard/src/data/inferenceFields.js`

---

## 6. 로컬에서 돌리는 법

터미널 2개:

```bash
# 1) API
cd ml-backend
uvicorn app.main:app --reload --port 8000

# 2) 프론트
cd donor-churn-dashboard
npm run dev
```

브라우저에서 홈 → 각자 이름 카드 또는 `/daeho` 등으로 이동.

> 참고: 대호 페이지 로그인 가드는 **개발용으로 잠시 꺼져 있음**. 배포 전에 다시 켜면 됩니다.

---

## 7. 각자 페이지에서 구현하는 방법 (간단)

대호(`/daeho`)가 **완성 예시**입니다. 같은 패턴으로 자기 폴더만 채우면 됩니다.

### 공통 체크리스트

1. **페이지 파일 열기**  
   예: `pages/HosunPage.jsx` — 지금은 “구현하세요” 스텁만 있음.
2. **컴포넌트 폴더 만들기**  
   예: `src/components/hosun/MyFeature.jsx`
3. **페이지에서 컴포넌트만 렌더**  
   ```jsx
   import MyFeature from '../components/hosun/MyFeature'
   export default function HosunPage() {
     return <MyFeature />
   }
   ```
4. **API가 필요하면**  
   - 이미 있는 예측 API 재사용 → `services/api.js`에 함수 추가  
   - 새 API가 필요하면 → `ml-backend/app/api/routes.py` + `services/` 에 추가
5. **홈/헤더 문구**  
   `data/featureLinks.js` 에서 자기 `teaser`를 실제 기능명으로 변경
6. **스타일**  
   기존처럼 Tailwind + teal/slate 톤 유지하면 전체 느낌이 맞음

### 대호를 참고할 때 볼 파일

| 하고 싶은 것 | 참고 파일 |
|--------------|-----------|
| 페이지 연결 | `pages/DaehoPage.jsx` |
| 업로드·예측·리스트 | `components/daeho/BatchScoringPanel.jsx` |
| 결과 테이블 | `DonorResultTable.jsx` |
| 오른쪽 상세 | `DonorDetailDrawer.jsx` |
| API 호출 | `services/api.js` |
| 컬럼/템플릿 의미 | `ml-backend/.../column_map.py`, `preprocess.py` |

### 팀원별 시작점

| 담당 | URL | 시작 파일 | 할 일 요약 |
|------|-----|-----------|------------|
| **대호** | `/daeho` | `components/daeho/` | 기부자 관리·배치 스코어링 (이미 구현됨, 유지·개선) |
| **지윤** | `/jiyun` | `pages/JiyunPage.jsx` → `components/jiyun/` | 로그인 + Firebase DB |
| **호순** | `/hosun` | `pages/HosunPage.jsx` → `components/hosun/` | 이탈/비이탈·연령별 시각화 |
| **진화** | `/jinhwa` | `pages/JinhwaPage.jsx` → `components/jinhwa/` | 모델 평가·히스토리 |
| **정석** | `/jeongseok` | `pages/JeongseokPage.jsx` → `components/jeongseok/` | 솔루션 도출 |

다른 사람 페이지/컴포넌트는 되도록 건드리지 말고, **자기 `pages/*` + `components/{이름}/` + 필요 시 API** 만 수정하는 것을 권장합니다.

### 팀원별 할 일 (상세)

#### 지윤 — 로그인 + Firebase 데이터베이스

**목적**  
mock 로그인을 Firebase Authentication으로 교체하고, Firestore 등으로 사용자·앱 데이터를 관리한다.

**할 일**
- Firebase 연동(초기화, `.env`)
- 회원가입·로그인·로그아웃 (Auth)
- `AuthContext` mock → Firebase 세션 교체, 로그인 가드 연결
- Firestore 스키마 설계 (`users` 등) 및 프로필 CRUD
- Security Rules로 본인 데이터만 접근 가능하게
- `/login`, `/signup`, `/jiyun` UI 정리

**완료 기준**
- [ ] Auth로 가입/로그인/로그아웃 동작
- [ ] 새로고침 후에도 로그인 유지
- [ ] 비로그인 시 보호 기능 차단
- [ ] DB에 사용자 문서 생성·조회, CRUD 동작
- [ ] Security Rules 적용, 시크릿 미커밋

**참고**  
`context/AuthContext.jsx`, `pages/LoginPage.jsx`, `SignupPage.jsx`, `utils/requireLogin.js`, `pages/JiyunPage.jsx`, `AppLayout.jsx`

---

#### 호순 — 이탈/비이탈·연령별 시각화

**목적**  
이탈/비이탈 비율, 나이대별 이탈률 등 핵심 지표를 차트로 보여주는 시각화 페이지를 만든다.

**할 일**
- `/hosun` + `components/hosun/` 구현
- 이탈 vs 비이탈 비율 차트
- 연령대별 이탈률 차트
- (가능하면) 위험도·권장 채널 분포
- 데이터 소스 정하기 (배치 결과 재사용 / 샘플 / API)
- 로딩·빈 데이터·에러 처리, `featureLinks.js` teaser 갱신

**완료 기준**
- [ ] 이탈/비이탈 차트 표시
- [ ] 나이대별 이탈률 차트 표시
- [ ] 빈 데이터 안내 UI
- [ ] 홈/헤더 teaser 반영

**참고**  
`pages/HosunPage.jsx`, `services/api.js`, `components/daeho/BatchScoringPanel.jsx`, `ml-backend/.../schemas.py`

---

#### 진화 — 모델 평가 / 히스토리

**목적**  
모델 성능 지표와 과거 예측·평가 이력을 조회하는 히스토리 페이지를 만든다.

**할 일**
- `/jinhwa` + `components/jinhwa/` 구현
- 모델 메타(모델명, 버전, threshold) 표시
- 평가 지표(Accuracy, Precision, Recall, F1, AUC 등 — 팀 합의) 표시
- 과거 배치/평가 이력 리스트·상세
- 이력 저장 방식(Firebase / 백엔드 / 로컬) 정하고 연동
- `featureLinks.js` teaser 갱신

**완료 기준**
- [ ] 평가 지표 확인 가능
- [ ] 히스토리 목록·상세 동작
- [ ] 새 실행 후 이력 반영 흐름 정의·동작
- [ ] 홈/헤더 teaser 반영

**참고**  
`pages/JinhwaPage.jsx`, `ml-backend/app/api/routes.py`, `services/predict.py`, `schemas.py`, `ML/`

---

#### 정석 — 솔루션 도출

**목적**  
이탈 위험 기부자에 대한 재참여·리텐션 액션(채널, 메시지, 다음 단계)을 제시하는 솔루션 페이지를 만든다.

**할 일**
- `/jeongseok` + `components/jeongseok/` 구현
- 위험도·특성별 추천 솔루션 규칙 정의
- 권장 채널·후속 조치·메시지 가이드 UI
- 대호 예측 결과(`risk_level`, `recommended_channel`, `next_step`)와 연결
- (가능하면) 세그먼트별 솔루션 카드/필터
- `FollowUpActions` 참고, `featureLinks.js` teaser 갱신

**완료 기준**
- [ ] 위험군별 솔루션 표시
- [ ] 추천 채널·다음 단계가 데이터와 매핑
- [ ] 운영자가 바로 적용 가능한 UI
- [ ] 솔루션 규칙 문서화, teaser 반영

**참고**  
`pages/JeongseokPage.jsx`, `components/daeho/FollowUpActions.jsx`, `DonorDetailDrawer.jsx`, `ml-backend/.../schemas.py`, `predict.py`

---

## 8. 한 장 요약 다이어그램

```
   홈(/) ──┬── /daeho     → 배치 스코어링 (완료 예시)
           ├── /jiyun     → 로그인 · Firebase DB
           ├── /hosun     → 이탈 시각화
           ├── /jinhwa    → 모델 평가 · 히스토리
           └── /jeongseok → 솔루션 도출

   CSV ──► ml-backend(전처리+XGBoost) ──► JSON ──► React 화면
```

질문 생기면 먼저 **대호 플로우**를 따라가 보면, 데이터→변환→화면 연결이 가장 빨리 보입니다.
