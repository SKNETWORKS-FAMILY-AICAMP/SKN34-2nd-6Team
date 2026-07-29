# Donor Retain — 기부 후원 이탈 예측 대시보드

React 대시보드 + Python ML 백엔드(`../ml-backend`) 연동 프로젝트입니다.

## 빠른 시작 (실제 학습 모델)

### 1) ML API (팀 학습 모델)

`ML/XGBoost_model_v2.joblib` 로드 (재학습 없음). 템플릿 → 설문 코드 매핑 후 전처리·predict.

```bash
cd ../ml-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) 프론트엔드

```bash
cd donor-churn-dashboard   # 레포 루트 기준
npm install
npm run dev
```

`.env` 에 `VITE_API_BASE_URL=http://localhost:8000` 이 있어야 추론 탭이 실제 모델을 호출합니다.

## 기술 스택

- React 19 + Vite + Tailwind CSS 4 + Recharts + Lucide
- Python: scikit-learn / XGBoost / LightGBM / FastAPI

## 폴더

```
src/
  components/ pages/ data/ services/ utils/
```

학습 지표는 `src/data/trainedMetrics.js` 에 동기화됩니다 (`python train_cli.py`).
