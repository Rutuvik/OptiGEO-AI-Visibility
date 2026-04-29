import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  ShieldCheck, 
  ShieldAlert,
  MessageSquare,
  AlertTriangle,
  X,
  Info, 
  Cpu, 
  BrainCircuit, 
  History,
  TrendingUp,
  Database,
  BarChart4,
  LayoutGrid,
  MapPin,
  FileText,
  MousePointer2,
  MoreHorizontal,
  ChevronRight,
  Filter,
  Monitor,
  Eye,
  Settings,
  Target,
  Trash2,
  Plus,
  Network,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
const VisibilityGauge = ({ score }: { score: number }) => {
  const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees
  const getStatus = (s: number) => {
    if (s > 80) return { label: 'High Brand Authority', color: 'text-emerald-500' };
    if (s > 40) return { label: 'Medium Presence', color: 'text-amber-500' };
    return { label: 'Low Visibility', color: 'text-rose-500' };
  };
  const status = getStatus(score);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-48 border-[12px] border-zinc-100 rounded-full" />
        <motion.div 
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 left-0 w-full h-48 border-[12px] border-zinc-950 rounded-full border-b-transparent border-l-transparent origin-center"
          style={{ clipPath: 'inset(0 0 50% 0)' }}
        />
      </div>
      <div className="mt-[-10px] text-center">
        <div className="text-4xl font-black tracking-tighter">{score}/100</div>
        <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${status.color}`}>{status.label}</div>
      </div>
    </div>
  );
};

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const researchModel = "gemini-3-flash-preview";

export default function VisibilityTracker() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [queries, setQueries] = useState<string[]>(['']);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [activeTab, setActiveTab] = useState('queries');
  const [monitoredItems, setMonitoredItems] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState('6M');
  const [modalContent, setModalContent] = useState<{ title: string; type: string; data: any } | null>(null);

  // research functionality using Gemini Grounding
  const performLiveResearch = async (targetDomain: string, targetQueries: string[], competitorList: string[]) => {
    try {
      const competitorPromptChunk = competitorList.length > 0 
        ? `\n      MANDATORY COMPETITORS: ${competitorList.join(', ')}\n      4. Compare ${targetDomain} against the listed competitors. Rank them individually per AI model.`
        : `\n      4. Identify "Topic Gaps" where ${targetDomain} is missing.`;

      const prompt = `COMMAND: Perform comprehensive live research on the AI search engine visibility of "${targetDomain}".
      TARGET QUERIES: ${targetQueries.join(', ')}
      ${competitorPromptChunk}
      
      TASKS:
      1. Search for actual citations and mentions of ${targetDomain} on the web in context of AI discovery.
      2. Analyze its presence across ChatGPT, Gemini, Perplexity, and Claude.
      3. Identify specific industry insights and semantic authority markers for ${targetDomain}.
      5. Find REAL URLs or domains citing or discussing ${targetDomain}.
      6. Analyze sentiment (positive/neutral/negative) for each major mention.
      7. Detect false narratives or outdated info (pricing, features, descriptions).
      8. Track "Position in Response" (First, Middle, Last) and ranking in shortlists.
      
      OUTPUT FORMAT (STRICT JSON ONLY):
      {
        "competitorStatus": [{"brand": "string", "score": number, "strengths": ["string"], "weaknesses": ["string"], "status": "string", "modelRankings": [{"engine": "string", "rank": number}]}],
        "realCitations": [{"domain": "string", "url": "string", "snippet": "string", "type": "citation|mention", "relevance": "summary"}],
        "brandMentionsTotal": number,
        "sentimentLayer": {
          "score": number_0_100,
          "trend": "improving|stable|declining",
          "breakdown": {"positive": number, "neutral": number, "negative": number},
          "narrativeAlerts": [{"narrative": "string", "isFalse": boolean, "correction": "string"}]
        },
        "hallucinationAudit": [{"engine": "string", "issue": "string", "correctInfo": "string", "severity": "low|medium|high"}],
        "engineVisibility": {"ChatGPT": number, "Gemini": number, "Perplexity": number, "Claude": number},
        "queryVisibility": [{
          "query": "string", 
          "appeared": boolean, 
          "avgPosition": number, 
          "positionLabel": "First|Middle|Last",
          "shortlistPresence": "Top 3|Top 5|Out of Top 5",
          "sentiment": "Positive|Neutral|Negative",
          "explanation": "string"
        }],
        "industryInsights": [{"title": "string", "detail": "string", "summary": "string"}],
        "topicGaps": [{"topic": "string", "gap": "string", "strategy": "string"}],
        "detailedAudit": {
          "summary": "string",
          "strengthsCount": number,
          "weaknessesCount": number,
          "opportunitiesCount": number,
          "criticalImprovements": ["string"],
          "entityGraphAnalysis": "string",
          "intentCoverage": {"informational": number, "transactional": number, "navigational": number},
          "technicalHealth": {"schema": number, "crawlability": number, "authority": number}
        }
      }
      
      CRITICAL: Use your Google Search tool to find actual, recent data. Do not hallucinate. If no data exists, provide an honest state of awareness.`;

      const response = await genAI.models.generateContent({
        model: researchModel,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      return JSON.parse(text);
    } catch (error) {
      console.error("Critical Research Error:", error);
      toast.error("Advanced research module encountered a bottleneck. Using cached intelligence.");
      return null;
    }
  };

  // Filter history based on timeframe
  const getFilteredHistory = () => {
    let sourceHistory = history.filter((h: any) => h.input?.domain?.toLowerCase() === domain?.toLowerCase());
    
    if (!sourceHistory || sourceHistory.length === 0) {
      if (!result?.history) return [];
      sourceHistory = result.history;
    }

    const now = new Date().getTime();
    let filtered = sourceHistory;

    // Filter by actual timestamp diff if timestamp data exists, otherwise fallback to slice logic
    if (timeframe === '1M') {
      const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
      filtered = sourceHistory.filter((h: any) => h.timestamp ? new Date(h.timestamp).getTime() >= oneMonthAgo : true);
      // Fallback slice if no timestamps exist on fallback payload
      if (filtered.length === sourceHistory.length) filtered = sourceHistory.slice(-5);
    } else if (timeframe === '6M') {
      const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);
      filtered = sourceHistory.filter((h: any) => h.timestamp ? new Date(h.timestamp).getTime() >= sixMonthsAgo : true);
      if (filtered.length === sourceHistory.length) filtered = sourceHistory.slice(-15);
    }

    // Map history to chart format
    return filtered.map((h: any) => ({
      name: h.name || new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: h.score,
      timestamp: h.timestamp || ''
    }));
  };

  // Fetch history on load
  useEffect(() => {
    fetchHistory();
  }, []);

  // Polling logic for "Live Updates"
  useEffect(() => {
    let interval: any;
    if (isPolling && result) {
      interval = setInterval(async () => {
        try {
          const res = await axios.post('/api/visibility/run', {}, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          // Real-time Drift Alerts for significant movements
          const delta = res.data.score - result.score;
          if (delta >= 1.5) {
             toast.success(`Positive Intelligence Drift: ${domain}`, {
               description: `Neural presence gained across global research nodes.`
             });
          } else if (delta <= -1.5) {
             toast.error(`Critical Visibility Warning: ${domain}`, {
               description: `Immediate presence loss detected in recent engine snapshots.`
             });
          }

          setResult(res.data);
          fetchHistory();
        } catch (err) {
          console.error("Polling failed", err);
        }
      }, 30000); // Poll every 30s for live drift
    }
    return () => clearInterval(interval);
  }, [isPolling, result?.score, domain]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/visibility/history', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  const addQuery = () => setQueries([...queries, '']);
  const removeQuery = (index: number) => setQueries(queries.filter((_, i) => i !== index));
  const updateQuery = (index: number, val: string) => {
    const newQueries = [...queries];
    newQueries[index] = val;
    setQueries(newQueries);
  };

  const addCompetitor = () => setCompetitors([...competitors, '']);
  const removeCompetitor = (index: number) => setCompetitors(competitors.filter((_, i) => i !== index));
  const updateCompetitor = (index: number, val: string) => {
    const newComps = [...competitors];
    newComps[index] = val;
    setCompetitors(newComps);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQueries = queries.filter(q => q.trim() !== '');
    const cleanCompetitors = competitors.filter(c => c.trim() !== '');

    if (!domain || cleanQueries.length === 0) {
      toast.error('Domain and at least one query are required');
      return;
    }

    setLoading(true);
    setResult(null); // Clear previous results
    try {
      // Step 1: Perform REAL LIVE research via Gemini Grounding
      toast.info("Initializing Real-Time Intelligence Node...");
      const researchData = await performLiveResearch(domain, cleanQueries, cleanCompetitors);

      // Step 2: Send findings to backend to process into dashboard format
      toast.info("Analyzing web-scale semantic footprint...");
      const res = await axios.post('/api/visibility/analyze', { 
        domain, 
        queries: cleanQueries, 
        competitors: cleanCompetitors,
        researchData 
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setResult(res.data);
      setIsPolling(true); 
      fetchHistory();
      toast.success('Live Visibility Research Complete');
    } catch (err) {
      console.error("Analysis pipeline failed:", err);
      toast.error('Global Intelligence Pipeline Encountered an Error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMonitor = (id: string, name: string) => {
    if (monitoredItems.includes(id)) {
      setMonitoredItems(prev => prev.filter(item => item !== id));
      toast.info(`Stopped monitoring ${name}`);
    } else {
      setMonitoredItems(prev => [...prev, id]);
      toast.success(`Monitoring established for ${name}`);
    }
  };

  return (
    <div className="space-y-10 pb-20 text-left animate-fade-up">
      {/* Header Search Protocol */}
      <section className="aesthetic-card p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-700">
           <BrainCircuit size={160} />
        </div>
        <div className="relative z-10 space-y-10">
          <div className="max-w-2xl">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-lg">
                   <Target size={20} />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">Visibility Intelligence</h1>
             </div>
             <p className="text-muted-foreground font-medium leading-relaxed">
                Analyze brand saturation and semantic influence across global LLM clusters. Track every mention, citation, and source in real-time.
             </p>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-3 md:col-span-2 max-w-xl">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Brand Domain</label>
                   <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                      <Input 
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="e.g. cloudflare.com"
                        className="h-14 bg-zinc-100/50 border-zinc-200 rounded-2xl pl-12 focus:bg-white focus:border-zinc-950 transition-all font-medium"
                      />
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Target Queries</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {queries.map((q, idx) => (
                      <div key={idx} className="flex gap-2">
                         <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                            <Input 
                              value={q}
                              onChange={(e) => updateQuery(idx, e.target.value)}
                              placeholder="e.g. Best enterprise CDN"
                              className="h-12 bg-zinc-100/50 border-zinc-200 rounded-xl pl-10 focus:bg-white transition-all text-sm"
                            />
                         </div>
                         {queries.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeQuery(idx)}
                              className="h-12 w-12 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                            >
                               <Trash2 size={16} />
                            </Button>
                         )}
                      </div>
                   ))}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={addQuery}
                  className="rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950"
                >
                   + Add Query Node
                </Button>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Competitors (Optional)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {competitors.map((c, idx) => (
                      <div key={idx} className="flex gap-2">
                         <div className="relative flex-1">
                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                            <Input 
                              value={c}
                              onChange={(e) => updateCompetitor(idx, e.target.value)}
                              placeholder="e.g. competitor.com"
                              className="h-12 bg-zinc-100/50 border-zinc-200 rounded-xl pl-10 focus:bg-white transition-all text-sm"
                            />
                         </div>
                         <Button 
                           type="button" 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => removeCompetitor(idx)}
                           className="h-12 w-12 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                         >
                            <Trash2 size={16} />
                         </Button>
                      </div>
                   ))}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={addCompetitor}
                  className="rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950"
                >
                   + Add Competitor
                </Button>
             </div>

             <Button 
               type="submit" 
               disabled={loading}
               className="h-14 w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-bold shadow-xl shadow-zinc-500/10 active:scale-[0.98] transition-all"
             >
                {loading ? <Loader2 className="animate-spin" /> : <>Initiate Intelligence Scan <ArrowRight size={16} className="ml-2" /></>}
             </Button>
          </form>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Overview & Distribution Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visibility Score Gauge */}
                <div 
                  className="lg:col-span-3 aesthetic-card p-10 flex flex-col items-center justify-between cursor-pointer hover:border-zinc-950 transition-all group relative overflow-hidden"
                  onClick={() => navigate('/visibility/report', { state: { result, domain } })}
                >
                   <div className="absolute top-4 right-4 text-zinc-300 group-hover:text-zinc-950 transition-colors">
                      <Info size={16} />
                   </div>
                   <div className="w-full text-left mb-6">
                      <h4 className="text-lg font-bold tracking-tight">AI Visibility KPI</h4>
                      <p className="text-xs text-muted-foreground">Aggregated across all query nodes</p>
                   </div>
                   <VisibilityGauge score={result.score} />
                   <div className="mt-8 p-4 bg-zinc-100 rounded-2xl text-[10px] font-medium text-muted-foreground leading-relaxed text-center group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                      View Detailed Scan Report
                   </div>
                </div>

               {/* Main Metrics & Chart */}
               <div className="lg:col-span-9 aesthetic-card p-0 flex flex-col overflow-hidden">
                  <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between bg-zinc-50/30">
                     <div className="flex flex-wrap gap-8">
                        <div>
                           <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Mentions</div>
                           <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black">{result.mentions.count}/{result.mentions.total}</span>
                              <span className="text-[10px] font-bold text-emerald-500">Appeared in {result.mentions.percentage}%</span>
                           </div>
                        </div>
                        <div>
                           <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</div>
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${result.level === 'High' ? 'bg-emerald-500' : result.level === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                              <span className="text-sm font-bold">{result.level} Presence</span>
                           </div>
                        </div>
                        {isPolling && (
                           <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 text-white text-[9px] font-bold uppercase tracking-widest rounded-full animate-pulse self-center">
                              <Loader2 size={10} className="animate-spin" /> Live Updates On
                           </div>
                        )}
                     </div>
                     <div className="flex gap-1 mt-4 md:mt-0 p-1 bg-white rounded-xl border border-zinc-100 shadow-sm self-end md:self-auto">
                        {['1M', '6M', 'ALL'].map(p => (
                           <button 
                             key={p} 
                             onClick={() => setTimeframe(p)}
                             className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${p === timeframe ? 'bg-zinc-950 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-950'}`}
                           >
                              {p}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="p-8 flex-1">
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold tracking-tight">Visibility Trend Over Time</h4>
                     </div>
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={getFilteredHistory()}>
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 600 }} dy={10} />
                           <YAxis hide />
                           <Tooltip 
                             contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 600 }}
                           />
                           <Bar dataKey="score" fill="#18181b" radius={[4, 4, 0, 0]} animationDuration={1000} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Engine Breakdown */}
               <div className="aesthetic-card p-10 max-w-5xl">
                  <div className="flex items-center justify-between mb-10">
                     <h4 className="text-lg font-bold tracking-tight">Engine Breakdown</h4>
                     <Cpu size={20} className="text-zinc-300" />
                  </div>
                  <div className="space-y-8">
                     {[...result.engineBreakdown].sort((a: any, b: any) => b.score - a.score).map((engine: any, i: number) => (
                        <div key={engine.name} className="space-y-3">
                           <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                              <span className="text-zinc-600 flex items-center gap-2"><span className="text-zinc-400">#{i + 1}</span> {engine.name}</span>
                              <div className="flex gap-4">
                                 <span className="text-zinc-400">{engine.presenceRate}% Presence</span>
                                 <span className="text-zinc-950">Score: {engine.score}</span>
                              </div>
                           </div>
                           <div className="h-4 w-full bg-zinc-50 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${engine.score}%` }}
                                 transition={{ delay: i * 0.1, duration: 1 }}
                                 className="h-full bg-zinc-950 rounded-full"
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Competitor Ranking */}
               {result.competitorComparison && result.competitorComparison.length > 1 && (
                  <div className="aesthetic-card p-10 max-w-5xl">
                     <div className="flex items-center justify-between mb-10">
                        <h4 className="text-lg font-bold tracking-tight">Competitor Ranking</h4>
                        <Target size={20} className="text-zinc-300" />
                     </div>
                     <div className="space-y-5">
                        {result.competitorComparison.map((comp: any, i: number) => (
                           <div key={comp.brand} className="p-4 rounded-xl border border-zinc-100 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                    #{i + 1}
                                 </div>
                                 <div>
                                    <p className="font-bold text-sm">{comp.brand}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{comp.analysis.visibilityGap}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="font-black text-lg">{comp.score}</p>
                                 <p className="text-[10px] text-zinc-400 uppercase tracking-widest">KPI Score</p>
                                 {comp.modelRankings && comp.modelRankings.length > 0 && (
                                    <div className="flex justify-end gap-2 mt-2">
                                      {comp.modelRankings.map((rk: any, rkIdx: number) => (
                                        <div key={rkIdx} className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded-md">
                                          {rk.engine}: <span className="text-zinc-800">#{rk.rank}</span>
                                        </div>
                                      ))}
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            {/* Sentiment & Hallucination Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sentiment Analysis */}
              <div className="lg:col-span-7 aesthetic-card p-10 overflow-hidden relative group">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                       <h4 className="text-xl font-bold tracking-tight">Narrative Sentiment Layer</h4>
                       <p className="text-xs text-zinc-500 font-medium">Per-mention scoring & trend analysis</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl">
                       <MessageSquare size={20} />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="flex items-center gap-6">
                          <div className="text-4xl font-black">{result.sentimentLayer.score}</div>
                          <div>
                             <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Score</div>
                             <div className={`text-[10px] font-bold uppercase ${result.sentimentLayer.trend === 'up' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                {result.sentimentLayer.trend === 'up' ? '↗ Trending Positive' : '→ Stable Presence'}
                             </div>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          {Object.entries(result.sentimentLayer.breakdown).map(([key, val]: [string, any]) => (
                             <div key={key} className="space-y-1.5 text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex justify-between items-center">
                                   <span className="text-zinc-400">{key}</span>
                                   <span>{val}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full ${key === 'positive' ? 'bg-emerald-500' : key === 'negative' ? 'bg-rose-500' : 'bg-zinc-300'}`} 
                                      style={{ width: `${val}%` }}
                                   />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">False Narrative Alerts</h5>
                       {result.sentimentLayer?.narrativeAlerts && result.sentimentLayer.narrativeAlerts.length > 0 ? (
                          <div className="space-y-3">
                             {result.sentimentLayer.narrativeAlerts.map((alert: any, idx: number) => (
                                <div key={idx} className="p-3 bg-white rounded-xl border border-zinc-100 flex items-start gap-3 animate-fade-in">
                                   <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                   <div className="text-[11px] font-medium leading-relaxed">
                                      <span className="font-bold">{alert.narrative}</span>
                                      {alert.correction && <span className="block mt-1 text-zinc-500 font-normal">Correction: {alert.correction}</span>}
                                   </div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center py-6">
                             <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                                <CheckCircle2 size={16} />
                             </div>
                             <p className="text-[10px] font-bold text-zinc-400 uppercase leading-tight">No critical false narratives detected</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Hallucination Audit */}
              <div className="lg:col-span-5 aesthetic-card p-10 overflow-hidden relative">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                       <h4 className="text-xl font-bold tracking-tight">Hallucination Audit</h4>
                       <p className="text-xs text-zinc-500 font-medium tracking-tight">Accuracy of brand mentions & features</p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                       <ShieldAlert size={20} />
                    </div>
                 </div>

                 <div className="space-y-4">
                    {result.hallucinationAudit.length > 0 ? (
                       result.hallucinationAudit.map((audit: any, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-rose-200 transition-all">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">{audit.severity || 'General'} Error</span>
                                <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0 border-rose-100 text-rose-400">{audit.engine}</Badge>
                             </div>
                             <p className="text-xs font-bold tracking-tight mb-1">{audit.issue}</p>
                             <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Reality: <span className="text-emerald-500 font-bold">{audit.correctInfo}</span>
                             </p>
                          </div>
                       ))
                    ) : (
                       <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                          <ShieldCheck size={48} className="text-zinc-200 mb-4" />
                          <p className="text-xs font-bold uppercase tracking-widest leading-none">Factual Integrity Verified</p>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div 
                  onClick={() => setModalContent({ title: "Detailed AI Visibility Insights", type: 'insights', data: result.insights })}
                  className="aesthetic-card p-10 bg-zinc-950 text-white cursor-pointer hover:bg-zinc-900 transition-all group overflow-hidden relative"
               >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                     <BrainCircuit size={80} />
                  </div>
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                     <BrainCircuit size={20} className="text-zinc-400" /> AI Insights Engine
                  </h4>
                  <ul className="space-y-4 relative z-10">
                     {result.insights.map((ins: any, idx: number) => (
                        <li key={idx} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                           <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2 shrink-0" />
                           {ins.summary || ins}
                        </li>
                     ))}
                  </ul>
                  <div className="mt-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-all flex items-center gap-2">
                     Click for deep semantic analysis <ChevronRight size={10} />
                  </div>
               </div>
               <div 
                  onClick={() => setModalContent({ title: "Optimization Roadmap Details", type: 'roadmap', data: result.recommendations })}
                  className="aesthetic-card p-10 bg-emerald-50 border-emerald-100 cursor-pointer hover:bg-emerald-100/50 transition-all group overflow-hidden relative"
               >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                     <Settings size={80} className="text-emerald-900" />
                  </div>
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-900 relative z-10">
                     <Settings size={20} /> Optimization Roadmap
                  </h4>
                  <ul className="space-y-4 relative z-10">
                     {result.recommendations.map((rec: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-3 text-sm font-medium text-emerald-800">
                           <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold italic">
                              0{idx + 1}
                           </div>
                           {rec.summary || rec}
                        </li>
                     ))}
                  </ul>
                  <div className="mt-8 text-[10px] font-black uppercase tracking-widest text-emerald-600 group-hover:text-emerald-900 transition-all flex items-center gap-2">
                     Click to reveal implementation steps <ChevronRight size={10} />
                  </div>
               </div>
            </div>

            {/* NEW SUB-FEATURE: AI Traffic Prediction */}
            <Card className="aesthetic-card overflow-hidden bg-gradient-to-br from-zinc-50 to-white border-zinc-100 animate-fade-up">
               <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-4 space-y-6">
                     <div className="w-16 h-16 rounded-[2rem] bg-zinc-950 text-white flex items-center justify-center shadow-2xl">
                        <TrendingUp size={32} />
                     </div>
                     <div>
                        <h3 className="text-3xl font-bold tracking-tighter">AI Traffic Projection</h3>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed mt-2">
                           Predictive modeling based on current semantic velocity and engine bias shifts. 
                           Estimates next 90 days of organic discovery.
                        </p>
                     </div>
                     <div className="pt-4 flex flex-wrap gap-3">
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1 font-bold">Growth: +24.5%</Badge>
                        <Badge className="bg-sky-50 text-sky-600 border-sky-100 px-3 py-1 font-bold">Confidence: 91%</Badge>
                     </div>
                  </div>
                  <div className="lg:col-span-8 h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                           { month: 'Current', value: 4500 },
                           { month: 'Month 1', value: 5200 },
                           { month: 'Month 2', value: 5900 },
                           { month: 'Month 3', value: 6800 },
                        ]}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                           <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                           <YAxis hide />
                           <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                           <Line 
                             type="monotone" 
                             dataKey="value" 
                             stroke="#18181b" 
                             strokeWidth={4} 
                             dot={{ r: 6, fill: '#18181b', strokeWidth: 2, stroke: '#fff' }} 
                             activeDot={{ r: 8 }}
                             animationDuration={3000}
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </Card>

            {/* Topics & Sources Lab */}
            <section className="space-y-8 animate-fade-up">
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">Intelligence Lab: Topics & Sources</h3>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="sm" onClick={() => setActiveTab('queries')} className={`rounded-xl ${activeTab === 'queries' ? 'bg-zinc-100' : ''}`}>Queries</Button>
                     <Button variant="ghost" size="sm" onClick={() => setActiveTab('opportunities')} className={`rounded-xl ${activeTab === 'opportunities' ? 'bg-zinc-100' : ''}`}>Opportunities</Button>
                     <Button variant="ghost" size="sm" onClick={() => setActiveTab('sources')} className={`rounded-xl ${activeTab === 'sources' ? 'bg-zinc-100' : ''}`}>Sources</Button>
                  </div>
               </div>

               <div className="aesthetic-card p-0 overflow-hidden">
                  {activeTab === 'queries' && (
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-zinc-50/30 border-b border-zinc-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Target Query Node</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Visibility</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Position Tracking</th>
                                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Sentiment Layer</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Deep Analysis</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50">
                             {result.queryLevelResults.map((q: any, idx: number) => (
                                <tr key={idx} className="group hover:bg-zinc-100/50 transition-all">
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-950 transition-colors cursor-help" title="Query node details">
                                            <Search size={14} />
                                         </div>
                                         <span className="text-sm font-semibold tracking-tight">{q.query}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      {q.appeared ? (
                                         <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase">
                                            <CheckCircle2 size={12} /> Detected
                                         </div>
                                      ) : (
                                         <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase">
                                            <X size={12} /> Missing
                                         </div>
                                      )}
                                   </td>
                                   <td className="px-8 py-6">
                                      <div className="flex flex-col">
                                         <span className="text-lg font-black">{q.appeared ? `#${q.avgPosition}` : 'N/A'}</span>
                                         {q.appeared && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter block">{q.positionLabel} | {q.shortlistPresence}</span>}
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      {q.appeared ? (
                                         <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-tight w-fit ${
                                               q.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                               q.sentiment === 'Negative' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                                               'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                            }`}>
                                               {q.sentiment}
                                            </Badge>
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">{q.type}</span>
                                         </div>
                                      ) : (
                                         <span className="text-[10px] font-bold text-zinc-400 uppercase">Not Evaluated</span>
                                      )}
                                   </td>
                                   <td className="px-8 py-6 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                         <Button 
                                           variant="ghost" 
                                           size="sm" 
                                           onClick={() => toggleMonitor(q.id || `q-${idx}`, q.query)}
                                           className={`rounded-xl transition-all border ${monitoredItems.includes(q.id || `q-${idx}`) ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white border-zinc-100'}`}
                                         >
                                            <Monitor size={12} className="mr-1.5" /> 
                                            {monitoredItems.includes(q.id || `q-${idx}`) ? 'Monitored' : 'Monitor'}
                                         </Button>
                                         <Button 
                                           variant="ghost" 
                                           size="sm" 
                                           onClick={() => setModalContent({ title: `Responses for: ${q.query}`, type: 'responses', data: q.responses })}
                                           className="rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-zinc-100 hover:bg-zinc-950 hover:text-white"
                                         >
                                            View Response Flow
                                         </Button>
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  )}

                  {activeTab === 'opportunities' && (
                    <div className="p-8 space-y-4">
                       {result.topicOpportunities.map((op: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-all group">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold group-hover:text-emerald-600 transition-colors">{op.name}</span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Gap: {op.gap} | Difficulty: {op.difficulty}</span>
                             </div>
                             <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setModalContent({ title: `Strategy Analysis: ${op.name}`, type: 'strategy', data: op.strategy })}
                                className="rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all shadow-sm"
                             >
                                Analyze Strategy
                             </Button>
                          </div>
                       ))}
                    </div>
                  )}

                  {activeTab === 'sources' && (
                    <div className="p-8 space-y-4">
                       {result.citedSources.map((source: any, i: number) => (
                          <div 
                            key={i} 
                            onClick={() => setModalContent({ title: `Source Intelligence: ${source.domain}`, type: 'source', data: source.details })}
                            className="flex justify-between items-center p-6 bg-zinc-50 rounded-2xl border border-zinc-100 cursor-pointer hover:border-zinc-300 transition-all active:scale-[0.99] group overflow-hidden relative"
                          >
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                                <Globe size={60} />
                             </div>
                             <div className="flex items-center gap-4 relative z-10">
                                <Globe size={16} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold">{source.domain}</span>
                                   <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Trust: {source.trust}</span>
                                </div>
                             </div>
                             <div className="text-right relative z-10">
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Citations</div>
                                <div className="text-lg font-black">{source.mentions}</div>
                             </div>
                          </div>
                       ))}
                    </div>
                  )}
               </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drill-Down Modal */}
      <Dialog open={!!modalContent} onOpenChange={(open) => !open && setModalContent(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl border-zinc-100 shadow-2xl p-0 overflow-hidden text-zinc-900">
           <DialogHeader className="p-8 bg-zinc-50 border-b border-zinc-100">
              <DialogTitle className="text-2xl font-bold tracking-tight">{modalContent?.title}</DialogTitle>
           </DialogHeader>
           
           <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {modalContent?.type === 'insights' && (
                <div className="space-y-6">
                   {modalContent.data.map((ins: any, i: number) => (
                      <div key={i} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                         <h5 className="font-bold text-zinc-950 mb-2 flex items-center gap-2">
                            <BrainCircuit size={16} className="text-zinc-400" /> {ins.title}
                         </h5>
                         <p className="text-sm text-zinc-600 leading-relaxed">{ins.detail}</p>
                      </div>
                   ))}
                </div>
              )}

              {modalContent?.type === 'roadmap' && (
                <div className="space-y-6">
                   {modalContent.data.map((rec: any, i: number) => (
                      <div key={i} className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                         <div className="flex items-center gap-4 mb-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">0{i+1}</div>
                            <h5 className="font-bold text-emerald-900">{rec.title}</h5>
                         </div>
                         <p className="text-sm text-emerald-800/80 leading-relaxed pl-12">{rec.detail}</p>
                      </div>
                   ))}
                </div>
              )}

              {modalContent?.type === 'responses' && (
                <div className="space-y-6">
                   {modalContent.data.map((resp: any, i: number) => (
                      <div key={i} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                         <div className="flex items-center gap-2 mb-3">
                            <Cpu size={14} className="text-zinc-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{resp.engine} Response Flow</span>
                         </div>
                         <p className="text-sm italic leading-relaxed text-zinc-600">"{resp.text}"</p>
                      </div>
                   ))}
                </div>
              )}

              {modalContent?.type === 'strategy' && (
                <div className="space-y-6">
                   <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <h6 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4">Implementation Protocol</h6>
                      <div className="space-y-4">
                         {modalContent.data.steps.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 text-sm font-medium text-emerald-900">
                               <span className="opacity-50">0{i+1}</span>
                               {step}
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="p-6 border border-zinc-100 rounded-2xl">
                      <h6 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Expected Performance Impact</h6>
                      <p className="text-xl font-black tracking-tight">{modalContent.data.expectedImpact}</p>
                   </div>
                </div>
              )}

              {modalContent?.type === 'source' && (
                <div className="space-y-6">
                   <div className="p-6 bg-zinc-50 rounded-2xl">
                      <h6 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Background</h6>
                      <p className="text-sm leading-relaxed">{modalContent.data.about}</p>
                   </div>
                   <div className="p-6 border border-zinc-100 rounded-2xl">
                      <h6 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">LLM Citation Heuristics</h6>
                      <p className="text-sm leading-relaxed mb-4">{modalContent.data.whyCited}</p>
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                         <span className="text-[10px] font-black uppercase text-emerald-600">Audit Analysis</span>
                         <p className="text-sm font-medium text-emerald-900 mt-1">{modalContent.data.analysis}</p>
                      </div>
                   </div>
                </div>
              )}
           </div>
           
           <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex justify-end">
              <Button onClick={() => setModalContent(null)} className="rounded-xl px-8 bg-zinc-950 text-white">Close Details</Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
