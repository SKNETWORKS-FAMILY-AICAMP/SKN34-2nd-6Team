# Donor Retain — ML Backend

React(`../donor-churn-dashboard`) 배치 스코어링용 FastAPI.

**기준 모델:** 레포 루트 `ML/XGBoost_model_v2.joblib` (재학습 없음)  
**전략 A:** 템플릿을 학습 원본 입력(28컬럼, 전처리 후 27피처)에 맞게 확장.  
사용자 표시명 ↔ 설문 코드 매핑: `app/services/column_map.py`

## 실행

의존성·가상환경·환경변수는 **레포 루트**에서 통일합니다.

```powershell
# 레포 루트에서
.\setup.ps1          # 최초 1회 (.venv + requirements.txt)
.\run-backend.ps1    # http://127.0.0.1:8000
```

macOS/Linux: `./setup.sh` → `./run-backend.sh`

설정 파일:
- `../requirements.txt` — Python 패키지
- `../.env` / `../.env.example` — AWS·`VITE_API_BASE_URL` 등

프론트: `cd ../donor-churn-dashboard && npm install && npm run dev`

## 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 헬스 + 팀 모델 로드 |
| GET | `/api/v1/template/csv` | 사용자용 한글 라벨 템플릿 |
| POST | `/api/v1/predict/batch` | CSV/Excel 배치 예측 |
| GET | `/api/v1/fields` | 매핑 디버그 |

## 업로드 파일 저장 경로

모델 검증과 예측을 통과한 파일만 `ml-backend/uploads/`에 UUID가 포함된 이름으로
저장됩니다. API 응답의 `upload.storage_path`에서 실제 서버 절대경로를 확인할 수
있습니다. 저장 위치를 변경하려면 서버 실행 전에 `UPLOAD_DIR` 환경 변수를
설정하세요.
