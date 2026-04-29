import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  ShieldAlert, 
  Brain, 
  Loader2, 
  Search, 
  Globe, 
  ChevronRight,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button, buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { generateGrowthStrategy } from '../lib/gemini';
import { ActionEngine } from '../components/ActionEngine';
import { exportToJSON, exportToCSV, exportReportToPDF } from '../lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface Metric {
  model: string;
  presenceScore: number;
  ranking: number;
}

interface Competitor {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
}

interface Gap {
  query: string;
  topCompetitor: string;
  potentialImpact: 'High' | 'Medium' | 'Low';
}

interface AnalysisResult {
  overallScore: number;
  performanceMetrics: Metric[];
  competitorBenchmark: Competitor[];
  gapAnalysis: Gap[];
  trends: { trending: string[]; declining: string[] };
  strategy: { content: string[]; geo: string[]; positioning: string[]; actionableSteps: string[] };
  actionEngine: { 
    issue: string; 
    change: string; 
    content: string; 
    placement: string;
    category: 'Content' | 'Technical' | 'Strategic';
    priority: 'P1' | 'P2' | 'P3';
    impactScore: number;
    effort: 'Low' | 'Medium' | 'High';
    expectedOutcome: string;
  }[];
}

export default function GrowthIntelligence() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!domain) {
      toast.error('Please enter a target domain');
      return;
    }
    setLoading(true);
    try {
      const data = await generateGrowthStrategy(domain);
      if (data) {
        setResult(data);
        toast.success('Growth Intelligence report generated');
      } else {
        toast.error('Engine failed to synthesize deep research');
      }
    } catch (err) {
      toast.error('Analysis interrupted by neural fault');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDomain('');
    setResult(null);
  };

  const exportGrowthReport = (format: 'pdf' | 'csv' | 'json') => {
    if (!result) return;

    const fileName = `Growth_Intelligence_${domain.replace(/[^a-z0-9]/gi, '_')}`;

    if (format === 'json') {
      exportToJSON(result, fileName);
    } else if (format === 'csv') {
      exportToCSV(result.performanceMetrics, `${fileName}_Metrics`);
    } else if (format === 'pdf') {
       const sections = [
        { title: 'Growth Score', content: `Overall Growth Score: ${result.overallScore}`, type: 'text' as const },
        { title: 'Performance Metrics', content: result.performanceMetrics, type: 'table' as const },
        { title: 'Competitive Benchmark', content: result.competitorBenchmark.map(c => ({ Name: c.name, Share: `${c.marketShare}%`, Strengths: c.strengths.join(', ') })), type: 'table' as const },
        { title: 'Gap Analysis', content: result.gapAnalysis, type: 'table' as const },
        { title: 'Trending Topics', content: result.trends.trending, type: 'list' as const },
        { title: 'Declining Relevance', content: result.trends.declining, type: 'list' as const },
        { title: 'Content Cluster Strategy', content: result.strategy.content, type: 'list' as const },
        { title: 'GEO Execution Tactics', content: result.strategy.geo, type: 'list' as const },
        { title: 'High-Impact Actions', content: result.strategy.actionableSteps, type: 'list' as const },
      ];
      exportReportToPDF(`AI Growth Strategy: ${domain}`, sections);
    }
    toast.success(`Exporting as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-10 pb-20 text-left">
      <header className="flex flex-col md:flex-row items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-zinc-950">AI Growth Intelligence</h2>
          <p className="text-zinc-500 font-medium max-w-lg">Deep-logic research and competitive strategy engine across ChatGPT, Gemini, and Claude cohorts.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {result && (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl border-zinc-200 h-12 px-6 font-bold text-zinc-400 hover:text-zinc-950 flex items-center justify-center")}>
                 <Download size={16} className="mr-2" /> Export
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-zinc-200 rounded-xl overflow-hidden min-w-[140px]">
                <DropdownMenuItem onClick={() => exportGrowthReport('pdf')} className="flex items-center gap-2 p-3 text-[10px] font-bold cursor-pointer hover:bg-zinc-50">
                  <FileText size={14} className="text-rose-500" /> PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportGrowthReport('csv')} className="flex items-center gap-2 p-3 text-[10px] font-bold cursor-pointer hover:bg-zinc-50">
                  <FileSpreadsheet size={14} className="text-emerald-500" /> CSV Metrics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportGrowthReport('json')} className="flex items-center gap-2 p-3 text-[10px] font-bold cursor-pointer hover:bg-zinc-50">
                  <FileJson size={14} className="text-amber-500" /> JSON Raw
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Input 
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="brand-domain.com"
            className="rounded-2xl border-zinc-200 bg-zinc-100 h-12 w-full md:w-64 font-bold"
          />
          <Button 
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-zinc-950 text-white rounded-2xl px-8 h-12 font-bold shadow-xl shadow-zinc-950/10 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Run Research Engine'}
          </Button>
        </div>
      </header>

      {!result && !loading && (
        <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-[3rem]">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
              <Brain size={32} className="text-zinc-200" />
            </div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Input domain for multi-model research synthesis</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-zinc-100 rounded-full" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-zinc-950 border-t-transparent rounded-full shadow-lg"
            />
            <Zap className="absolute inset-0 m-auto text-zinc-950 animate-pulse" size={24} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Performing Cross-Model Extraction...</p>
            <p className="text-xs text-zinc-400 font-medium animate-pulse">Consulting ChatGPT, Gemini, and Claude for market presence</p>
          </div>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Performance Summary */}
          <div className="lg:col-span-12">
            <Card className="aesthetic-card bg-zinc-950 text-white p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Target size={200} />
              </div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Overall Growth Score</span>
                  <div className="text-8xl font-black tracking-tighter">{result.overallScore}</div>
                  <Badge className="bg-white/10 text-white rounded-full px-4 h-8 border-white/20">Market Grade: {result.overallScore > 75 ? 'Prime' : 'Sub-Optimal'}</Badge>
                </div>
                {(result.performanceMetrics || []).map((m, i) => (
                  <div key={i} className="space-y-4 pt-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{m.model} Presence</span>
                    <div className="text-4xl font-black">{m.presenceScore}%</div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase">Engine Rank:</span>
                       <span className="text-xs font-black text-emerald-400">#{m.ranking}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${m.presenceScore}%` }}
                          className="h-full bg-white"
                       />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Competitive Benchmark */}
          <Card className="lg:col-span-8 aesthetic-card p-0 overflow-hidden">
            <CardHeader className="p-8 border-bottom border-zinc-100">
               <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                  <BarChart3 className="text-zinc-400" size={18} /> Competitive Benchmark
               </CardTitle>
               <CardDescription className="text-zinc-500 font-medium">Head-to-head analysis against primary market rivals.</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50/50 border-y border-zinc-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Competitor</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Market Share</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Core Strengths</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Vulnerabilities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(result.competitorBenchmark || []).map((comp, i) => (
                    <tr key={i} className="group hover:bg-zinc-50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-sm font-black tracking-tight">{comp.name}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black">{comp.marketShare}%</span>
                          <div className="w-16 h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-950" style={{ width: `${comp.marketShare}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1">
                          {(comp.strengths || []).map((s, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[9px] font-bold px-2 py-0 h-4 uppercase">{s}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-medium text-zinc-500">{comp.weaknesses[0] || 'Unknown'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Gap Detection */}
          <Card className="lg:col-span-4 aesthetic-card border-zinc-100 p-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2">
              <ShieldAlert size={14} className="text-rose-500" /> Neural Coverage Gaps
            </h3>
            <div className="space-y-4">
              {(result.gapAnalysis || []).map((gap, i) => (
                <div key={i} className="p-5 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3 group hover:border-zinc-300 transition-all cursor-crosshair">
                   <div className="flex justify-between items-start">
                      <span className="text-xs font-black tracking-tight group-hover:text-zinc-950 transition-colors">"{gap.query}"</span>
                      <Badge className={gap.potentialImpact === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-orange-50 text-orange-600 border-orange-100'}>
                         {gap.potentialImpact} Impact
                      </Badge>
                   </div>
                   <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      <span>Dominant: {gap.topCompetitor}</span>
                      <ArrowUpRight size={10} className="text-rose-500" />
                   </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trend Analysis */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="aesthetic-card border-zinc-100 p-8 bg-zinc-950 text-white">
               <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                 <TrendingUp size={14} className="text-emerald-500" /> Topic Trajectories
               </h3>
               <div className="space-y-6">
                 <div>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Ascending Opportunities</p>
                   <div className="space-y-3">
                     {(result.trends?.trending || []).map((t, i) => (
                       <div key={i} className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                         <span className="text-sm font-bold tracking-tight">{t}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="pt-6 border-t border-white/5">
                   <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">Declining relevance</p>
                   <div className="space-y-3">
                     {(result.trends?.declining || []).map((t, i) => (
                       <div key={i} className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] opacity-50" />
                         <span className="text-sm font-bold text-zinc-500 tracking-tight">{t}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </Card>
          </div>

          {/* Growth Strategy */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="aesthetic-card border-zinc-100 p-8 space-y-8">
               <div className="space-y-2">
                 <h3 className="text-xl font-black tracking-tight">Content Clusters</h3>
                 <p className="text-xs text-zinc-400 font-medium">Recommended focus areas for neural saturation.</p>
               </div>
               <div className="space-y-4">
                 {(result.strategy?.content || []).map((s, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                      <div className="w-6 h-6 rounded-lg bg-zinc-200 flex items-center justify-center shrink-0">
                         <Plus size={14} />
                      </div>
                      <span className="text-sm font-bold tracking-tight">{s}</span>
                   </div>
                 ))}
               </div>
            </Card>

            <Card className="aesthetic-card border-zinc-100 p-8 space-y-8">
               <div className="space-y-2">
                 <h3 className="text-xl font-black tracking-tight">GEO Tactics</h3>
                 <p className="text-xs text-zinc-400 font-medium">Technical moves to improve LLM extraction.</p>
               </div>
               <div className="space-y-4">
                 {(result.strategy?.geo || []).map((s, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                      <div className="w-6 h-6 rounded-lg bg-zinc-200 flex items-center justify-center shrink-0">
                         <Globe size={14} />
                      </div>
                      <span className="text-sm font-bold tracking-tight">{s}</span>
                   </div>
                 ))}
               </div>
            </Card>

            <Card className="aesthetic-card border-zinc-100 p-8 md:col-span-2 bg-zinc-50">
               <div className="flex flex-col md:flex-row gap-12">
                  <div className="space-y-6 flex-1">
                     <div className="space-y-2">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                           <Zap size={20} className="text-emerald-500" /> High-Impact Actions
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium italic">Execute these steps immediately for immediate visibility shifts.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(result.strategy?.actionableSteps || []).map((step, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm group hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                             <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                             <span className="text-xs font-bold tracking-tight group-hover:text-emerald-700">{step}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="md:w-64 space-y-6">
                     <div className="p-6 bg-white rounded-[2rem] border border-zinc-200 shadow-inner">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <AlertTriangle size={12} /> Priority Warning
                        </p>
                        <p className="text-xs font-bold leading-relaxed text-zinc-600">
                           {result.strategy.positioning[0] || 'Reviewing current market signals for positioning pivot recommendations...'}
                        </p>
                     </div>
                     <Button onClick={reset} variant="ghost" className="w-full rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950">
                        Reset Engine
                     </Button>
                  </div>
               </div>
            </Card>
          </div>

          {result.actionEngine && (
            <div className="lg:col-span-12 pt-8">
              <ActionEngine actions={result.actionEngine} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
