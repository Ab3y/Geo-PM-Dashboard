import { Routes, Route, Navigate } from 'react-router-dom';
import { useCurrentPersona } from './context/PersonaContext';

// Original geo-dashboard components
import { useAppState } from './context/AppContext';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import Breadcrumbs from './components/Breadcrumbs';
import Legend from './components/Legend';
import MapTooltip from './components/MapTooltip';

// PM components
import TopNav from './components/pm/TopNav';
import KanbanBoard from './components/pm/KanbanBoard';
import SprintPlanning from './components/pm/SprintPlanning';
import PMPDashboard from './components/pm/PMPDashboard';
import BacklogView from './components/pm/BacklogView';

function GeoDashboard() {
  const { sidebarOpen } = useAppState();
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main
        className="flex-1 flex flex-col relative transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 280 : 0 }}
      >
        <Breadcrumbs />
        <div className="flex-1 relative overflow-hidden">
          <MapContainer />
        </div>
        <Legend />
        <MapTooltip />
      </main>
    </div>
  );
}

export default function App() {
  const { config } = useCurrentPersona();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0e17]">
      <TopNav />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/dashboard" element={<GeoDashboard />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/backlog" element={<BacklogView />} />
          <Route path="/sprint-planning" element={<SprintPlanning />} />
          <Route path="/pmp" element={<PMPDashboard />} />
          <Route path="*" element={<Navigate to={config.defaultView} replace />} />
        </Routes>
      </div>
    </div>
  );
}
