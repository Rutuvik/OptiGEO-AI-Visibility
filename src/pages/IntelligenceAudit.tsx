import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BarChart, 
  Target, 
  Zap, 
  Activity, 
  ArrowRight, 
  Search, 
  Globe, 
  TrendingUp, 
  Cpu,
  Fingerprint,
  Info,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  Bot,
  Database,
  FileText,
  RefreshCw,
  Layout,
  Download,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button, buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { conductIntelligenceAudit } from '../lib/gemini';
import { ActionEngine } from '../components/ActionEngine';
import { toast } from 'sonner';
import { exportToJSON, exportToCSV, exportReportToPDF } from '../lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function IntelligenceAudit() {
  const [domain, setDomain] = useState('');
  const [gscData, setGscData] = useState('');
  const [claims, setClaims] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('accuracy');
  const [auditResult, setAuditResult] = useState<any>(null);

  const runAudit = async () => {
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }
    setLoading(true);
    setAuditResult(null);
    try {
      const result = await conductIntelligenceAudit({
        url: domain,
        gscData,
        claims
      });
      
      if (result) {
        setAuditResult(result);
        toast.success('System Audit Complete');
      } else {
        toast.error('Audit produced no data');
      }
    } catch (err) {
      console.error(err);
      toast.error('Audit failed across one or more modules');
    } finally {
      setLoading(false);
    }
  };

  const exportAudit = (format: 'pdf' | 'csv' | 'json') => {
    if (!auditResult) return;

    const fileName = `Intelligence_Audit_${domain.replace(/[^a-z0-9]/gi, '_')}`;

    if (format === 'json') {
      exportToJSON(auditResult, fileName);
    } else if (format === 'csv') {
      exportToCSV(auditResult.knowledgeAccuracy, `${fileName}_Accuracy`);
    } else if (format === 'pdf') {
       const sections = [
        { title: 'Intelligence Status', content: `Reliability Index: ${auditResult.overallReliabilityScore}`, type: 'text' as const },
        { title: 'Hallucination Check', content: auditResult.knowledgeAccuracy, type: 'table' as const },
        { title: 'Semantic Alignment', content: auditResult.semanticConsistency.map((s: any) => `${s.dimension}: ${s.alignmentScore}% (Truth: "${s.brandTruth}")`), type: 'list' as const },
        { title: 'Crawler Logs', content: auditResult.crawlerLogs.map((l: any) => `${l.crawler}: ${l.status}`), type: 'list' as const },
      ];
      exportReportToPDF(`Deep Intelligence Audit: ${domain}`, sections);
    }
    toast.success(`Exporting as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-10 pb-20 text-left animate-fade-in">
       <header className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-800">
                <ShieldCheck size={12} className="text-emerald-400" /> Intelligence Audit v4.1
             </div>
             <h2 className="text-4xl font-black tracking-tighter text-zinc-950">Deep Model Assessment</h2>
             <p className="text-zinc-500 font-medium max-w-lg">Verify brand accuracy, measure semantic drift, and audit bot accessibility across global LLM nodes.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <Button 
                onClick={runAudit}
                disabled={loading}
                className="bg-zinc-950 text-white rounded-2xl px-10 h-14 font-black shadow-2xl shadow-zinc-950/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
             >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw size={18} className="mr-2" />}
                Initiate Full Audit
             </Button>
          </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-6">
             <Card className="aesthetic-card p-8 space-y-6 border-zinc-200">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Domain Source</label>
                      <Input 
                         value={domain}
                         onChange={(e) => setDomain(e.target.value)}
                         placeholder="e.g. acmecorp.com"
                         className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-12 font-bold text-zinc-900 dark:text-zinc-100"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Search Console Data</label>
                      <textarea 
                         value={gscData}
                         onChange={(e) => setGscData(e.target.value)}
                         placeholder="Paste GSC query insights or CSV data..."
                         className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs font-bold text-zinc-950 dark:text-zinc-100 outline-none focus:border-zinc-950 dark:focus:border-zinc-50 transition-all custom-scrollbar"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Key Factual Claims</label>
                      <textarea 
                         value={claims}
                         onChange={(e) => setClaims(e.target.value)}
                         placeholder="List claims to verify (e.g. Founder name, market position)..."
                         className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs font-bold text-zinc-950 dark:text-zinc-100 outline-none focus:border-zinc-950 dark:focus:border-zinc-50 transition-all custom-scrollbar"
                      />
                   </div>
                </div>
             </Card>

             {auditResult && (
               <Card className="bg-zinc-950 text-white p-10 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                     <Fingerprint size={120} />
                  </div>
                  <div className="relative z-10 space-y-6">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Reliability Index</span>
                        <div className="text-7xl font-black tracking-tighter my-2">{auditResult.overallReliabilityScore}</div>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-4 h-7 text-[9px] font-black uppercase">
                           High Confidence Rank
                        </Badge>
                     </div>
                     <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">
                        "Your brand exhibits a {auditResult.overallReliabilityScore}% alignment with latent training data. Critical hallucination risks detected in secondary service claims."
                     </p>
                  </div>
               </Card>
             )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center justify-between border-b border-zinc-100 pr-4">
               <div className="flex overflow-x-auto no-scrollbar">
                  {[
                    { id: 'accuracy', label: 'Hallucination Check', icon: Eye },
                    { id: 'semantic', label: 'Semantic Drift', icon: Activity },
                    { id: 'crawlers', label: 'Bot Accessibility', icon: Bot }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative shrink-0 ${activeTab === tab.id ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div layoutId="tab-underline-audit" className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-950" />
                      )}
                    </button>
                  ))}
               </div>
               
               {auditResult && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className={cn(buttonVariants({ size: "sm" }), "bg-zinc-950 text-white rounded-xl h-8 font-black uppercase text-[9px] tracking-widest px-4 flex items-center")}>
                      <Download size={12} className="mr-2"/> Export
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-zinc-200 rounded-xl overflow-hidden min-w-[140px]">
                      <DropdownMenuItem onClick={() => exportAudit('pdf')} className="flex items-center gap-2 p-3 text-[10px] font-bold cursor-pointer hover:bg-zinc-50">
                        <FileText size={14} className="text-rose-500" /> PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportAudit('csv')} className="flex items-center gap-2 p-3 text-[10px] font-bold cursor-pointer hover:bg-zinc-50">
                        <FileSpreadsheet size={14} className="text-emerald-500" /> CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportAudit('json')} className="flex items-center gap-2 p-3 text-[10px] font-bold cursor-pointer hover:bg-zinc-50">
                        <FileJson size={14} className="text-amber-500" /> JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               )}
             </div>

             <div className="min-h-[600px] relative">
                <AnimatePresence mode="wait">
                  {!auditResult && !loading ? (
                    <motion.div 
                      key="empty-audit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-[3rem] p-20 text-center"
                    >
                       <Database size={48} className="text-zinc-200 mb-6" strokeWidth={1} />
                       <h3 className="text-xl font-black text-zinc-400 uppercase tracking-widest leading-tight">Intelligence Engine Idle</h3>
                       <p className="text-xs text-zinc-400 font-bold mt-2 max-w-sm">Synchronize your search insights and factual claims to run a global model consistency audit.</p>
                    </motion.div>
                  ) : loading ? (
                    <motion.div 
                      key="loading-audit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center"
                    >
                       <div className="relative mb-8">
                          <div className="w-24 h-24 border-4 border-zinc-100 rounded-full" />
                          <motion.div 
                             animate={{ rotate: 360 }}
                             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                             className="absolute inset-0 border-4 border-zinc-950 border-t-transparent rounded-full"
                          />
                          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-400" size={32} />
                       </div>
                       <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-950 animate-pulse">Running Cross-Model Verification...</p>
                       <p className="text-xs text-zinc-400 font-bold mt-2">Checking claims against Perplexity, ChatGPT, and Gemini indices.</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                       {activeTab === 'accuracy' && (
                          <div className="aesthetic-card p-0 overflow-hidden border-zinc-200 shadow-xl rounded-[2.5rem]">
                             <div className="bg-zinc-50 p-8 border-b border-zinc-100">
                                <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                                   <Eye size={16} className="text-amber-500" /> Hallucination Probability Report
                                </h4>
                             </div>
                             <table className="w-full text-left">
                                <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                   <tr>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Claim to Verify</th>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Accuracy</th>
                                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Foundational Source</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                   {(auditResult.knowledgeAccuracy || []).map((item: any, i: number) => (
                                      <tr key={i} className="group hover:bg-zinc-50 transition-colors">
                                         <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                               <span className="text-sm font-bold tracking-tight text-zinc-900">"{item.claim}"</span>
                                               <div className="flex gap-2">
                                                  <Badge className={`text-[8px] font-black uppercase px-2 h-5 border-none ${item.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600' : item.status === 'Hallucinated' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                     {item.status}
                                                  </Badge>
                                               </div>
                                            </div>
                                         </td>
                                         <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                               <div className="flex-1 h-1.5 w-24 bg-zinc-100 rounded-full overflow-hidden">
                                                  <div className={`h-full ${item.accuracyScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${item.accuracyScore}%` }} />
                                               </div>
                                               <span className="text-xs font-black">{item.accuracyScore}%</span>
                                            </div>
                                         </td>
                                         <td className="px-8 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                                            {item.discoverySource}
                                         </td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       )}

                       {activeTab === 'semantic' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {(auditResult.semanticConsistency || []).map((item: any, i: number) => (
                                <Card key={i} className="aesthetic-card p-10 space-y-8 group overflow-hidden border-zinc-200 shadow-xl rounded-[2.5rem]">
                                   <div className="flex items-center justify-between">
                                      <div className="space-y-1">
                                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Semantic Vector</span>
                                         <h4 className="text-2xl font-black text-zinc-950">{item.dimension}</h4>
                                      </div>
                                      <div className="text-right">
                                         <div className="text-3xl font-black text-zinc-950">{item.alignmentScore}%</div>
                                         <span className="text-[9px] font-black text-emerald-500 uppercase">Alignment</span>
                                      </div>
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-8 relative z-10">
                                      <div className="space-y-2">
                                         <div className="flex items-center gap-2">
                                            <CheckCircle2 size={12} className="text-zinc-900" />
                                            <span className="text-[9px] font-black uppercase text-zinc-600">Brand Truth</span>
                                         </div>
                                         <p className="text-[11px] font-medium text-zinc-500 leading-relaxed italic">"{item.brandTruth}"</p>
                                      </div>
                                      <div className="space-y-2">
                                         <div className="flex items-center gap-2">
                                            <TrendingUp size={12} className="text-zinc-900" />
                                            <span className="text-[9px] font-black uppercase text-zinc-600">AI Perception</span>
                                         </div>
                                         <p className="text-[11px] font-medium text-zinc-500 leading-relaxed italic">"{item.aiPerception}"</p>
                                      </div>
                                   </div>

                                   <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                      <motion.div 
                                         initial={{ width: 0 }}
                                         animate={{ width: `${item.alignmentScore}%` }}
                                         className="h-full bg-zinc-950"
                                      />
                                   </div>
                                </Card>
                             ))}
                          </div>
                       )}

                       {activeTab === 'crawlers' && (
                          <div className="space-y-6">
                             {(auditResult.crawlerLogs || []).map((log: any, i: number) => (
                                <Card key={i} className="aesthetic-card p-8 border-zinc-200 shadow-lg rounded-[2rem] group hover:bg-zinc-50 transition-all">
                                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                      <div className="flex items-center gap-6">
                                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${log.status === 'Active' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                            <Bot size={28} className="group-hover:scale-110 transition-transform" />
                                         </div>
                                         <div>
                                            <div className="flex items-center gap-3">
                                               <h4 className="text-lg font-black text-zinc-950">{log.crawler}</h4>
                                               <Badge className={`${log.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'} border-none text-[8px] font-black uppercase`}>
                                                  {log.status}
                                               </Badge>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Visit Frequency: {log.frequency}</p>
                                         </div>
                                      </div>
                                      <div className="flex-1 max-w-md">
                                         <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-zinc-200">
                                            <Zap size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                            <p className="text-[11px] font-medium text-zinc-600 leading-relaxed">{log.recommendations}</p>
                                         </div>
                                      </div>
                                   </div>
                                </Card>
                             ))}
                          </div>
                       )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {auditResult && auditResult.actionEngine && (
                  <div className="pt-12">
                    <ActionEngine actions={auditResult.actionEngine} />
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}
