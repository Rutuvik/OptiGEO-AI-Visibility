import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, 
  Search, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Globe2,
  BrainCircuit,
  Activity,
  Target,
  Rocket,
  Check,
  Brain,
  Fingerprint,
  Cpu,
  Layers,
  Sparkles,
  BarChart4,
  ArrowRight,
  Filter,
  RefreshCw,
  Info,
  Maximize2,
  MoreHorizontal,
  Mail,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { getDashboardAnalysis } from '../lib/gemini';
import { ActionEngine } from '../components/ActionEngine';

const CountUp = ({ value, prefix = '', suffix = '', decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest)
    });
    return () => controls.stop();
  }, [value]);

  return <span>{prefix}{displayValue.toFixed(decimals)}{suffix}</span>;
};

export default function Dashboard() {
  const [domain, setDomain] = useState(() => localStorage.getItem('last_analyzed_domain') || '');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [timeframe, setTimeframe] = useState('30D');
  const [engine, setEngine] = useState('All Engines');
  const [region, setRegion] = useState('Global');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchDashboardData = async (targetDomain: string) => {
    if (!targetDomain) {
      toast.error("Please enter a domain to begin analysis");
      return;
    }
    setAnalyzing(true);
    setLoading(data ? false : true); // Only show full skeleton on first load
    try {
      const result = await getDashboardAnalysis(targetDomain, { timeframe, engine, region });
      if (result) {
        setData(result);
        localStorage.setItem('last_analyzed_domain', targetDomain);
        toast.success(`Analysis synchronized for ${targetDomain}`);
      } else {
        toast.error("Failed to synchronize intelligence data");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during neural sync");
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data && domain) {
      fetchDashboardData(domain);
    }
  }, [timeframe, engine, region]);

  const stats = useMemo(() => {
    if (!data || !data.kpis) return [];
    return [
      { name: 'Visibility Score', value: data.kpis.visibilityScore?.value || 0, trend: data.kpis.visibilityScore?.trend || 0, icon: Search, color: 'sky', route: '/visibility' },
      { name: 'GEO Score', value: data.kpis.geoScore?.value || 0, trend: data.kpis.geoScore?.trend || 0, icon: Zap, color: 'emerald', route: '/optimizer' },
      { name: 'Share of Voice', value: data.kpis.shareOfVoice?.value || 0, trend: data.kpis.shareOfVoice?.trend || 0, icon: TrendingUp, color: 'indigo', route: '/competitors' },
      { name: 'AI Traffic Growth', value: data.kpis.aiTrafficGrowth?.value || 0, trend: data.kpis.aiTrafficGrowth?.trend || 0, icon: Rocket, color: 'rose', route: '/growth' },
    ];
  }, [data, domain]);

  const tickerItems = useMemo(() => {
    if (!data || !data.kpis) return [
      "Synchronizing neural citation nodes...",
      "Connecting to Perplexity and Gemini indexing streams...",
      "Calibrating visibility sensors across region cohorts..."
    ];
    
    return [
      `Keyword dominance detected for "${data.topQueries?.[0]?.query || 'key intent'}"`,
      `Neural SOV benchmarked at ${data.kpis.shareOfVoice?.value || 0}% against competitors`,
      `AI Traffic growth identified in ${region} segment`,
      `Status: ${data.engineBreakdown?.[0]?.status || 'Optimal'} across primary engines`,
      `New growth opportunity: "${data.keywordInsights?.[0]?.keyword || 'niche'}"`
    ];
  }, [data, region]);

  if (loading) {
    return (
      <div className="space-y-8 p-6 lg:p-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="space-y-4">
             <Skeleton className="h-4 w-32 rounded-full" />
             <Skeleton className="h-12 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-14 w-[400px] rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Skeleton className="lg:col-span-2 h-[500px] rounded-[2.5rem]" />
           <Skeleton className="h-[500px] rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-50/30 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="max-w-xl space-y-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
            <div className="relative w-32 h-32 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl mx-auto text-indigo-600">
               <BrainCircuit size={48} className="animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-950 dark:text-white">
              Initialize Neural <span className="text-zinc-400 dark:text-zinc-600">Oversight</span>
            </h1>
            <p className="text-zinc-500 font-medium text-lg lg:px-12">
              Enter a domain below to synchronize your GEO intelligence dashboard and begin analysis across AI engine cohorts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-xl max-w-lg mx-auto">
             <div className="relative flex-1 w-full sm:w-auto">
               <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
               <Input 
                 value={domain}
                 onChange={(e) => setDomain(e.target.value)}
                 placeholder="yourdomain.com"
                 className="pl-12 h-14 bg-transparent border-none font-bold text-lg focus-visible:ring-0"
                 onKeyDown={(e) => e.key === 'Enter' && fetchDashboardData(domain)}
               />
             </div>
             <Button 
               onClick={() => fetchDashboardData(domain)}
               disabled={analyzing}
               className="h-14 px-8 bg-zinc-950 dark:bg-white dark:text-zinc-950 text-white rounded-2xl font-black uppercase tracking-tight text-xs hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
             >
               {analyzing ? 'Synchronizing...' : 'Start Scan'}
             </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
             {[
               { icon: Sparkles, label: 'Real-time Trends' },
               { icon: Target, label: 'GEO Scoring' },
               { icon: ShieldCheck, label: 'Competitive SOV' }
             ].map((feature, i) => (
               <div key={i} className="flex items-center gap-2">
                 <feature.icon size={14} className="text-indigo-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{feature.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-zinc-950 pb-20 font-sans text-left">
      {/* AI Citation Ticker */}
      <div className="h-10 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 overflow-hidden flex items-center shadow-sm">
         <div className="h-full w-32 bg-white dark:bg-zinc-900 z-10 flex items-center pl-6 border-r border-zinc-50 dark:border-zinc-800">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
               <Activity size={10} className="animate-pulse" /> Live Feed
            </span>
         </div>
         <motion.div 
           initial={{ x: 0 }}
           animate={{ x: "-100%" }}
           transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
           className="flex gap-16 whitespace-nowrap px-10"
         >
            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
               <span key={i} className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" /> {item}
               </span>
            ))}
         </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 space-y-12">
        {/* Header & Controls */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-600"
            >
              <Sparkles size={10} /> Neural Command Center
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
              GEO Oversight <span className="text-zinc-300 dark:text-zinc-700">/ Intelligence</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group min-w-[300px]">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                <Globe2 size={18} />
              </div>
              <Input 
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Synchronize domain intelligence..."
                className="pl-12 h-14 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm shadow-xl shadow-zinc-200/20 dark:shadow-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && fetchDashboardData(domain)}
              />
              {analyzing && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <RefreshCw size={18} className="animate-spin text-indigo-500" />
                </div>
              )}
            </div>
            <Button 
              disabled={analyzing}
              onClick={() => fetchDashboardData(domain)}
              className="h-14 px-8 bg-zinc-950 dark:bg-white dark:text-zinc-950 text-white rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-950/10"
            >
              {analyzing ? 'Synchronizing...' : 'Sync Intelligence'}
            </Button>
          </div>
        </header>

        {/* Global Filters */}
        <section className="flex flex-wrap items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
           <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <Filter size={14} className="text-zinc-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Filter Spectrum</span>
           </div>
           
           <div className="h-6 w-[1px] bg-zinc-100 dark:bg-zinc-800 mx-2 hidden md:block" />

           {[
             { label: 'Timeframe', value: timeframe, setter: setTimeframe, options: ['24H', '7D', '30D', '90D'] },
             { label: 'Engine', value: engine, setter: setEngine, options: ['All Engines', 'ChatGPT', 'Perplexity', 'Gemini'] },
             { label: 'Region', value: region, setter: setRegion, options: ['Global', 'North America', 'EMEA', 'APAC'] }
           ].map((f) => (
             <div key={f.label} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{f.label}:</span>
                <div className="flex bg-zinc-50 dark:bg-zinc-800/30 p-1 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  {f.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => f.setter(opt)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${f.value === opt ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200/50' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
             </div>
           ))}
        </section>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode='wait'>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const isPositive = stat.trend > 0;
              return (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 30 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(stat.route)}
                  className="cursor-pointer"
                >
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
                    <div className={`absolute -right-4 -top-4 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-950/30 text-${stat.color}-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                        <Icon size={20} />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(stat.trend)}%
                      </div>
                    </div>
                    
                    <div className="space-y-1 relative z-10">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.name}</p>
                      <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
                         <CountUp value={stat.value} decimals={stat.name.includes('Growth') ? 1 : 0} suffix={stat.name.includes('Growth') || stat.name.includes('Score') || stat.name.includes('Voice') ? '%' : ''} />
                      </h3>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Visibility Breakdown Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Chart 1: Visibility Trajectory */}
           <Card className="lg:col-span-2 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <CardHeader className="p-10 border-b border-zinc-50 dark:border-zinc-800/50 flex flex-row items-center justify-between space-y-0">
                 <div>
                   <CardTitle className="text-2xl font-black tracking-tight">Visibility Trajectory</CardTitle>
                   <CardDescription className="text-xs font-bold text-zinc-400">Neural footprint progression across primary engines.</CardDescription>
                 </div>
                 <Button variant="ghost" size="icon" className="rounded-xl text-zinc-400"><Maximize2 size={16} /></Button>
              </CardHeader>
              <CardContent className="p-10 h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.trends?.visibility || []}>
                       <defs>
                          <linearGradient id="visGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }}
                         dy={15}
                       />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip 
                         cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                         contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="score" 
                         stroke="#6366f1" 
                         strokeWidth={4} 
                         fill="url(#visGradient)" 
                         animationDuration={2500}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           {/* Chart 2: Competitor Landscape */}
           <Card className="bg-zinc-950 border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                 <ShieldCheck size={200} />
              </div>
              <CardHeader className="p-10 relative z-10">
                 <CardTitle className="text-2xl font-black tracking-tight text-white">SOV Benchmark</CardTitle>
                 <CardDescription className="text-xs font-bold text-zinc-500">Competitive dominance across major nodes.</CardDescription>
              </CardHeader>
              <CardContent className="px-10 pb-10 flex-1 flex flex-col relative z-10">
                 <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={data?.competitorComparison || []} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} 
                            width={100}
                          />
                          <Tooltip 
                             cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                             contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', borderRadius: '12px' }}
                          />
                          <Bar 
                            dataKey="sov" 
                            radius={[0, 8, 8, 0]} 
                            barSize={32}
                            animationDuration={2000}
                          >
                             {(data?.competitorComparison || []).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.name.toLowerCase().includes(domain.split('.')[0].toLowerCase()) ? '#fff' : '#6366f1'} opacity={0.8} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="pt-8 grid grid-cols-2 gap-4 border-t border-white/5">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Market Status</p>
                       <p className="text-lg font-black text-white">Aggressive</p>
                    </div>
                    <div className="space-y-1 text-right">
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Growth Vector</p>
                       <p className="text-lg font-black text-indigo-400">+{data?.kpis?.aiTrafficGrowth?.trend || 0}%</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </section>

        {/* Engine Breakdown & Top Queries */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Engine Breakdown Matrix */}
           <div className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                    <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Neural Node Health</h3>
                 </div>
                 <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                    <Activity size={12} /> Synchronized
                 </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(data?.engineBreakdown || []).map((engine: any, i: number) => (
                    <motion.div 
                      key={engine.engine}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow"
                    >
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-black tracking-tight text-zinc-900 dark:text-white uppercase">{engine.engine}</span>
                          <Badge className={`${engine.health > 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} border-none text-[9px] font-black uppercase tracking-widest rounded-lg`}>
                            {engine.status}
                          </Badge>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-end justify-between">
                             <div className="space-y-1">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Latency</p>
                                <p className="text-sm font-black font-mono tracking-tighter">{engine.latency}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Integrity</p>
                                <p className="text-sm font-black text-indigo-600">{engine.health}%</p>
                             </div>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${engine.health}%` }}
                               transition={{ duration: 1.5, delay: i * 0.2 }}
                               className="h-full bg-indigo-500"
                             />
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>

           {/* Top Queries Table */}
           <div className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-zinc-950 dark:bg-zinc-700 rounded-full" />
                    <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Neural Intent Map</h3>
                 </div>
                 <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-zinc-400" onClick={() => navigate('/visibility')}>
                    Drill Down <ArrowRight size={12} className="ml-1" />
                 </Button>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800">
                       <tr>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Semantic Query</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Pos</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Imp</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                       {(data?.topQueries || []).slice(0, 5).map((q: any, i: number) => (
                          <motion.tr 
                            key={i} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                          >
                             <td className="px-8 py-5">
                                <div className="space-y-0.5 text-left">
                                   <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                      {q.query}
                                      <Info size={12} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                   </div>
                                   <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CTR: {q.ctr}%</div>
                                </div>
                             </td>
                             <td className="px-6 py-5 text-center">
                                <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none font-bold text-[10px] px-3 py-1 rounded-lg">
                                   #{q.position}
                                </Badge>
                             </td>
                             <td className="px-6 py-5 text-right font-mono font-black text-xs text-zinc-500">
                                {q.impressions.toLocaleString()}
                             </td>
                          </motion.tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>

        {/* Intelligence Feed / Executive Summary */}
        <section className="bg-indigo-600 rounded-[3rem] p-12 lg:p-16 text-white text-left relative overflow-hidden shadow-2xl shadow-indigo-600/30 group">
           <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
              <Brain size={400} />
           </div>
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
              <div className="lg:col-span-2 space-y-8">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl border border-white/20 text-[10px] font-black uppercase tracking-widest">
                    <Cpu size={14} /> Synthetic Consensus
                 </div>
                 <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] max-w-3xl">
                    Dynamic Summary: <span className="text-indigo-200">{domain}'s neural narrative is evolving.</span>
                 </h2>
                 <p className="text-lg lg:text-xl font-medium text-indigo-100 leading-relaxed italic opacity-90">
                    "{data?.summary}"
                 </p>
                 <div className="flex items-center gap-4 pt-4">
                    <Button onClick={() => navigate('/audit')} className="bg-white text-indigo-600 rounded-2xl px-10 h-14 font-black shadow-2xl hover:scale-105 active:scale-95 transition-all">
                       Neural Audit Suite <Target size={18} className="ml-2" />
                    </Button>
                    <button onClick={() => fetchDashboardData(domain)} className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2 border-b-2 border-white/20 hover:border-white transition-all pb-1 ml-4 decoration-none">
                       Recalibrate Focus
                    </button>
                 </div>
              </div>
              <div className="space-y-6">
                 {(data?.keywordInsights || []).slice(0, 3).map((kw: any, i: number) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 10 }}
                      className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl"
                    >
                       <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-black uppercase tracking-widest text-indigo-200">{kw.keyword}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${kw.difficulty < 40 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                             {kw.intent}
                          </span>
                       </div>
                       <p className="text-sm font-bold text-white/80">{kw.opportunity}</p>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {data?.actionEngine && (
          <section className="pt-12">
            <ActionEngine actions={data.actionEngine} />
          </section>
        )}

        {/* Footer Credit */}
        <footer className="pt-20 border-t border-zinc-100 dark:border-zinc-800 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 dark:text-zinc-700 pb-10">OptiGEO Research Cohort &copy; 2026. All Systems Synchronized.</p>
        </footer>
      </div>
    </div>
  );
}
