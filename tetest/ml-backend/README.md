# Donor Retain — ML Backend

React(`../donor-churn-dashboard`) 배치 스코어링용 FastAPI.

**기준 모델:** 레포 루트 `ML/XGBoost_model_v1.joblib` (재학습 없음)  
**전략 A:** 템플릿을 학습 원본 입력(28컬럼, 전처리 후 27피처)에 맞게 확장.  
사용자 표시명 ↔ 설문 코드 매핑: `app/services/column_map.py`

## 실행

```bash
cd tetest/ml-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

프론트 `.env`: `VITE_API_BASE_URL=http://localhost:8000`

## 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 헬스 + 팀 모델 로드 |
| GET | `/api/v1/template/csv` | 사용자용 한글 라벨 템플릿 |
| POST | `/api/v1/predict/batch` | CSV/Excel 배치 예측 |
| GET | `/api/v1/fields` | 매핑 디버그 |
