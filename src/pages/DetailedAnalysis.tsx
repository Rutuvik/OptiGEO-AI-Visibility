import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Zap, 
  BarChart3, 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Target,
  LineChart as LineChartIcon,
  Layers,
  Database,
  Cpu,
  Fingerprint,
  Info,
  ChevronRight,
  ClipboardList,
  Sparkles,
  Map as MapIcon,
  MessageSquare,
  AlertOctagon,
  Download,
  Share2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { performDetailedAnalysis } from '../lib/gemini';
import { ActionEngine } from '../components/ActionEngine';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function DetailedAnalysis() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalysis = async () => {
    if (!domain) {
      toast.error('Please enter a valid domain');
      return;
    }
    setLoading(true);
    try {
      const result = await performDetailedAnalysis(domain);
      if (result) {
        setData(result);
        toast.success('Deep analysis synchronization complete');
      } else {
        toast.error('Neural engine failed to produce valid audit');
      }
    } catch (error) {
      console.error(error);
      toast.error('System interruption during deep-dive');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="relative">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             className="w-32 h-32 rounded-full border-b-2 border-zinc-950 dark:border-white" 
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="w-10 h-10 text-zinc-950 dark:text-white animate-pulse" />
           </div>
        </div>
        <div className="text-center space-y-2">
           <h3 className="text-xl font-black uppercase tracking-widest">Neural Deep-Dive in Progress</h3>
           <p className="text-zinc-500 text-sm font-medium animate-pulse">Synchronizing global AI mentions, competitor visibility, and semantic clusters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500 text-left">
      {/* Header & Input */}
      <header className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 py-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-zinc-800">
            <Sparkles size={12} className="text-amber-400" /> Research & Strategy Engine v4.0
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">Detailed Analysis</h2>
          <p className="text-zinc-500 text-sm font-medium max-w-xl leading-relaxed">
            Execute a comprehensive GEO audit and strategic growth plan. Deep-scan AI visibility, competitor overlaps, and semantic accuracy with real-time grounding.
          </p>
        </div>
        
        <div className="flex w-full lg:w-fit gap-3">
           <div className="relative w-full lg:w-80">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <Input 
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="domain.com"
                className="pl-11 h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold shadow-sm text-zinc-900 dark:text-zinc-100"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalysis()}
              />
           </div>
           <Button 
            onClick={handleAnalysis}
            className="h-14 px-8 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
           >
             <Zap size={18} className="mr-2" /> Run Protocol
           </Button>
        </div>
      </header>

      {!data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: 'AI Visibility Matrix', icon: Target, desc: 'Analyze mentions and citations across LLMs.' },
             { title: 'Competitor Intelligence', icon: BarChart3, desc: 'Auto-detect and benchmark against rivals.' },
             { title: 'Strategic Action Plan', icon: ClipboardList, desc: 'Step-by-step roadmap for GEO growth.' }
           ].map((card, i) => (
             <Card key={i} className="bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] border-dashed">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center mb-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                   <card.icon size={24} className="text-zinc-400" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest mb-2">{card.title}</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{card.desc}</p>
             </Card>
           ))}
        </div>
      ) : (
        <div className="space-y-12">
           {/* Navigation Tabs */}
           <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
              {['overview', 'keywords', 'competitors', 'geographic', 'content', 'strategy'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-lg' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                >
                  {tab}
                </button>
              ))}
           </div>

           <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                   {/* Scores Overview */}
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {[
                        { label: 'Overall Perf', value: data.performanceScore, icon: Zap },
                        { label: 'Visibility', value: data.visibilityScore, icon: BarChart3 },
                        { label: 'Sentiment', value: data.sentimentScore, icon: MessageSquare },
                        { label: 'Accuracy', value: data.accuracyRating, icon: ShieldAlert }
                      ].map((score, i) => (
                        <Card key={i} className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                              <score.icon size={64} />
                           </div>
                           <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">{score.label}</h4>
                           <div className="flex items-end gap-1">
                              <span className={`text-5xl font-black tracking-tighter ${getScoreColor(score.value)}`}>{score.value}</span>
                              <span className="text-zinc-400 font-bold mb-2">/100</span>
                           </div>
                           <Progress value={score.value} className="h-1.5 mt-6 bg-zinc-100 dark:bg-zinc-900" 
                             style={{ '--progress-foreground': score.value >= 80 ? '#10b981' : score.value >= 
                             50 ? '#f59e0b' : '#f43f5e' } as any} />
                        </Card>
                      ))}
                   </div>

                   {/* AI Visibility Card */}
                   <Card className="bg-zinc-950 text-white border-none rounded-[3rem] p-12 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent flex items-center justify-center">
                         <LineChartIcon size={240} className="opacity-5 rotate-12" strokeWidth={1} />
                      </div>
                      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                         <div className="space-y-8">
                            <div>
                               <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase mb-4">Neural Footprint</Badge>
                               <h3 className="text-4xl font-black tracking-tighter mb-4">AI Model Visibility Audit</h3>
                               <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm">
                                  {data.aiVisibility.insights}
                               </p>
                            </div>
                            <div className="flex gap-12">
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Est. Mentions</p>
                                  <p className="text-3xl font-black text-white">{data.aiVisibility.mentions.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Citations</p>
                                  <p className="text-3xl font-black text-white">{data.aiVisibility.citations.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                               <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Dominant AI Position</p>
                               <p className="text-lg font-bold text-white flex items-center gap-2">
                                  <Target className="text-emerald-400" size={18} /> {data.aiVisibility.position}
                               </p>
                            </div>
                         </div>
                         <div className="h-[300px] bg-zinc-900 rounded-[2.5rem] border border-white/5 p-8">
                             {/* Small Gauge for Score */}
                             <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart 
                                  cx="50%" cy="50%" 
                                  innerRadius="60%" outerRadius="100%" 
                                  barSize={20} 
                                  data={[
                                    { name: 'Visibility', value: data.visibilityScore, fill: '#10b981' },
                                    { name: 'Accuracy', value: data.accuracyRating, fill: '#3b82f6' }
                                  ]}
                                >
                                  <RadialBar
                                    background
                                    dataKey="value"
                                    cornerRadius={10}
                                  />
                                  <Legend iconSize={10} verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                </RadialBarChart>
                             </ResponsiveContainer>
                         </div>
                      </div>
                   </Card>
                </motion.div>
              )}

              {activeTab === 'keywords' && (
                <motion.div 
                  key="keywords"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-xl">
                         <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Semantic Core Analysis</h3>
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                               <TrendingUp size={16} />
                            </div>
                         </div>
                         <div className="space-y-6">
                            <div>
                               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Top Keyword Entities</p>
                               <div className="flex flex-wrap gap-2">
                                  {(data.keywords?.top || []).map((kw: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-1 font-bold">{kw}</Badge>
                                  ))}
                               </div>
                            </div>
                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Trending Semantic Clusters</p>
                               <div className="flex flex-wrap gap-2">
                                  {(data.keywords?.trending || []).map((kw: string, i: number) => (
                                    <Badge key={i} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none rounded-lg px-3 py-1 font-black uppercase text-[9px]">{kw}</Badge>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </Card>

                      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-xl flex flex-col">
                         <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vulnerability & Gaps</h3>
                            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
                               <AlertTriangle size={16} />
                            </div>
                         </div>
                         <div className="space-y-6 flex-1">
                            <div>
                               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 text-rose-500">Declining Authority</p>
                               <div className="flex flex-wrap gap-2">
                                  {(data.keywords?.declining || []).map((kw: string, i: number) => (
                                    <Badge key={i} className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none rounded-lg px-3 py-1 font-black uppercase text-[9px]">{kw}</Badge>
                                  ))}
                               </div>
                            </div>
                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 text-amber-500">Neural Gaps detected</p>
                               <div className="space-y-2">
                                  {(data.keywords?.gaps || []).map((gap: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                       <ArrowRight size={12} className="text-amber-500" />
                                       <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{gap}</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </Card>
                   </div>
                </motion.div>
              )}

              {activeTab === 'competitors' && (
                <motion.div 
                  key="competitors"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                   <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-xl">
                      <div className="flex items-center justify-between mb-10">
                         <div>
                            <h3 className="text-2xl font-black tracking-tight">Competitor Benchmark</h3>
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">Cross-brand visibility comparison</p>
                         </div>
                         <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs"><Download size={14} className="mr-2" /> Export</Button>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                         <div className="lg:col-span-8 h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={data.competitors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                                  <YAxis hide />
                                  <Tooltip 
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                  />
                                  <Bar dataKey="visibility" radius={[10, 10, 0, 0]}>
                                     {(data.competitors || []).map((entry: any, index: number) => (
                                       <Cell key={`cell-${index}`} fill={index === 0 ? '#18181b' : '#d4d4d8'} />
                                     ))}
                                  </Bar>
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="lg:col-span-4 space-y-6">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Shared Keyword Overlaps</p>
                            <div className="space-y-4">
                               {data.competitors.map((comp: any, i: number) => (
                                 <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between mb-2">
                                       <span className="text-xs font-black uppercase">{comp.name}</span>
                                       <Badge className="bg-zinc-950 text-white text-[8px] font-black">{comp.overlap}</Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                       {(comp.sharedKeywords || []).slice(0, 3).map((kw: string, j: number) => (
                                         <span key={j} className="text-[9px] font-bold text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md">{kw}</span>
                                       ))}
                                       {comp.sharedKeywords.length > 3 && (
                                         <span className="text-[9px] font-bold text-zinc-400 px-2 py-0.5">+{comp.sharedKeywords.length - 3} more</span>
                                       )}
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </Card>
                </motion.div>
              )}

              {activeTab === 'geographic' && (
                <motion.div 
                  key="geographic"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-xl">
                         <div className="flex items-center justify-between mb-10">
                            <div>
                               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Regional Visibility Score</h3>
                               <p className="text-2xl font-black tracking-tight mt-1">Global Intelligence Grid</p>
                            </div>
                            <div className="p-3 bg-zinc-900 rounded-2xl">
                               <Globe size={20} className="text-indigo-400" />
                            </div>
                         </div>
                         <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={data.regionalVisibility} layout="vertical" margin={{ left: 40, right: 30 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                  <XAxis type="number" hide domain={[0, 100]} />
                                  <YAxis 
                                    dataKey="region" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    fontSize={10} 
                                    fontWeight="black" 
                                    width={100}
                                  />
                                  <Tooltip />
                                  <Bar dataKey="visibility" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={20} />
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                      </Card>

                      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-xl">
                         <div className="flex items-center justify-between mb-10">
                            <div>
                               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product & Service Trends</h3>
                               <p className="text-2xl font-black tracking-tight mt-1">Market Sentiment Pulse</p>
                            </div>
                            <div className="p-3 bg-zinc-900 rounded-2xl">
                               <TrendingUp size={20} className="text-emerald-400" />
                            </div>
                         </div>
                         <div className="space-y-4">
                            {(data.productTrends || []).map((trend: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                 <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${trend.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : trend.trend === 'down' ? 'bg-rose-500/10 text-rose-600' : 'bg-zinc-500/10 text-zinc-600'}`}>
                                       {trend.trend === 'up' ? <TrendingUp size={16} /> : trend.trend === 'down' ? <TrendingDown size={16} /> : <RefreshCw size={16} />}
                                    </div>
                                    <div>
                                       <p className="text-sm font-black uppercase tracking-tight">{trend.item}</p>
                                       <p className="text-[10px] text-zinc-500 font-bold">{trend.sentiment}</p>
                                    </div>
                                 </div>
                                 <Badge className={`border-none font-black text-[8px] uppercase ${trend.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : trend.trend === 'down' ? 'bg-rose-500/10 text-rose-600' : 'bg-zinc-200 text-zinc-500'}`}>
                                    {trend.trend}
                                 </Badge>
                              </div>
                            ))}
                         </div>
                      </Card>
                   </div>
                </motion.div>
              )}

              {activeTab === 'content' && (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-6">
                         <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-xl overflow-hidden relative">
                            <div className="absolute -top-10 -right-10 opacity-5">
                               <Fingerprint size={160} />
                            </div>
                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-8">Structural Quality Audit</h3>
                            <div className="space-y-6">
                               {[
                                 { label: 'Website Structure', value: data.contentQuality.structure },
                                 { label: 'Entity Definition', value: data.contentQuality.entities },
                                 { label: 'Semantic Depth', value: data.contentQuality.semanticDepth }
                               ].map((item, i) => (
                                 <div key={i} className="space-y-1">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{item.value}</p>
                                 </div>
                               ))}
                               <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                  <p className="text-[10px] font-bold text-zinc-400 italic">
                                     "{data.contentQuality.auditNote}"
                                  </p>
                               </div>
                            </div>
                         </Card>

                         <Card className="bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20 rounded-[2.5rem] p-10 shadow-xl">
                            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                               <AlertOctagon size={14} /> False Narratives detected
                            </h3>
                            <div className="space-y-4">
                               {(data.falseNarratives || []).map((narrative: any, i: number) => (
                                 <div key={i} className="space-y-2">
                                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400">"{narrative.claim}"</p>
                                    <div className="p-3 bg-white dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-500/20">
                                       <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Recommended Correction</p>
                                       <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">{narrative.correction}</p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </Card>
                      </div>

                      <div className="lg:col-span-8">
                         <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-12 shadow-xl h-full">
                            <h3 className="text-xl font-black tracking-tight mb-8">Strategic Content & Competitor Plan</h3>
                            <div className="prose prose-zinc dark:prose-invert max-w-none text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                               <ReactMarkdown>{data.contentCompetitorStrategy}</ReactMarkdown>
                            </div>
                         </Card>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'strategy' && (
                <motion.div 
                  key="strategy"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <Card className="bg-indigo-600 text-white rounded-[3rem] p-12 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingUp size={120} />
                         </div>
                         <div className="relative z-10 space-y-6">
                            <Badge className="bg-white/10 text-white border-none font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest">Growth Architecture</Badge>
                            <h3 className="text-4xl font-black tracking-tighter leading-none">Neural Growth Strategy</h3>
                            <div className="prose prose-invert max-w-none text-indigo-100 text-sm font-medium leading-relaxed">
                               <ReactMarkdown>{data.growthStrategy}</ReactMarkdown>
                            </div>
                         </div>
                      </Card>

                      <Card className="bg-zinc-900 border-none rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                            <Globe size={300} strokeWidth={1} />
                         </div>
                         <div className="relative z-10 space-y-8">
                            <div>
                               <h3 className="text-3xl font-black text-white tracking-tighter mb-4">GEO Optimization Roadmap</h3>
                               <div className="prose prose-invert max-w-none text-zinc-400 text-sm font-medium leading-relaxed">
                                  <ReactMarkdown>{data.geoOptimizationPlan}</ReactMarkdown>
                               </div>
                            </div>
                            
                            <div className="pt-8 border-t border-white/5">
                               <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Action Deployment Sequence</h4>
                               <div className="space-y-4">
                                  {(data.actionPlan || []).map((step: string, i: number) => (
                                    <div key={i} className="flex gap-6 items-start group">
                                       <span className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-white border border-white/10">{i + 1}</span>
                                       <div className="pt-1">
                                          <p className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{step}</p>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </Card>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           {data?.actionEngine && (
             <div className="pt-12">
               <ActionEngine actions={data.actionEngine} />
             </div>
           )}
        </div>
      )}
    </div>
  );
}
