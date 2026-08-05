/**
 * FullReportPdfButton — 인구통계 8개 컬럼 전체의 구간별 솔루션을 정리한 PDF를 내려받는 버튼.
 * html-to-image는 화면 밖(-9999px)으로 옮겨 숨긴 요소도 정상적으로 캡처하므로
 * (display:none/opacity:0과 달리 레이아웃 계산이 유지됨), 전체 리포트는 화면에는
 * 보이지 않는 별도 영역에 항상 렌더링해두고 그 노드를 캡처한다.
 */
import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { Download, Loader2 } from 'lucide-react'
import { DEMOGRAPHIC_CHURN } from './demographicChurnData'

export default function FullReportPdfButton({ className, data = DEMOGRAPHIC_CHURN }) {
  const [downloading, setDownloading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const printRef = useRef(null)

  const handleDownloadPdf = async () => {
    if (!printRef.current || downloading) return
    setDownloading(true)
    setPdfError('')
    try {
      const node = printRef.current
      const nodeWidth = node.offsetWidth
      const nodeHeight = node.offsetHeight
      if (!nodeWidth || !nodeHeight) {
        throw new Error('캡처할 내용이 비어 있습니다.')
      }
      const imgData = await toPng(node, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: nodeWidth,
        height: nodeHeight,
      })
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (nodeHeight * imgWidth) / nodeWidth

      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      pdf.save('이탈_통계_솔루션_전체리포트.pdf')
    } catch (err) {
      console.error('PDF 생성 실패:', err)
      setPdfError('PDF 생성에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className={
            className ||
            'inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-70'
          }
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          PDF 다운로드
        </button>
        {pdfError ? <p className="text-xs text-rose-600">{pdfError}</p> : null}
      </div>

      {/* PDF 캡처 전용 — 인구통계 8개 컬럼 전체의 구간별 솔루션을 항상 펼쳐서 담는다 */}
      <div className="fixed left-[-9999px] top-0" aria-hidden="true">
        <div ref={printRef} className="w-[720px] bg-white p-8">
          <h1 className="text-2xl font-bold text-slate-900">이탈 통계 및 솔루션 — 전체 리포트</h1>
          <p className="mt-1 text-xs text-slate-400">
            인구통계 8개 컬럼(연령대·성별·학력·종교·고용상태·자녀유무·소득구간·혼인상태)의
            구간별 이탈율과 맞춤 솔루션
          </p>
          <div className="mt-6 space-y-8">
            {data.map((dim) => {
              const sorted = [...dim.buckets].sort((a, b) => b.rate - a.rate)
              return (
                <section key={dim.id}>
                  <h2 className="border-b border-teal-200 pb-1 text-lg font-bold text-teal-700">
                    {dim.title}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {sorted.map((b, i) => (
                      <div key={b.label} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-base font-bold text-slate-900">
                            {i === 0 ? '🔺 ' : ''}
                            {b.label}
                          </span>
                          <span className="text-xs font-semibold text-rose-600">
                            이탈율 {b.rate}% · 표본 {b.count}명
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">
                          {b.solution}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
