import { useState } from 'react'
import AllModelsOverview from './AllModelsOverview'
import ModelDetailView from './ModelDetailView'
import ModelEvaluationMenu from './ModelEvaluationMenu'
import { findModel } from './modelEvaluationData'

export default function ModelEvaluationExplorer() {
  const [selectedId, setSelectedId] = useState('all')
  const selectedModel = selectedId === 'all' ? null : findModel(selectedId)

  return (
    <div className="grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <ModelEvaluationMenu selectedId={selectedId} onSelect={setSelectedId} />
      </aside>
      <div role="tabpanel">
        {selectedId === 'all' ? (
          <AllModelsOverview onSelectModel={setSelectedId} />
        ) : (
          <ModelDetailView model={selectedModel} />
        )}
      </div>
    </div>
  )
}
