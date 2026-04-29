import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, Cell, ComposedChart, Line, Area,
  PieChart, Pie, Legend
} from 'recharts';
import { 
  Search, 
  Loader2, 
  ShieldAlert, 
  Target, 
  Zap, 
  TrendingUp, 
  Layers, 
  ArrowRight,
  Fingerprint,
  Network,
  Scale,
  Brain,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Table as TableIcon,
  HelpCircle,
  AlertCircle,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { conductCompetitorAnalysis } from '../lib/gemini';
import { toast } from 'sonner';
import { exportToJSON, exportToCSV, exportReportToPDF } from '../lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface Competitor {
  name: string;
  url: string;
}

const CATEGORIES = [
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Healthcare & Medical",
  "Education & Training",
  "Real Estate",
  "Home Services",
  "Home & Living",
  "Automotive",
  "Finance",
  "Professional Services",
  "Travel & Hospitality",
  "Food & Beverage",
  "Fitness & Wellness",
  "Technology",
  "Marketing & Advertising",
  "Manufacturing",
  "E-commerce & Retail",
  "Entertainment & Media",
  "Telecommunications",
  "Logistics & Transportation",
  "Construction & Infrastructure",
  "Energy & Utilities",
  "Agriculture",
  "Legal Services",
  "Government / Nonprofit",
  "Pets & Animal Care",
  "Sports & Recreation",
  "Other (Manual Input)"
];

export default function CompetitorAnalysis() {
  const [myBrand, setMyBrand] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [location, setLocation] = useState('');
  const [competitors, setCompetitors] = useState<Competitor[]>([{ name: '', url: '' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, { name: '', url: '' }]);
    } else {
      toast.error('Maximum 5 competitors allowed for precision analysis');
    }
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const updateCompetitor = (index: number, field: keyof Competitor, value: string) => {
    const updated = [...competitors];
    updated[index][field] = value;
    setCompetitors(updated);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = category === "Other (Manual Input)" ? customCategory : category;

    if (!myBrand || !finalCategory) {
      toast.error('Brand and Category are required');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      // Filter out empty competitors
      const validCompetitors = competitors.filter(c => c.name.trim() !== '');

      const data = await conductCompetitorAnalysis({
        myBrand,
        category: finalCategory,
        competitors: validCompetitors,
        location: location.trim() || undefined
      });
      
      if (!data) throw new Error("Analysis failed");

      setResult(data);
      toast.success('Market Intelligence Synchronized');
    } catch (err) {
      console.error(err);
      toast.error('Failed to run engine audit');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalysis = (format: 'pdf' | 'csv' | 'json') => {
    if (!result) return;

    const fileName = `Competitor_Analysis_${myBrand.replace(/[^a-z0-9]/gi, '_')}`;

    if (format === 'json') {
      exportToJSON(result, fileName);
    } else if (format === 'csv') {
      exportToCSV(result.overallSov, `${fileName}_SOV`);
    } else if (format === 'pdf') {
      const sections = [
        { title: 'Market Category', content: category, type: 'text' as const },
        { title: 'Share of Voice (SOV)', content: result.overallSov, type: 'table' as const },
        { title: 'Favored External Sources', content: result.favoredSources.map((s: any) => `${s.source} favors ${s.favoredBrand}: ${s.context}`), type: 'list' as const },
        { title: 'Visibility Gap Analysis', content: result.gapAnalysis, type: 'table' as const },
        { title: 'Strategic Tactics', content: result.strategicInsights.map((i: any) => `${i.brand}: ${i.tactic} (${i.impact} Impact)`), type: 'list' as const },
      ];
      exportReportToPDF(`Competitor Intelligence: ${myBrand}`, sections);
    }
    toast.success(`Exporting as ${format.toUpperCase()}`);
  };

  const COLORS = ['#38bdf8', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#ef4444'];

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500 text-left">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-zinc-200">
              <ShieldAlert size={12} /> Competitive Intelligence
           </div>
           <h2 className="text-4xl font-black tracking-tighter text-zinc-950">Market Rivalry Audit</h2>
           <p className="text-muted-foreground text-sm font-medium max-w-xl leading-relaxed">
              Deconstruct rival influence across the generative knowledge base. Identify third-party citations fueling competitor visibility.
           </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-zinc-200 shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-zinc-50 border-b border-zinc-100 p-8">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Audit Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Your Brand</label>
                  <Input 
                    value={myBrand}
                    onChange={(e) => setMyBrand(e.target.value)}
                    placeholder="e.g. Acme Cloud"
                    className="h-12 border-zinc-100 rounded-xl font-bold bg-zinc-50/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Product Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 border border-zinc-100 rounded-xl font-bold bg-zinc-50/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/5 transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
               </div>

               {category === "Other (Manual Input)" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Custom Category</label>
                    <Input 
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom product category"
                      className="h-12 border-zinc-100 rounded-xl font-bold bg-zinc-50/50"
                    />
                  </motion.div>
               )}

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Target Location <span className="text-[8px] italic opacity-50 lowercase font-medium">(Optional)</span></label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. New York, USA or Global"
                      className="h-12 pl-12 border-zinc-100 rounded-xl font-bold bg-zinc-50/50"
                    />
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Rivals / Competitors</label>
                    <Button onClick={addCompetitor} variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full bg-zinc-100 hover:bg-zinc-200">
                       <Plus size={12} strokeWidth={3} className="text-zinc-950" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {competitors.map((comp, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 group"
                      >
                         <div className="flex-1 space-y-2">
                            <Input 
                               value={comp.name}
                               onChange={(e) => updateCompetitor(idx, 'name', e.target.value)}
                               placeholder="Competitor Name"
                               className="h-9 border-none bg-white font-bold text-xs shadow-sm"
                            />
                            <Input 
                               value={comp.url}
                               onChange={(e) => updateCompetitor(idx, 'url', e.target.value)}
                               placeholder="URL (Optional)"
                               className="h-9 border-none bg-white font-bold text-xs shadow-sm mt-1"
                            />
                         </div>
                         {competitors.length > 1 && (
                           <button onClick={() => removeCompetitor(idx)} className="text-zinc-300 hover:text-rose-500 transition-colors p-2 h-fit">
                              <Trash2 size={14} />
                           </button>
                         )}
                      </motion.div>
                    ))}
                  </div>
               </div>

               <Button 
                 onClick={handleAnalyze}
                 disabled={loading || !myBrand}
                 className="w-full h-14 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-zinc-950/20 active:scale-95 transition-all mt-4"
               >
                 {loading ? <Loader2 className="animate-spin mr-2" /> : <Layers size={18} className="mr-2" />}
                 Deep Global Audit
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Report Side */}
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
           {loading ? (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="h-full min-h-[600px] aesthetic-card flex flex-col items-center justify-center space-y-10"
             >
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-zinc-100 border-t-zinc-950 animate-spin" />
                   <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-950" size={32} />
                </div>
                <div className="text-center space-y-3">
                   <p className="text-2xl font-black tracking-tight text-zinc-950">Synthesizing Rival Influence Map...</p>
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] animate-pulse">
                      Consulting generative engine training nodes
                   </p>
                </div>
             </motion.div>
           ) : result ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-8"
             >
                {/* Location Specific Insights if available */}
                {result.locationInsights && (
                  <Card className="border-zinc-200 rounded-[2rem] shadow-xl overflow-hidden p-8 bg-zinc-50 border-dashed border-2">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-zinc-950 text-white rounded-lg">
                         <Globe size={16} />
                       </div>
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Regional Intelligence</h3>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 leading-relaxed italic">
                      "{result.locationInsights}"
                    </p>
                  </Card>
                )}

                {/* Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden p-10 bg-white">
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Share of Voice (SOV)</h3>
                            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                               <TrendingUp size={16} />
                            </div>
                         </div>
                         <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                  <Pie
                                    data={result.overallSov}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="percentage"
                                  >
                                     {result.overallSov.map((entry: any, index: number) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                     ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                  />
                               </PieChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            {result.overallSov.map((entry: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                 <span className="text-[10px] font-black text-zinc-600 truncate">{entry.name}</span>
                                 <span className="text-[10px] font-black text-zinc-950 ml-auto">{entry.percentage}%</span>
                              </div>
                            ))}
                         </div>
                      </div>
                   </Card>

                   <Card className="border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden p-10 bg-white">
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Engine Dominance Matrix</h3>
                            <div className="p-2 bg-zinc-100 text-zinc-950 rounded-xl">
                               <Zap size={16} />
                            </div>
                         </div>
                         <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.visibilityByEngine}>
                                  <PolarGrid stroke="#f4f4f5" />
                                  <PolarAngleAxis dataKey="engine" stroke="#a1a1aa" fontSize={10} fontWeight={900} />
                                  {result.overallSov.map((brand: any, idx: number) => (
                                    <Radar
                                      key={brand.name}
                                      name={brand.name}
                                      dataKey={(data: any) => data.scores[brand.name]}
                                      stroke={COLORS[idx % COLORS.length]}
                                      fill={COLORS[idx % COLORS.length]}
                                      fillOpacity={0.4}
                                    />
                                  ))}
                                  <Tooltip />
                               </RadarChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                   </Card>
                </div>

                {/* Market Positioning Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {(result.marketPositioning || []).map((pos: any, i: number) => (
                     <Card key={i} className="border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden p-8 bg-white group transition-all hover:scale-[1.02]">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <Badge className={cn(
                                "text-[9px] font-black uppercase px-3 py-1 border-none",
                                pos.position === 'Leader' ? "bg-emerald-500 text-white" : 
                                pos.position === 'Challenger' ? "bg-amber-500 text-white" : "bg-zinc-500 text-white"
                              )}>
                                {pos.position}
                              </Badge>
                              <Network size={16} className="text-zinc-200" />
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-zinc-950">{pos.brand}</h4>
                              <p className="text-xs text-zinc-500 font-bold mt-2 leading-relaxed">{pos.reasoning}</p>
                           </div>
                        </div>
                     </Card>
                   ))}
                </div>

                {/* Third Party Sources */}
                <Card className="border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden p-10 bg-white">
                   <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <div>
                            <h3 className="text-xl font-black tracking-tight text-zinc-950">Biased External Clusters</h3>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Sources fueling rival generative authority</p>
                         </div>
                         <Badge className="bg-rose-50 text-rose-500 border-none font-black text-[10px] px-4 py-1.5 rounded-full">Citation Leakage</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {result.favoredSources.map((source: any, i: number) => (
                           <motion.div 
                              key={i}
                              whileHover={{ scale: 1.02 }}
                              className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-4"
                           >
                              <div className="flex items-start justify-between">
                                 <div className="h-10 w-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                                    <Globe size={18} className="text-zinc-400" />
                                 </div>
                                 <Badge className="bg-zinc-950 text-white font-black text-[9px] uppercase">Favors {source.favoredBrand}</Badge>
                              </div>
                              <div className="space-y-1">
                                 <h4 className="text-xs font-black uppercase tracking-tight text-zinc-950">{source.source}</h4>
                                 <p className="text-[11px] text-zinc-500 font-bold leading-relaxed">{source.context}</p>
                              </div>
                              <a href={source.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-zinc-400 hover:text-zinc-950 transition-colors pt-2">
                                 View Source <ExternalLink size={10} />
                              </a>
                           </motion.div>
                         ))}
                      </div>
                   </div>
                </Card>

                {/* Gap Analysis Table */}
                <Card className="border-zinc-200 rounded-[2.5rem] shadow-xl overflow-hidden bg-white">
                   <div className="p-10 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
                            <AlertCircle size={20} />
                         </div>
                         <div>
                            <h3 className="text-xl font-black tracking-tight text-zinc-950">Visibility Gap Analysis</h3>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">High-intent prompts where rivals are monopolizing citations</p>
                         </div>
                      </div>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-zinc-50/50">
                            <tr>
                               <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Target Intent / Prompt</th>
                               <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Dominant Rival</th>
                               <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Missed Opportunity</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-zinc-100">
                            {result.gapAnalysis.map((gap: any, i: number) => (
                              <tr key={i} className="hover:bg-zinc-50/30 transition-colors">
                                 <td className="px-10 py-6">
                                    <p className="text-xs font-black text-zinc-950 italic">"{gap.prompt}"</p>
                                 </td>
                                 <td className="px-10 py-6">
                                    <Badge className="bg-zinc-100 text-zinc-950 font-black text-[9px] uppercase border-none px-3">{gap.dominatingBrand}</Badge>
                                 </td>
                                 <td className="px-10 py-6">
                                    <p className="text-xs font-bold text-zinc-500">{gap.missedOpportunity}</p>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </Card>

                {/* Strategic Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {result.strategicInsights.map((insight: any, i: number) => (
                      <Card key={i} className="border-zinc-200 rounded-[2rem] shadow-lg p-8 bg-zinc-950 text-white group cursor-default">
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <Badge className="bg-white/10 text-white/50 border-none font-black text-[8px] uppercase tracking-widest">{insight.brand} Protocol</Badge>
                               <div className={`p-1.5 rounded-lg ${insight.impact === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                  <Zap size={12} />
                               </div>
                            </div>
                            <h4 className="text-sm font-black tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">{insight.tactic}</h4>
                            <div className="flex items-center gap-2 pt-2">
                               <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className={`h-full ${insight.impact === 'High' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: insight.impact === 'High' ? '90%' : '50%' }} />
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{insight.impact} IMPACT</span>
                            </div>
                         </div>
                      </Card>
                   ))}
                </div>
             </motion.div>
           ) : (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="h-full min-h-[600px] border-2 border-dashed border-zinc-100 rounded-[3rem] flex flex-col items-center justify-center text-center p-20"
             >
                <div className="w-24 h-24 rounded-full bg-zinc-50 flex items-center justify-center mb-8">
                   <Target size={40} className="text-zinc-200" strokeWidth={1} />
                </div>
                <h3 className="text-3xl font-black tracking-tight text-zinc-950">Market Silent Mode</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-4 max-w-sm leading-relaxed">
                   Synchronize with external market data to deconstruct competitor influence across the global knowledge base.
                </p>
             </motion.div>
           )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

