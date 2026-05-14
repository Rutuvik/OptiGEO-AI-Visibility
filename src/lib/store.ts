import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReportData {
  input: any;
  result: any;
}

interface AppState {
  reports: {
    detailedAnalysis: ReportData | null;
    visibilityTracker: ReportData | null;
    competitorAnalysis: ReportData | null;
    intelligenceAudit: ReportData | null;
    geoOptimizer: ReportData | null;
    growthIntelligence: ReportData | null;
    contentGenerator: ReportData | null;
    humanoidBlogLab: ReportData | null;
    promptTestingLab: ReportData | null;
    dashboard: ReportData | null;
    automation: ReportData | null;
    knowledgeGraph: ReportData | null;
  };
  setReport: (key: keyof AppState['reports'], input: any, result: any) => void;
  updateReport: (key: keyof AppState['reports'], data: any) => void;
  clearReport: (key: keyof AppState['reports']) => void;
  clearAllReports: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      reports: {
        detailedAnalysis: null,
        visibilityTracker: null,
        competitorAnalysis: null,
        intelligenceAudit: null,
        geoOptimizer: null,
        growthIntelligence: null,
        contentGenerator: null,
        humanoidBlogLab: null,
        promptTestingLab: null,
        dashboard: null,
        automation: null,
        knowledgeGraph: null,
      },
      setReport: (key, input, result) => 
        set((state) => ({
          reports: { ...state.reports, [key]: { input, result } }
        })),
      updateReport: (key, data) =>
        set((state) => ({
          reports: {
            ...state.reports,
            [key]: state.reports[key] 
              ? { ...state.reports[key]!, result: { ...state.reports[key]!.result, ...data } }
              : { input: {}, result: data }
          }
        })),
      clearReport: (key) => 
        set((state) => ({
          reports: { ...state.reports, [key]: null }
        })),
      clearAllReports: () => 
        set({
          reports: {
            detailedAnalysis: null,
            visibilityTracker: null,
            competitorAnalysis: null,
            intelligenceAudit: null,
            geoOptimizer: null,
            growthIntelligence: null,
            contentGenerator: null,
            humanoidBlogLab: null,
            promptTestingLab: null,
            dashboard: null,
            automation: null,
            knowledgeGraph: null,
          }
        }),
    }),
    {
      name: 'growth-strategy-storage',
    }
  )
);
