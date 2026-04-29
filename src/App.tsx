import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VisibilityTracker from './pages/VisibilityTracker';
import VisibilityReport from './pages/VisibilityReport';
import GEOOptimizer from './pages/GEOOptimizer';
import ContentGenerator from './pages/ContentGenerator';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import KnowledgeGraph from './pages/KnowledgeGraph';
import PromptTestingLab from './pages/PromptTestingLab';
import Automation from './pages/Automation';
import IntelligenceAudit from './pages/IntelligenceAudit';
import HumanoidBlogLab from './pages/HumanoidBlogLab';
import GrowthIntelligence from './pages/GrowthIntelligence';
import DetailedAnalysis from './pages/DetailedAnalysis';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="visibility" element={<VisibilityTracker />} />
            <Route path="visibility/report" element={<VisibilityReport />} />
            <Route path="optimizer" element={<GEOOptimizer />} />
            <Route path="generator" element={<ContentGenerator />} />
            <Route path="competitor" element={<CompetitorAnalysis />} />
            <Route path="kg" element={<KnowledgeGraph />} />
            <Route path="lab" element={<PromptTestingLab />} />
            <Route path="automation" element={<Automation />} />
            <Route path="blog-lab" element={<HumanoidBlogLab />} />
            <Route path="audit" element={<IntelligenceAudit />} />
            <Route path="growth" element={<GrowthIntelligence />} />
            <Route path="analysis" element={<DetailedAnalysis />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors theme="light" />
    </AuthProvider>
  );
}
