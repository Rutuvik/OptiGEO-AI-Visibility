import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Settings, 
  BarChart3, 
  AlertCircle, 
  ChevronRight, 
  Zap, 
  Target, 
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Flag,
  ListRestart,
  Download,
  Loader2,
  FileCode,
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button, buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { conductGeoAnalysis } from '../lib/gemini';
import { ActionEngine } from '../components/ActionEngine';
import { toast } from 'sonner';
import { exportToJSON, exportToCSV, exportReportToPDF } from '../lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const name = payload[0].payload.name || label || payload[0].name;
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-lg shadow-xl">
        <p className="text-[10px] font-black text-white">{name}</p>
        <p className="text-[10px] text-zinc-400">Value: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function GEOOptimizer() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [schema, setSchema] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalysis = async () => {
    if (!url) return toast.error('Website URL is mandatory');
    setLoading(true);
    setResult(null);
    try {
      const data = await conductGeoAnalysis(url, keywords, schema);
      if (data) {
        setResult(data);
        toast.success('GEO Audit Protocol Complete');
      } else {
        toast.error('Audit failed to generate viable intel');
      }
    } catch (err) {
      toast.error('Engine failure during synchronization');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'csv' | 'json') => {
    if (!result) return;

    const fileName = `GEO_Audit_${url.replace(/[^a-z0-9]/gi, '_')}`;

    if (format === 'json') {
      exportToJSON(result, fileName);
    } else if (format === 'csv') {
      // Flatten some data for CSV
      const csvData = result.factors.map((f: any) => ({
        Factor: f.name,
        Score: f.score,
        Status: f.status,
        Description: f.description
      }));
      exportToCSV(csvData, `${fileName}_factors`);
    } else if (format === 'pdf') {
      const sections = [
        { title: 'Executive Summary', content: result.executiveSummary.overview, type: 'text' as const },
        { title: 'Score Interpretation', content: result.executiveSummary.interpretation, type: 'text' as const },
        { title: 'Factor Health Matrix', content: result.factors, type: 'table' as const },
        { title: 'Competitive Positioning', content: `Market Position: ${result.competitivePositioning.marketPosition}\nAI Readiness: ${result.competitivePositioning.aiReadiness}%\nGrowth Potential: ${result.competitivePositioning.growthPotential}%`, type: 'text' as const },
        { title: 'Priority Matrix', content: result.priorityMatrix, type: 'table' as const },
        { title: 'Immediate Actions (0-7 Days)', content: result.roadmap.immediate.map((s: any) => `${s.action}: ${s.problem} -> ${s.fix}`), type: 'list' as const },
        { title: 'Short-Term Roadmap (1-4 Weeks)', content: result.roadmap.shortTerm.map((s: any) => `${s.action}: ${s.problem} -> ${s.fix}`), type: 'list' as const },
        { title: 'Long-Term Strategy (1-3 Months)', content: result.roadmap.longTerm.map((s: any) => `${s.action}: ${s.problem} -> ${s.fix}`), type: 'list' as const },
      ];
      exportReportToPDF(`GEO Optimization Report: ${url}`, sections);
    }
    toast.success(`Exporting as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-zinc-200 dark:border-zinc-800">
           <div className="space-y-2">
              <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-black text-[10px] tracking-widest uppercase py-1 px-3">
                 GEO/AEO Optimization Protocol
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-black text-zinc-950 dark:text-zinc-50 tracking-tighter">
                 AI Visibility <span className="text-indigo-600">Audit.</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xl text-sm italic">
                 Simulating Generative Engine behavior to benchmark citation share and entity authority.
              </p>
           </div>
           
           <div className="bg-white dark:bg-zinc-900 p-2 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center gap-2 max-w-md w-full ring-4 ring-indigo-500/5">
              <div className="pl-4 text-zinc-400">
                 <Globe size={18} />
              </div>
              <Input 
                 value={url}
                 onChange={(e) => setUrl(e.target.value)}
                 placeholder="Enter target URL (e.g. apple.com)"
                 className="border-none bg-transparent focus-visible:ring-0 shadow-none font-bold placeholder:text-zinc-300 h-10"
              />
              <Button 
                 onClick={handleAnalysis}
                 disabled={loading}
                 className="bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-[1.5rem] font-black px-6 hover:scale-105 active:scale-95 transition-all text-xs h-10"
              >
                 {loading ? <Loader2 className="animate-spin" size={16} /> : 'ANALYZE'}
              </Button>
           </div>
        </div>

        {!result && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-12">
             <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-4 shadow-sm">
                <CardHeader>
                   <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Target size={14} className="text-indigo-500" /> Optional Parameters
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 text-left block">Target Keywords (CSV)</label>
                      <Input 
                         value={keywords}
                         onChange={(e) => setKeywords(e.target.value)}
                         placeholder="e.g. best spatial computing, VR headsets 2026"
                         className="rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 h-12 text-zinc-900 dark:text-zinc-100 font-bold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 text-left block">Existing Schema (JSON-LD)</label>
                      <textarea 
                         value={schema}
                         onChange={(e) => setSchema(e.target.value)}
                         className="w-full h-32 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-indigo-500/20 resize-none"
                         placeholder='{"@context": "https://schema.org", ...}'
                      />
                   </div>
                </CardContent>
             </Card>
             <div className="flex flex-col justify-center space-y-6 lg:pl-12">
                <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                   <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-2">Deep Intelligence Extraction</h3>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                      Our engine crawls the web and cross-references citation patterns in Gemini, SearchGPT, and Perplexity to determine your position in the LLM knowledge base.
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {[
                     { icon: <Zap size={14}/>, label: 'Citation Freq' },
                     { icon: <ShieldCheck size={14}/>, label: 'Entity Trust' },
                     { icon: <TrendingUp size={14}/>, label: 'GEO Benchmarks' },
                     { icon: <Layers size={14}/>, label: 'Semantic Delta' }
                   ].map(item => (
                     <div key={item.label} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                        <div className="text-indigo-500 bg-indigo-500/10 p-2 rounded-xl">{item.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.label}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col items-center justify-center py-32 space-y-8"
            >
               <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
                  <Settings className="animate-spin text-zinc-900 dark:text-zinc-100 relative" size={48} />
               </div>
               <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Executing Competitive Synchronization...</h3>
                  <p className="text-sm text-zinc-400 font-medium animate-pulse uppercase tracking-[0.2em] font-black">Detecting Industry Benchmarks & LLM Citations</p>
               </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="space-y-8 pb-32"
            >
               <div className="flex justify-end mb-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger className={cn(buttonVariants({}), "bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-black uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-indigo-500/20 flex items-center")}>
                      <Download size={14} className="mr-2"/> Export Report
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden min-w-[160px]">
                      <DropdownMenuItem onClick={() => exportReport('pdf')} className="flex items-center gap-2 p-3 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <FileText size={14} className="text-rose-500" /> Professional PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportReport('csv')} className="flex items-center gap-2 p-3 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <FileSpreadsheet size={14} className="text-emerald-500" /> Data Sheet (CSV)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportReport('json')} className="flex items-center gap-2 p-3 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <FileJson size={14} className="text-amber-500" /> Structure (JSON)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
               {/* Section 1: Executive Pulse & Benchmarks */}
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <Card className="lg:col-span-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-xl flex flex-col justify-between">
                     <div className="space-y-1 text-left">
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Visibility Score</p>
                        <h2 className="text-5xl font-black text-indigo-600 tabular-nums leading-none tracking-tighter">{result?.benchmarking?.visibilityScore}</h2>
                        <p className="text-[10px] font-bold text-zinc-500 mt-2">Industrial Avg: {result?.benchmarking?.industryAverage}%</p>
                     </div>
                     <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">vs Industry</span>
                        <Badge className={`${result?.benchmarking?.delta.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'} border-none font-black text-[10px]`}>
                           {result?.benchmarking?.delta}
                        </Badge>
                     </div>
                  </Card>

                  <Card className="lg:col-span-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-xl flex flex-col justify-between relative group text-left">
                     <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/5 rounded-full" />
                     <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none font-black text-[8px] uppercase py-0.5">Performance Insights</Badge>
                            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-lg font-black leading-snug text-zinc-900 dark:text-white line-clamp-2">{result?.executiveSummary?.overview}</p>
                           <p className="text-[11px] text-zinc-500 font-medium leading-relaxed italic border-l-2 border-indigo-500/20 pl-3">
                              {result?.executiveSummary?.interpretation}
                           </p>
                        </div>
                     </div>
                     <div className="relative z-10 grid grid-cols-2 gap-4 pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                        <div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Impact Prediction</p>
                            <p className="text-xs font-black text-emerald-500 uppercase">{result?.executiveSummary?.predictedGain}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">AI Readiness</p>
                            <p className="text-xs font-black text-zinc-900 dark:text-white uppercase">{result?.competitivePositioning?.aiReadiness}%</p>
                        </div>
                     </div>
                  </Card>

                  <Card className="lg:col-span-1 bg-zinc-950 text-white rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between text-left">
                     <div className="absolute right-0 top-0 p-4 opacity-10">
                        <TrendingUp size={80} />
                     </div>
                     <div className="relative z-10 space-y-1">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Market Position</p>
                        <h3 className="text-3xl font-black leading-tight text-indigo-400 uppercase tracking-tighter">{result?.competitivePositioning?.marketPosition}</h3>
                        <p className="text-[10px] font-bold text-zinc-600 mt-2">Ranked vs {result?.competitivePositioning?.competitors?.length} Rivals</p>
                     </div>
                     <div className="relative z-10 pt-4 flex items-center justify-between border-t border-zinc-800/50">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Growth Potential</span>
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-none font-black text-[10px]">{result?.competitivePositioning?.growthPotential}%</Badge>
                     </div>
                  </Card>
               </div>

               {/* Section 2: Factor Breakdown - All 9 Modules */}
               <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                        <Zap size={14} className="text-indigo-500" /> Advanced Factor Matrix
                     </h4>
                     <p className="text-[10px] font-bold text-zinc-400 italic">Full Analysis Spectrum • 9 Core Modules</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {(result?.factors || []).map((f: any, idx: number) => (
                        <motion.div 
                           key={f.name}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.05 }}
                           className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all group flex flex-col justify-between h-[190px] text-left"
                        >
                           <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                 <h5 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight leading-tight">{f.name}</h5>
                                 <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${f.status === 'Optimal' ? 'bg-emerald-500' : f.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{f.status}</span>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className="text-2xl font-black text-indigo-600 tabular-nums">{f.score}</span>
                                 <span className="text-[10px] font-black text-zinc-400 ml-0.5">%</span>
                              </div>
                           </div>
                           <div className="space-y-3 pt-4">
                              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic line-clamp-2">{f.description}</p>
                              <div className="h-1.5 w-full bg-zinc-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${f.progress}%` }}
                                    transition={{ duration: 1 }}
                                    className={`h-full ${f.status === 'Optimal' ? 'bg-emerald-500' : f.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'}`}
                                 />
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </div>

               {/* Section 3: Competitive Analysis & Action Roadmap */}
               <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Benchmarking Comparison List */}
                  <div className="lg:col-span-2 space-y-6">
                     <Card className="bg-zinc-950 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group h-full text-left">
                        <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-1000 p-8">
                           <BarChart3 size={150} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Industry Benchmarking</h4>
                        <div className="space-y-8 relative z-10">
                           {(result?.benchmarking?.metrics || []).map((m: any) => (
                              <div key={m.label} className="space-y-3">
                                 <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{m.label}</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[8px] uppercase tracking-widest">{m.comparison}</Badge>
                                 </div>
                                 <p className="text-2xl font-black tracking-tight">{m.value}</p>
                                 <div className="h-0.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full w-[60%]" />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </Card>
                  </div>

                  {/* Roadmap: Tactical Activation Steps */}
                  <Card className="lg:col-span-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl text-left">
                     <div className="flex items-center justify-between mb-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                           <Flag size={14} className="text-indigo-500" /> Actionable Next Steps
                        </h4>
                        <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none font-black text-[9px]">TIMELINED EXECUTION</Badge>
                     </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                           { title: 'Immediate Actions', subtitle: '(0-7 Days)', key: 'immediate', bg: 'bg-rose-500/5', ring: 'ring-rose-500/20', accent: 'border-rose-500' },
                           { title: 'Short-term Goals', subtitle: '(1-4 Weeks)', key: 'shortTerm', bg: 'bg-indigo-500/5', ring: 'ring-indigo-500/20', accent: 'border-indigo-500' },
                           { title: 'Long-term Strategy', subtitle: '(1-3 Months)', key: 'longTerm', bg: 'bg-zinc-500/5', ring: 'ring-zinc-500/20', accent: 'border-zinc-500' }
                        ].map(phase => (
                           <div key={phase.key} className="space-y-6">
                              <div className="space-y-1">
                                 <h5 className={`text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white`}>{phase.title}</h5>
                                 <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{phase.subtitle}</p>
                              </div>
                              <div className="space-y-4">
                                 {(result?.roadmap?.[phase.key as keyof typeof result.roadmap] || []).map((step: any, idx: number) => (
                                    <div 
                                       key={idx} 
                                       className={`p-4 rounded-2xl ${phase.bg} ring-1 ${phase.ring} border-l-4 ${phase.accent} group hover:scale-[1.02] transition-all cursor-default flex flex-col gap-3 shadow-sm`}
                                    >
                                       <div className="space-y-2">
                                          <div className="flex justify-between items-center gap-2">
                                             <Badge className="bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-black text-[7px] uppercase px-1.5 shadow-sm whitespace-nowrap">
                                                {step.estimatedTime}
                                             </Badge>
                                             <div className="flex items-center gap-1">
                                                <Zap size={10} className="text-amber-500" />
                                                <span className="text-[8px] font-black text-amber-600 uppercase">{step.impactScore}</span>
                                             </div>
                                             <span className={`text-[8px] font-black uppercase ${step.effort === 'High' ? 'text-rose-500' : 'text-zinc-400'}`}>{step.effort} Effort</span>
                                          </div>
                                          <h6 className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 leading-tight uppercase">{step.action}</h6>
                                          
                                          <div className="space-y-1.5">
                                             <div className="flex items-start gap-1.5">
                                                <AlertCircle size={10} className="text-rose-500 mt-0.5 shrink-0" />
                                                <p className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 leading-tight"><span className="uppercase text-[8px] text-zinc-400 text-left block">Issue:</span> {step.problem}</p>
                                             </div>
                                             <div className="flex items-start gap-1.5">
                                                <CheckCircle2 size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                                                <p className="text-[9px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight bg-emerald-500/5 px-1 rounded"><span className="uppercase text-[8px] text-emerald-500 text-left block">Fix:</span> {step.fix}</p>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>
               </div>

               {/* Section 4: Performance Priority Matrix Scatter */}
               <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl text-left">
                  <div className="flex items-center justify-between mb-12">
                     <div className="space-y-1 text-left">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                           <Layers size={14} className="text-indigo-500" /> Strategic Impact Matrix
                        </h4>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase italic">Priority Weighting: Impact vs Effort (Factor Health Analysis)</p>
                     </div>
                     <div className="flex gap-4">
                        {['P1 - Critical', 'P2 - Important', 'P3 - Task'].map((l, i) => (
                           <div key={l} className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-rose-500' : i === 1 ? 'bg-amber-500' : 'bg-blue-500'}`} />
                              <span className="text-[8px] font-black text-zinc-400 uppercase">{l}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                     <div className="lg:col-span-2 h-[350px] relative">
                        <div className="absolute inset-0 border-l-2 border-b-2 border-zinc-100 dark:border-zinc-800 flex flex-col justify-between items-end p-2 pointer-events-none">
                           <span className="text-[8px] font-black text-zinc-300 uppercase absolute -left-12 top-0 -rotate-90 origin-bottom-right tracking-widest whitespace-nowrap">Impact Degree ⟿</span>
                           <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Execution Effort ⟿</span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                           <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <XAxis type="number" dataKey="effort" hide domain={[0, 100]} />
                              <YAxis type="number" dataKey="impact" hide domain={[0, 100]} />
                              <ZAxis type="number" dataKey="z" range={[400, 1200]} />
                              <Tooltip content={<CustomTooltip />} />
                              <Scatter name="Strategic Tasks" data={(result?.priorityMatrix || []).map((p: any) => ({ ...p, z: p.impact * 2 }))}>
                                 {(result?.priorityMatrix || []).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.priorityLevel === 'P1' ? '#f43f5e' : entry.priorityLevel === 'P2' ? '#f59e0b' : '#3b82f6'} className="cursor-pointer" />
                                 ))}
                              </Scatter>
                           </ScatterChart>
                        </ResponsiveContainer>
                     </div>

                     <div className="space-y-6 text-left">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2">High Priority Optimizations</p>
                        <div className="space-y-4">
                           {(result?.priorityMatrix || []).filter((p: any) => p.priorityLevel === 'P1').map((p: any) => (
                              <div key={p.item} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 space-y-2">
                                 <div className="flex justify-between items-center">
                                    <h5 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">{p.item}</h5>
                                    <Badge className="bg-rose-500 text-white border-none font-black text-[7px] px-1 shadow-sm">P1</Badge>
                                 </div>
                                 <div className="flex gap-4">
                                    <div className="text-left">
                                       <p className="text-[8px] font-black text-zinc-400 uppercase">Impact</p>
                                       <p className="text-[10px] font-black text-emerald-500">{p.impactLabel}</p>
                                    </div>
                                    <div className="text-left">
                                       <p className="text-[8px] font-black text-zinc-400 uppercase">Effort</p>
                                       <p className="text-[10px] font-black text-zinc-500">{p.effortLabel}</p>
                                    </div>
                                    <div className="text-left">
                                       <p className="text-[8px] font-black text-zinc-400 uppercase">Score</p>
                                       <p className="text-[10px] font-black text-indigo-500">{p.score}%</p>
                                    </div>
                                 </div>
                                 <p className="text-[10px] font-medium text-zinc-500 leading-relaxed font-sans">{p.description}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </Card>

               {/* Section 4: Detailed Recommendations Detailed */}
               <div className="pt-12 text-left">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 px-4">Deep Insight Matrix (Specific Technical Fixes)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                     {result?.detailedRecommendations?.map((insight: any, idx: number) => (
                        <Card key={idx} className="bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl hover:translate-y-[-5px] transition-transform duration-300">
                           <div className="space-y-4">
                              <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none font-black text-[9px] tracking-widest uppercase py-1">
                                 Module {idx + 1} • {insight.topic}
                              </Badge>
                              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">{insight.finding}</p>
                              <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-2 flex items-center gap-2">
                                    <Layers size={12}/> Analysis Guide
                                 </p>
                                 <code className="block text-[10px] font-mono bg-zinc-50 dark:bg-indigo-500/5 text-zinc-500 dark:text-indigo-400 p-4 rounded-xl leading-relaxed">
                                    {insight.fix}
                                 </code>
                              </div>
                           </div>
                        </Card>
                     ))}
                  </div>
               </div>

               {result?.actionEngine && (
                 <div className="pt-12 text-left">
                   <ActionEngine actions={result.actionEngine} />
                 </div>
               )}

               <div className="flex justify-center pt-24 pb-12">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                        setResult(null);
                        setKeywords('');
                        setSchema('');
                        setUrl('');
                    }} 
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 gap-2"
                  >
                     <ListRestart size={14} /> New Optimization Protocol
                  </Button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
