// frontend/src/App.js
// Root component. Owns phase routing only — all logic in useCurriculum hook.

import React, { useEffect } from "react";
import { useCurriculum } from "./hooks/useCurriculum";
import { PageTransition } from "./components/layout/AppShell";
import InputForm           from "./components/pages/InputForm";
import AgentProgress       from "./components/pages/AgentProgress";
import CurriculumDashboard from "./components/pages/CurriculumDashboard";
import HistoryPanel        from "./components/ui/HistoryPanel";
import { DashboardSkeleton } from "./components/ui/Skeleton";
import "./styles/global.css";

export default function App() {
  const {
    phase, curriculum, progressSteps, error,
    history, historyLoading,
    generate, cancel, reset,
    loadHistory, loadFromHistory, removeFromHistory,
  } = useCurriculum();

  const [showHistory, setShowHistory] = React.useState(false);

  useEffect(() => {
    if (showHistory) loadHistory();
  }, [showHistory, loadHistory]);

  return (
    <div className="app">
      {showHistory && (
        <HistoryPanel
          items={history}
          loading={historyLoading}
          onLoad={(id) => { loadFromHistory(id); setShowHistory(false); }}
          onDelete={removeFromHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {phase === "input" && (
        <PageTransition id="input">
          <InputForm
            onGenerate={generate}
            error={error}
            onShowHistory={() => setShowHistory(true)}
          />
        </PageTransition>
      )}

      {phase === "generating" && (
        <PageTransition id="generating">
          <AgentProgress steps={progressSteps} onCancel={cancel} />
        </PageTransition>
      )}

      {phase === "transitioning" && <DashboardSkeleton />}

      {phase === "dashboard" && curriculum && (
        <PageTransition id="dashboard">
          <CurriculumDashboard
            curriculum={curriculum}
            onReset={reset}
            onShowHistory={() => setShowHistory(true)}
          />
        </PageTransition>
      )}
    </div>
  );
}
