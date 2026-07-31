# Donor Retain — 기부 후원 이탈 예측 대시보드

React 대시보드 + Python ML 백엔드(`../ml-backend`) 연동 프로젝트입니다.

## 빠른 시작

### 1) ML API (레포 루트)

```powershell
# 레포 루트에서
.\setup.ps1
.\run-backend.ps1
```

### 2) 프론트엔드

```bash
cd donor-churn-dashboard
npm install
npm run dev
```

환경변수는 **레포 루트 `.env` 하나**만 사용합니다 (`VITE_API_BASE_URL`, AWS 등).  
템플릿: 루트 `.env.example` → 없으면 `setup.ps1`이 `.env`를 만들어 줍니다.

## 기술 스택

- React 19 + Vite + Tailwind CSS 4 + Recharts + Lucide
- Python: scikit-learn / XGBoost / FastAPI

## 폴더

```
src/
  components/ pages/ data/ services/ utils/
```
