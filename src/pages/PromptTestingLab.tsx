import React, { useState, useEffect } from 'react';
import { refinePromptWithBenchmarking } from '../lib/gemini';
import { 
  Terminal, 
  Play, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Quote, 
  Cpu, 
  FlaskConical, 
  Fingerprint,
  Mic2,
  Share2,
  Copy,
  Microscope,
  Command,
  ChevronRight,
  TrendingUp,
  Wand2,
  CheckCircle2,
  Zap,
  Split,
  BarChart2,
  RefreshCw,
  Plus,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Cell
} from 'recharts';
import { toast } from 'sonner';
import { useAppStore } from '../lib/store';

export default function PromptTestingLab() {
  const { reports, setReport, clearReport } = useAppStore();
  const persistedData = reports.promptTestingLab;

  const [starterPrompt, setStarterPrompt] = useState(() => persistedData?.input?.starterPrompt || '');
  const [variables, setVariables] = useState(() => persistedData?.input?.variables || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(persistedData?.result || null);
  const [selectedModel, setSelectedModel] = useState(() => persistedData?.input?.selectedModel || 'Gemini 3.1 Flash');

  useEffect(() => {
    if (persistedData) {
      if (persistedData.input?.starterPrompt) setStarterPrompt(persistedData.input.starterPrompt);
      if (persistedData.input?.variables) setVariables(persistedData.input.variables);
      if (persistedData.input?.selectedModel) setSelectedModel(persistedData.input.selectedModel);
      if (persistedData.result) setResult(persistedData.result);
    }
  }, []);

  const models = ['Gemini 3.1 Flash', 'GPT-4o', 'Claude 3.5 Sonnet', 'Perplexity'];

  const handleRefine = async () => {
    if (!starterPrompt) {
      toast.error('Starter prompt is required');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await refinePromptWithBenchmarking({
        starterPrompt,
        targetModel: selectedModel,
        variables
      });
      
      if (!data) throw new Error("Refinement failed");
      setResult(data);
      setReport('promptTestingLab', { starterPrompt, variables, selectedModel }, data);
      toast.success('Prompt Engineering Complete');
    } catch (err) {
      console.error(err);
      toast.error('Refinement Interrupted');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500 text-left">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-800">
              <FlaskConical size={12} className="text-indigo-400" /> Research Workbench v2.1
           </div>
           <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">Prompt Analysis Lab</h2>
           <p className="text-zinc-500 text-sm font-medium max-w-xl leading-relaxed">
              Test and refine specific queries used to monitor and influence AI responses. Compare phrasing impact and optimize for clarity and authority.
           </p>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 gap-1 h-fit">
           {models.map(m => (
             <button
               key={m}
               onClick={() => setSelectedModel(m)}
               className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${selectedModel === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
             >
               {m}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden group rounded-[2.5rem]">
               <CardHeader className="bg-zinc-50 dark:bg-zinc-900/40 p-6 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-4">
                     <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-zinc-500">
                        <Terminal size={14} className="text-indigo-500" /> Workbench Parameters
                     </CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Starter Prompt</label>
                     <textarea 
                       value={starterPrompt}
                       onChange={(e) => setStarterPrompt(e.target.value)}
                       placeholder="Enter your initial query here..."
                       className="w-full h-32 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-zinc-200 font-sans text-sm outline-none resize-none focus:border-indigo-500 transition-all custom-scrollbar"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Context / Custom Variables</label>
                     <Input 
                       value={variables}
                       onChange={(e) => setVariables(e.target.value)}
                       placeholder="e.g. act as a skeptical buyer, emphasize privacy"
                       className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 h-12 rounded-2xl text-zinc-900 dark:text-zinc-200 font-bold"
                     />
                     <p className="text-[9px] text-zinc-400 font-black uppercase tracking-tighter">Adds constraints or personas to the refinement process.</p>
                  </div>

                  <Button 
                    onClick={handleRefine}
                    disabled={loading || !starterPrompt}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 size={18} className="mr-2" />}
                    Refine Query Architecture
                  </Button>

                  {result && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        clearReport('promptTestingLab');
                        setStarterPrompt('');
                        setVariables('');
                        setResult(null);
                        toast.info('Lab reset');
                      }}
                      className="w-full h-14 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-sm transition-all mt-4"
                    >
                      <XCircle size={18} className="mr-2 text-rose-500" /> Reset Lab
                    </Button>
                  )}
               </CardContent>
            </Card>

            {result && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                 <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-8 space-y-6 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Optimization Output</h3>
                       <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase">Validated Variant</Badge>
                    </div>
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 group relative">
                       <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 leading-relaxed italic">"{result.refinedPrompt}"</p>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="absolute top-2 right-2 h-8 w-8 text-zinc-400 hover:text-indigo-600 transition-opacity"
                         onClick={() => copyToClipboard(result.refinedPrompt)}
                       >
                          <Copy size={14} />
                       </Button>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deployment Recommendations</p>
                       <div className="space-y-2">
                          {result.optimizationTips.map((tip: string, i: number) => (
                             <div key={i} className="flex gap-3 text-left">
                                <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 leading-normal">{tip}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 </Card>
              </motion.div>
            )}
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7">
           <AnimatePresence mode="wait">
           {loading ? (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="h-full min-h-[600px] bg-zinc-50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12"
             >
                <div className="relative mb-8">
                   <div className="w-24 h-24 rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-indigo-600 animate-spin" />
                   <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Deconstructing Semantic Impact</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.2em] mt-4 animate-pulse">Running comparative analysis</p>
             </motion.div>
           ) : result ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-8"
             >
                {/* Score Comparison */}
                <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-xl">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Performance Metrics</h3>
                         <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Refined query effectiveness score</p>
                      </div>
                      <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                         <BarChart2 size={24} />
                      </div>
                   </div>
                   <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={result.qualityScores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="objective" stroke="#94a3b8" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} />
                            <Tooltip 
                              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '20px' }} />
                            <Bar dataKey="starterScore" name="Original" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="refinedScore" name="Refined" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </Card>

                {/* Side by Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {result.comparisonResponses.map((resp: any, i: number) => (
                      <Card key={i} className={`bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-lg ${resp.version === 'Refined' ? 'ring-2 ring-indigo-500/20' : ''}`}>
                         <CardHeader className={`${resp.version === 'Refined' ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'bg-zinc-50 dark:bg-zinc-900/40'} p-6 border-b border-zinc-100 dark:border-zinc-800`}>
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-xl ${resp.version === 'Refined' ? 'bg-indigo-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                                     {resp.version === 'Refined' ? <Zap size={16} /> : <Play size={16} />}
                                  </div>
                                  <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{resp.version} Response</CardTitle>
                               </div>
                               <Badge className={`${resp.version === 'Refined' ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'} border-none font-black text-[8px] uppercase`}>
                                  Simulated Output
                               </Badge>
                            </div>
                         </CardHeader>
                         <CardContent className="p-8 flex-1 flex flex-col space-y-6">
                            <div className="flex-1">
                               <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic">"{resp.response}"</p>
                            </div>
                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                               <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Quality Audit</label>
                               <p className="text-[10px] font-bold text-zinc-500 leading-relaxed italic">{resp.qualityAudit}</p>
                            </div>
                         </CardContent>
                      </Card>
                   ))}
                </div>
             </motion.div>
           ) : (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="h-full min-h-[600px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-20 bg-zinc-50/50 dark:bg-zinc-900/10"
             >
                <div className="w-24 h-24 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-8">
                   <Microscope size={40} className="text-zinc-300 dark:text-zinc-700" strokeWidth={1} />
                </div>
                <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Analysis Terminal Idle</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-4 max-w-sm leading-relaxed">
                   Initiate prompt refinement to deconstruct how structural phrasing changes influence generative engine authority.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-md">
                   {[
                     { label: "Refinement", icon: Wand2 },
                     { label: "Contrast", icon: Split },
                     { label: "Scoring", icon: BarChart2 },
                     { label: "Auditing", icon: RefreshCw }
                   ].map(feat => (
                     <div key={feat.label} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 shadow-sm">
                        <feat.icon size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{feat.label}</span>
                     </div>
                   ))}
                </div>
             </motion.div>
           )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

