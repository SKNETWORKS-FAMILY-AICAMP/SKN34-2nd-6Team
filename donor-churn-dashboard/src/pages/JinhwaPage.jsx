/**
 * JinhwaPage — 진화 담당 페이지
 * 요구사항: CSV 로드 및 검증, 분석 모델 호출 및 연산, 대호님 컴포넌트 유기적 결합
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'

// 대호(daeho) 폴더에 이미 구현되어 있는 핵심 컴포넌트 스크립트 파일들을 가져옵니다.
import BatchScoringPanel from '../components/daeho/BatchScoringPanel'
import DonorResultTable from '../components/daeho/DonorResultTable'
import FollowUpActions from '../components/daeho/FollowUpActions'

export default function JinhwaPage() {
  // --- 상태 관리(State) 정의 공간 ---
  const [file, setFile] = useState(null)               // 로드된 CSV 파일 객체
  const [fileError, setFileError] = useState('')       // 요구사항 5: 확장자 및 빈 값 에러 메시지
  const [loading, setLoading] = useState(false)         // 요구사항 2: 모델 연산 가동 상태 제어
  const [modelResults, setModelResults] = useState([])   // 요구사항 3: 백엔드가 연산하여 반환한 결과 데이터 목록
  const [apiError, setApiError] = useState('')         // 요구사항 5: 서버 통신 및 연산 오류 에러 메시지

  // --- 요구사항 1, 5: CSV 파일 입력 처리 및 유효성 검증 함수 ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0] // 선택된 단일 파일 확보
    setFileError('')
    setApiError('')
    setFile(null)
    setModelResults([]) // 새 파일을 올리면 기존 분석 결과 화면을 초기화

    // 요구사항 5: 빈 데이터 유효성 검증 (파일 선택 취소 등)
    if (!selectedFile) {
      setFileError('CSV 파일이 정상적으로 선택되지 않았습니다.')
      return
    }

    // 요구사항 1: 브라우저 임시 가상 경로 및 파일 메타정보 로깅
    console.log("브라우저 인지 임시 파일 경로 (fakepath):", e.target.value)
    console.log("로드된 파일 상세 정보:", { name: selectedFile.name, size: selectedFile.size })

    // 요구사항 5: 잘못된 확장자 필터링 스크립트
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
    if (fileExtension !== 'csv') {
      setFileError('유효하지 않은 확장자 포맷입니다. 반드시 .csv 파일만 업로드해 주세요.')
      return
    }

    // 요구사항 5: 내용이 비어있는 빈 데이터 파일(0바이트) 예외 처리
    if (selectedFile.size === 0) {
      setFileError('선택한 CSV 파일 내용에 기입된 데이터가 존재하지 않습니다 (0 Bytes).')
      return
    }

    // 모든 전처리를 통과하면 React 파일 상태값에 바인딩
    setFile(selectedFile)
  }

  // --- 요구사항 2, 3: 메인 페이지의 분석 모델 호출 및 연산 적용 함수 ---
  const handleExecuteAnalysis = async () => {
    if (!file) return

    setLoading(true)
    setApiError('')
    setModelResults([])

    // 멀티파트 전송을 위한 자바스크립트 FormData 객체 생성
    const formData = new FormData()
    formData.append('file', file) // 백엔드 API 명세 키값에 맞춰 바인딩

    try {
      // 요구사항 2: ml-backend 서버의 CatBoost 분석 모델 연산 API 주소 호출
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('서버 측 분석 연산 엔진 가동 중 예외가 발생했습니다. CSV 서식을 확인하세요.')
      }

      // 요구사항 3: 받아온 파일 바탕의 모델 연산 가공 결과 데이터 파싱
      const data = await response.json()
      
      // 대호님이 구현해 둔 컴포넌트가 받아칠 수 있도록 데이터 추출 및 검증
      if (data && data.donors) {
        setModelResults(data.donors) 
      } else if (Array.isArray(data)) {
        setModelResults(data) // 반환 타입이 배열 루트 형태일 때의 대응 스크립트
      } else {
        throw new Error('모델 예측 결과 데이터 포맷이 유효하지 않거나 비어 있습니다.')
      }

    } catch (err) {
      // 요구사항 5: 통신 장애 및 백엔드 연산 실패 시 에러 메시지 셋업
      setApiError(err.message || '분석 모델 서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // --- 요구사항 4: 최종 화면 렌더링(기존 Tailwind 스타일 포맷 반영) ---
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      {/* 상단 헤더 영역 (기존 포맷 유지) */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">진화의 메인 컨트롤 패널</h1>
        <p className="text-slate-500 mt-1">기부자 CSV 데이터를 로드하여 CatBoost 분석 모델 연산을 수행하고 대시보드를 구축합니다.</p>
      </div>

      {/* 요구사항 1, 5: CSV 파일 업로드 섹션 */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
        <h2 className="text-md font-semibold text-slate-800">📂 1. 분석용 기부자 데이터셋(CSV) 선택</h2>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
        />
        {file && (
          <p className="text-sm text-emerald-600 font-medium">
            ✓ 데이터셋 로드 완료: <span className="underline">{file.name}</span>
          </p>
        )}
        
        {/* 요구사항 5: 확장자/0바이트 입력 에러 처리 */}
        {fileError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-md">
            ⚠️ 입력 에러: {fileError}
          </div>
        )}
      </div>

      {/* 요구사항 2: 메인 분석 모델 호출 컨트롤러 섹션 */}
      <div className="text-center py-2">
        <button
          onClick={handleExecuteAnalysis}
          disabled={!file || loading}
          className={`px-6 py-3 font-semibold text-sm rounded-md shadow-sm transition-colors
            ${file && !loading 
              ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          {loading ? '⏳ CatBoost 예측 모델 연산 가동 중...' : '🚀 메인 분석 모델 호출 및 연산 실행'}
        </button>

        {/* 요구사항 5: 백엔드 서버 통신장애 및 데이터 연산 예외 처리 */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-md mt-4 text-left">
            🚨 모델 연산 거부됨: {apiError}
          </div>
        )}
      </div>

      {/* 요구사항 3, 4: 대호님 컴포넌트들을 유기적으로 결합하여 화면에 띄우는 결과 뷰어 레이아웃 */}
      {modelResults.length > 0 ? (
        <div className="space-y-6 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">📊 CatBoost 모델 분석 결과 대시보드</h2>
          
          {/* 의존성 매핑 1: 대호님이 설계한 배치 요약 스코어 패널 */}
          <BatchScoringPanel dataSummary={modelResults} />

          {/* 의존성 매핑 2: 기부자 리스트 표 및 시각화 배지 연동 테이블 */}
          <DonorResultTable donors={modelResults} />

          {/* 의존성 매핑 3: 이탈 위험 분석 기반 후속 행동 대응 스크립트 패널 */}
          <FollowUpActions data={modelResults} />
        </div>
      ) : (
        !loading && (
          <div className="text-center text-slate-400 text-sm py-8 bg-slate-200/30 rounded-lg border border-dashed border-slate-200">
            대시보드가 비어 있습니다. 상단에서 CSV 파일을 업로드한 뒤 모델 연산을 가동해 주세요.
          </div>
        )
      )}

      {/* 하단 링크 영역 (기존 포맷 유지) */}
      <div className="pt-4 border-t border-slate-200">
        <Link to="/" className="inline-block text-sm font-medium text-teal-700 hover:underline">
          ← 홈으로
        </Link>
      </div>
    </div>
  )
}

