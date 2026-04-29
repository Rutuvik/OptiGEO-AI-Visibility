import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  BarChart, 
  Search, 
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { exportToJSON, exportToCSV, exportReportToPDF } from '../lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button, buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

const COLORS = ['#18181b', '#059669', '#d97706', '#e11d48'];

export default function VisibilityReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, domain } = location.state || {};

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <BrainCircuit size={48} className="text-zinc-300" />
        <h2 className="text-xl font-bold">No active scan data found</h2>
        <p className="text-muted-foreground text-sm">Please initiate a scan from the Visibility Tracker first.</p>
        <button onClick={() => navigate('/visibility')} className="px-6 py-2 bg-zinc-950 text-white rounded-xl text-sm font-bold">
          Go to Visibility Tracker
        </button>
      </div>
    );
  }

  const { score, level, engineBreakdown, queryLevelResults, kpiAudit } = result;
  
  // Provide an empty array fallback if queryLevelResults is somehow missing
  const safeQueryResults = queryLevelResults || [];

  const chartData = useMemo(() => {
    return engineBreakdown.map((e: any) => ({
      name: e.name,
      presence: e.presenceRate,
      mentions: e.mentions
    }));
  }, [engineBreakdown]);

  const queryPerformance = useMemo(() => {
    const total = safeQueryResults.length;
    if (total === 0) return [{ name: 'Missing', value: 1 }];
    const appeared = safeQueryResults.filter((q: any) => q.appeared).length;
    return [
      { name: 'Visible', value: appeared },
      { name: 'Missing', value: total - appeared }
    ];
  }, [safeQueryResults]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 24 
      } 
    }
  };

  const exportReport = (format: 'pdf' | 'csv' | 'json') => {
    const fileName = `Visibility_Report_${domain.replace(/[^a-z0-9]/gi, '_')}`;

    if (format === 'json') {
      exportToJSON(result, fileName);
    } else if (format === 'csv') {
      exportToCSV(safeQueryResults, `${fileName}_Queries`);
    } else if (format === 'pdf') {
       const sections = [
        { title: 'Executive Summary', content: kpiAudit?.summary, type: 'text' as const },
        { title: 'Overall Score', content: `Score: ${score}/100 - ${level} Presence`, type: 'text' as const },
        { title: 'Engine Breakdown', content: engineBreakdown, type: 'table' as const },
        { title: 'Query Analysis', content: safeQueryResults.map((q: any) => ({
            Query: q.query,
            Status: q.appeared ? 'Visible' : 'Missing',
            Position: q.positionLabel,
            Sentiment: q.sentiment
          })), type: 'table' as const },
      ];
      exportReportToPDF(`AI Visibility Report: ${domain}`, sections);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-20 text-left"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/visibility')}
            className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Visibility Detailed Report</h1>
            <p className="text-sm font-medium text-muted-foreground tracking-wide">Analysis for {domain}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({}), "bg-zinc-950 text-white rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-zinc-950/20 flex items-center")}>
            <Download size={16} className="mr-2" /> Export Report
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-zinc-200 rounded-xl overflow-hidden min-w-[160px]">
            <DropdownMenuItem onClick={() => exportReport('pdf')} className="flex items-center gap-2 p-3 text-xs font-bold cursor-pointer hover:bg-zinc-50">
              <FileText size={14} className="text-rose-500" /> PDF Report
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportReport('csv')} className="flex items-center gap-2 p-3 text-xs font-bold cursor-pointer hover:bg-zinc-50">
              <FileSpreadsheet size={14} className="text-emerald-500" /> CSV Queries
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportReport('json')} className="flex items-center gap-2 p-3 text-xs font-bold cursor-pointer hover:bg-zinc-50">
              <FileJson size={14} className="text-amber-500" /> JSON Raw
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* KPI Derivation Hero */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-zinc-950 text-white rounded-[32px] p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800/50 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="text-emerald-500" size={24} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Score Derivation</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
              {score}<span className="text-zinc-500 text-3xl">/100</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed font-medium mb-6">
              The AI Visibility KPI is a fully deterministic metric computed mathematically from the <b>Presence Rate</b> across Major LLMs (ChatGPT, Gemini, Perplexity, Claude), factored by domain authority heuristics.
            </p>
            <div className="flex flex-wrap items-center gap-4">
               <span className="px-4 py-2 bg-white text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-lg">
                 {level} Presence
               </span>
               <span className="text-xs text-zinc-500 font-medium">Derived from {engineBreakdown.length} target vectors</span>
               {result.sentimentLayer?.score > 0 && (
                 <span className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest rounded-lg">
                   Sentiment: {result.sentimentLayer.score}/100
                 </span>
               )}
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-zinc-300">Executive Summary</h3>
            <p className="text-sm leading-relaxed text-zinc-300 mb-6">{kpiAudit?.summary || "No summary available."}</p>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-900 rounded-xl p-4">
                 <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Technical Health</div>
                 <div className="text-sm font-black flex items-center gap-2">
                   Schema: {kpiAudit?.technicalHealth?.schema || 0}%
                 </div>
               </div>
               <div className="bg-zinc-900 rounded-xl p-4">
                 <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Intent Coverage</div>
                 <div className="text-sm font-black text-emerald-400">
                   Info: {kpiAudit?.intentCoverage?.informational || 0}%
                 </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engine Breakdown Chart */}
        <div className="aesthetic-card p-8">
          <h3 className="text-sm font-bold tracking-tight mb-6">Presence Rate per Engine</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="presence" fill="#18181b" radius={[4, 4, 0, 0]} name="Presence %" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

         {/* Query Representation */}
         <div className="aesthetic-card p-8 flex flex-col">
            <h3 className="text-sm font-bold tracking-tight mb-6">Query Survival Rate</h3>
            <div className="flex-1 flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height={300}>
                 <PieChart>
                   <Pie
                     data={queryPerformance}
                     cx="50%"
                     cy="50%"
                     innerRadius={80}
                     outerRadius={110}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {queryPerformance.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f4f4f5'} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black">{Math.round((queryPerformance[0].value / (queryPerformance[0].value + queryPerformance[1].value)) * 100)}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Found</span>
               </div>
            </div>
         </div>
      </motion.div>

      {/* Structured Engine Table */}
      <motion.div variants={itemVariants} className="aesthetic-card overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
           <Zap className="text-amber-500" size={18} />
           <h3 className="text-sm font-bold tracking-tight">Model-by-Model Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              <tr>
                <th className="px-6 py-4">AI Model</th>
                <th className="px-6 py-4">Visibility Score</th>
                <th className="px-6 py-4">Target Mentions</th>
                <th className="px-6 py-4">Saturation Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {[...engineBreakdown].sort((a: any, b: any) => b.score - a.score).map((engine: any, i: number) => (
                <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">#{i + 1}</span>
                    {engine.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-zinc-100 rounded-full h-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-zinc-950" style={{ width: `${engine.score}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{engine.mentions} Citations</td>
                  <td className="px-6 py-4 text-zinc-500">{engine.presenceRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Query-Level Insights */}
      <motion.div variants={itemVariants} className="aesthetic-card overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
           <div className="flex items-center gap-3">
             <Search className="text-indigo-500" size={18} />
             <h3 className="text-sm font-bold tracking-tight">Query-Level Dominance</h3>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              <tr>
                <th className="px-6 py-4">Target Query</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Shortlist</th>
                <th className="px-6 py-4 text-right">Semantic Tone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {safeQueryResults.map((qr: any, i: number) => (
                <tr key={i} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium w-1/3">"{qr.query}"</td>
                  <td className="px-6 py-4 text-center">
                    {qr.appeared ? (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                         <CheckCircle2 size={12} /> Discovered
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700">
                         <AlertTriangle size={12} /> Missing
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-sm font-bold">{qr.positionLabel}</span>
                     {qr.avgPosition && <span className="text-xs text-muted-foreground ml-2">(Rank {qr.avgPosition})</span>}
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${qr.shortlistPresence.includes('Top') ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                       <span className="text-xs font-semibold">{qr.shortlistPresence}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                     <span className={qr.sentiment === 'Positive' ? 'text-emerald-600' : qr.sentiment === 'Negative' ? 'text-rose-600' : 'text-zinc-600'}>
                       {qr.sentiment}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Narrative Alerts */}
      {result.sentimentLayer?.narrativeAlerts && result.sentimentLayer.narrativeAlerts.length > 0 && (
        <motion.div variants={itemVariants} className="aesthetic-card overflow-hidden border-rose-100">
          <div className="p-6 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
             <div className="flex items-center gap-3">
               <AlertTriangle className="text-rose-500" size={18} />
               <h3 className="text-sm font-bold tracking-tight text-rose-900">Critical False Narratives Detected</h3>
             </div>
          </div>
          <div className="p-6 space-y-4">
             {result.sentimentLayer.narrativeAlerts.map((alert: any, idx: number) => (
                <div key={idx} className="p-4 bg-white rounded-xl border border-rose-100 flex items-start gap-4">
                   <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertTriangle size={14} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-zinc-900 mb-1">{alert.narrative}</p>
                      {alert.correction && (
                         <p className="text-xs text-zinc-600">
                           <span className="font-semibold text-zinc-900">Correction Needed:</span> {alert.correction}
                         </p>
                      )}
                   </div>
                </div>
             ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
