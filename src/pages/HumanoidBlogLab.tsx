import React, { useState } from 'react';
import { 
  Layout, 
  Search, 
  Plus, 
  Loader2, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Globe,
  Zap,
  Target,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button, buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { performKeywordResearch, generateHumanoidBlog, generateBlogIdeas, humanizeBlog, editBlogWithChat } from '../lib/gemini';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { exportToJSON, exportToCSV, exportReportToPDF } from '../lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function HumanoidBlogLab() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandName, setBrandName] = useState('');
  const [blogTopic, setBlogTopic] = useState('');
  const [primaryKey, setPrimaryKey] = useState('');
  
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  
  const [researchResults, setResearchResults] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [generatedBlog, setGeneratedBlog] = useState('');
  
  const [blogStep, setBlogStep] = useState<'input' | 'ideas' | 'research' | 'reading'>('input');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [researching, setResearching] = useState(false);
  const [writing, setWriting] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const handleInitialAnalysis = async () => {
    if (!websiteUrl) return toast.error("Website URL is required for domain analysis");
    setAnalyzing(true);
    try {
      const result = await generateBlogIdeas({
        url: websiteUrl,
        brandName,
        topic: blogTopic,
        keywords: primaryKey
      });
      if (result) {
        setAnalysisData(result.analysis);
        
        let finalIdeas = [...(result.ideas || [])];
        
        // Safety: If user provided a topic but it's not in the list or was modified,
        // force the exact user input into the ideas list to guarantee immutability.
        if (blogTopic.trim()) {
           const userIdeaIndex = finalIdeas.findIndex(i => i.isUserInput);
           if (userIdeaIndex !== -1) {
             finalIdeas[userIdeaIndex].title = blogTopic; // Ensure EXACT match
           } else {
             // If AI missed it, add it manually
             finalIdeas.unshift({
               title: blogTopic,
               description: "User-defined custom blog topic.",
               impactScore: 100,
               rational: "Directly requested target topic.",
               isUserInput: true
             });
           }
        }

        setIdeas(finalIdeas.sort((a: any, b: any) => {
          if (a.isUserInput) return -1;
          if (b.isUserInput) return 1;
          return b.impactScore - a.impactScore;
        }));
        setBlogStep('ideas');
        toast.success("Domain Intelligence Synchronized");
      }
    } catch (err) {
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectIdea = async (idea: any) => {
    setSelectedIdea(idea);
    setResearching(true);
    setBlogStep('research');
    try {
      const data = await performKeywordResearch(idea.title, primaryKey);
      setResearchResults(data.keywords || []);
      
      // Auto-select user-provided keywords and merge with primaryKey logic
      const userKeywords = (data.keywords || [])
        .filter((k: any) => k.isUserInput)
        .map((k: any) => k.keyword);
        
      if (primaryKey || userKeywords.length > 0) {
        const pkws = primaryKey.split(',').map(s => s.trim().toLowerCase());
        const matchedKeywords = (data.keywords || [])
          .filter((k: any) => pkws.includes(k.keyword.toLowerCase()))
          .map((k: any) => k.keyword);
          
        // Combine unique keywords
        setSelectedKeys(Array.from(new Set([...userKeywords, ...matchedKeywords])));
      } else {
        setSelectedKeys([]);
      }
      toast.success("Keyword clusters identified");
    } catch (err) {
      toast.error("Keyword generation failed");
    } finally {
      setResearching(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (selectedKeys.length === 0) return toast.error("Select at least one keyword");
    setWriting(true);
    try {
      // Pass 1: Initial Generation
      const initialBlog = await generateHumanoidBlog({
        topic: selectedIdea.title,
        selectedKeywords: selectedKeys,
        brandName,
        tone: "Authoritative & Humanoid"
      });
      
      if (!initialBlog) throw new Error("Initial generation failed");

      // Pass 2: Automatic Humanization Refinement (as requested)
      toast.info("Refining humanoid flow...");
      const refinedBlog = await humanizeBlog(initialBlog, selectedIdea.title, brandName);
      
      setGeneratedBlog(refinedBlog || initialBlog);
      setBlogStep('reading');
      toast.success("High-fidelity humanoid blog synthesized");
    } catch (err) {
      toast.error("Generation failed");
    } finally {
      setWriting(false);
    }
  };

  const handleHumanize = async () => {
    setIsHumanizing(true);
    try {
      const humanized = await humanizeBlog(generatedBlog, selectedIdea.title, brandName);
      setGeneratedBlog(humanized || generatedBlog);
      toast.success("Content reinforced with human nuance");
    } catch (err) {
      toast.error("Humanization failed");
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleChatEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    
    setIsChatting(true);
    try {
      const updated = await editBlogWithChat({
        content: generatedBlog,
        topic: selectedIdea.title,
        instruction: chatInput,
        brandName
      });
      setGeneratedBlog(updated || generatedBlog);
      setChatInput('');
      toast.success("Blog updated successfully");
    } catch (err) {
      toast.error("Refinement failed");
    } finally {
      setIsChatting(false);
    }
  };

  const toggleKeyword = (kw: string) => {
    setSelectedKeys(prev => prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]);
  };

  const exportBlog = (format: 'pdf' | 'csv' | 'json') => {
    if (!generatedBlog) return;

    const fileName = `Blog_${(selectedIdea?.title || 'Unknown').replace(/[^a-z0-9]/gi, '_')}`;

    if (format === 'json') {
      exportToJSON({ topic: selectedIdea?.title, keywords: selectedKeys, content: generatedBlog }, fileName);
    } else if (format === 'csv') {
      exportToCSV([{ topic: selectedIdea?.title, content: generatedBlog }], fileName);
    } else if (format === 'pdf') {
      const sections = [
        { title: 'Idea', content: selectedIdea?.title, type: 'text' as const },
        { title: 'Description', content: selectedIdea?.description, type: 'text' as const },
        { title: 'Keywords Used', content: selectedKeys, type: 'list' as const },
        { title: 'Blog Content', content: generatedBlog, type: 'text' as const },
      ];
      exportReportToPDF(`Humanoid Blog: ${selectedIdea?.title}`, sections);
    }
    toast.success(`Exporting as ${format.toUpperCase()}`);
  };

  const resetAll = () => {
    setBlogStep('input');
    setSelectedKeys([]);
    setResearchResults([]);
    setGeneratedBlog('');
    setBlogTopic('');
    setPrimaryKey('');
    setWebsiteUrl('');
    setBrandName('');
    setAnalysisData(null);
    setIdeas([]);
    setSelectedIdea(null);
    setChatInput('');
  };

  return (
    <div className="space-y-10 pb-20 text-left animate-fade-in">
       <header className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-800">
                <Sparkles size={12} className="text-indigo-400" /> Domain-First Content Lab
             </div>
             <h2 className="text-4xl font-black tracking-tighter text-zinc-950">Humanoid Blog Lab</h2>
             <p className="text-zinc-500 font-medium max-w-lg">Synthesize AI-proof, humanoid content using 2026 keyword intelligence and domain-first ideation.</p>
          </div>
       </header>

       <div className="max-w-5xl mx-auto">
          <Card className="aesthetic-card p-0 overflow-hidden border-zinc-200 shadow-xl rounded-[2.5rem]">
              <div className="p-8 border-b border-zinc-100 bg-zinc-950 flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Layout size={14} className="text-indigo-400" /> Lab Controller
                </h4>
                <div className="flex items-center gap-2">
                  {generatedBlog && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ size: "sm" }), "h-7 bg-indigo-500 hover:bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg px-3 flex items-center")}>
                        <Download size={12} className="mr-1" /> Export
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden min-w-[140px] z-[100]">
                        <DropdownMenuItem onClick={() => exportBlog('pdf')} className="flex items-center gap-2 p-2 text-[10px] font-bold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <FileText size={12} className="text-rose-500" /> PDF Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportBlog('csv')} className="flex items-center gap-2 p-2 text-[10px] font-bold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <FileSpreadsheet size={12} className="text-emerald-500" /> CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportBlog('json')} className="flex items-center gap-2 p-2 text-[10px] font-bold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <FileJson size={12} className="text-amber-500" /> JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {blogStep !== 'input' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetAll} 
                      className="h-7 text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      Reset Session
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-8 space-y-6 bg-white dark:bg-zinc-950 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {blogStep === 'input' && (
                      <motion.div 
                        key="input"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                          <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl mb-6">
                            <h5 className="text-xs font-black text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={14} className="animate-pulse" /> New: Domain-First Workflow
                            </h5>
                            <p className="text-[12px] font-medium text-indigo-300 leading-relaxed">
                                Provide your website URL and our engine will perform a full semantic audit to identify high-impact content opportunities before generating humanoid blogs.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                             <div className="space-y-2">
                                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                     Website URL <span className="text-rose-500">*</span>
                                 </label>
                                 <div className="relative">
                                     <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                     <Input 
                                       value={websiteUrl}
                                       onChange={(e) => setWebsiteUrl(e.target.value)}
                                       placeholder="e.g. acmecorp.com"
                                       className="pl-12 rounded-xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-14 font-bold dark:text-zinc-100"
                                     />
                                 </div>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                     Brand Name <span className="text-[8px] opacity-60 font-medium lowercase italic">(Optional)</span>
                                 </label>
                                 <div className="relative">
                                     <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                                     <Input 
                                       value={brandName}
                                       onChange={(e) => setBrandName(e.target.value)}
                                       placeholder="e.g. Acme Cloud"
                                       className="pl-12 rounded-xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-14 font-bold dark:text-zinc-100"
                                     />
                                 </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    Target Topic <span className="text-[8px] opacity-60 font-medium lowercase italic">(Optional)</span>
                                </label>
                                <Input 
                                  value={blogTopic}
                                  onChange={(e) => setBlogTopic(e.target.value)}
                                  placeholder="e.g. Sustainable AI 2026"
                                  className="rounded-xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-14 font-bold dark:text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    Primary Keywords <span className="text-[8px] opacity-60 font-medium lowercase italic">(Optional)</span>
                                </label>
                                <Input 
                                  value={primaryKey}
                                  onChange={(e) => setPrimaryKey(e.target.value)}
                                  placeholder="e.g. circular economy, ai ethics"
                                  className="rounded-xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-14 font-bold dark:text-zinc-100"
                                />
                            </div>
                          </div>
                          
                          <Button 
                            onClick={handleInitialAnalysis}
                            disabled={analyzing || !websiteUrl}
                            className="w-full h-20 bg-zinc-950 dark:bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all group mt-4"
                          >
                            {analyzing ? <Loader2 className="animate-spin mr-2" /> : <Search size={20} className="mr-2 group-hover:scale-110 transition-transform" />}
                            Sync Domain Intelligence & Extract Ideas
                          </Button>
                      </motion.div>
                    )}

                    {blogStep === 'ideas' && (
                      <motion.div 
                        key="ideas"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Strategic Ideation Layer</h5>
                                <h4 className="text-xl font-black text-zinc-900 dark:text-white">Recommended Blog Architecture</h4>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] py-1.5 px-4 rounded-lg">
                                ANALYSIS COMPLETE
                            </Badge>
                          </div>

                          {analysisData && (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-2">
                                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Core Topics</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(analysisData.coreTopics || []).map((t: string) => (
                                            <Badge key={t} variant="secondary" className="text-[9px] font-bold bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700">{t}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-2">
                                    <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Content Gaps</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(analysisData.contentGaps || []).map((t: string) => (
                                            <Badge key={t} className="text-[9px] font-bold bg-rose-500/10 text-rose-500 border-none">{t}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-2">
                                    <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Opportunities</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(analysisData.opportunities || []).map((t: string) => (
                                            <Badge key={t} className="text-[9px] font-bold bg-indigo-500/10 text-indigo-500 border-none">{t}</Badge>
                                        ))}
                                    </div>
                                </div>
                             </div>
                          )}

                          <div className="space-y-4">
                            {(ideas || []).map((idea, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleSelectIdea(idea)}
                                    className="group p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-xl hover:translate-y-[-2px]"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-indigo-600 text-white text-[9px] font-black h-5 uppercase">Idea #{idx+1}</Badge>
                                            {idea.isUserInput && (
                                              <Badge className="bg-amber-500 text-white text-[9px] font-black h-5 uppercase flex items-center gap-1">
                                                <Target size={10} /> User Input
                                              </Badge>
                                            )}
                                            <h5 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">{idea.title}</h5>
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">{idea.description}</p>
                                        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg inline-block">
                                            Rational: {idea.rational}
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 md:pl-6">
                                        <div className="text-center">
                                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Impact</div>
                                            <div className="text-2xl font-black text-indigo-600">{idea.impactScore}%</div>
                                        </div>
                                        <div className="ml-auto md:ml-0 w-10 h-10 rounded-full bg-zinc-900 dark:bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                          </div>

                          <div className="pt-4">
                             <Button 
                                variant="outline"
                                onClick={() => setBlogStep('input')}
                                className="h-14 px-8 rounded-2xl border-zinc-200 font-bold text-zinc-500"
                             >
                                <ChevronLeft size={16} className="mr-2" /> Back to Config
                             </Button>
                          </div>
                      </motion.div>
                    )}

                    {blogStep === 'research' && (
                      <motion.div 
                        key="research"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                          <div className="flex items-center justify-between px-1">
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Selected Idea: {selectedIdea?.title}</h5>
                                <p className="text-xs text-zinc-500">Pick 2026 keyword clusters to reinforce GEO authority</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-black border-zinc-200 dark:border-zinc-800 text-zinc-500">Keyword Expansion</Badge>
                          </div>

                          {researching ? (
                             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="animate-spin text-indigo-500" size={40} />
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">Scanning 2026 Semantic Space...</div>
                             </div>
                          ) : (
                             <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(researchResults || []).sort((a: any, b: any) => {
                                          if (a.isUserInput && !b.isUserInput) return -1;
                                          if (!a.isUserInput && b.isUserInput) return 1;
                                          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
                                        }).map((kw: any) => (
                                          <div 
                                            key={kw.keyword}
                                            onClick={() => toggleKeyword(kw.keyword)}
                                            className={`relative p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${selectedKeys.includes(kw.keyword) ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 dark:text-zinc-300'}`}
                                          >
                                            {kw.isUserInput && (
                                              <div className="absolute -top-2 -left-2 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                                                <Sparkles size={8} /> USER INPUT
                                              </div>
                                            )}
                                            <div className="space-y-1">
                                                <div className="text-sm font-black tracking-tight">{kw.keyword}</div>
                                                <div className={`text-[10px] uppercase tracking-widest font-black ${selectedKeys.includes(kw.keyword) ? 'text-indigo-200' : 'text-zinc-400'}`}>
                                                  {kw.intent} • {kw.volume} / mo • Score: {kw.relevanceScore}%
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                              <Badge className={`${kw.trend.startsWith('+') || kw.trend === 'explosive' || kw.trend === 'rising' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'} text-[9px] font-black h-5 border-none px-2 uppercase`}>
                                                  {kw.trend}
                                              </Badge>
                                              {selectedKeys.includes(kw.keyword) && <TrendingUp size={14} className="text-white animate-pulse" />}
                                            </div>
                                          </div>
                                    ))}
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <Button 
                                        variant="outline"
                                        onClick={() => setBlogStep('ideas')}
                                        className="h-16 px-8 rounded-2xl border-zinc-200 font-bold text-zinc-500"
                                    >
                                        Back
                                    </Button>
                                    <Button 
                                        onClick={handleGenerateBlog}
                                        disabled={writing || selectedKeys.length === 0}
                                        className="flex-1 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all disabled:opacity-50"
                                    >
                                        {writing ? <Loader2 className="animate-spin mr-2" /> : <ChevronRight size={18} className="mr-2" />}
                                        Generate Humanoid Content with {selectedKeys.length} Keywords
                                    </Button>
                                </div>
                             </>
                          )}
                      </motion.div>
                    )}

                     {blogStep === 'reading' && (
                      <motion.div 
                        key="reading"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                      >
                          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                   <MessageSquare size={14} className="text-emerald-500" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Synthesis Complete: Humanoid Check Passed</span>
                                  <span className="text-[8px] font-bold text-zinc-400">Target: {selectedIdea?.title}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <Button 
                                  onClick={handleHumanize}
                                  disabled={isHumanizing}
                                  variant="outline"
                                  className="h-8 rounded-lg border-indigo-200 text-indigo-600 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50"
                                >
                                  {isHumanizing ? <Loader2 size={12} className="animate-spin mr-1" /> : <Sparkles size={12} className="mr-1" />}
                                  Humanize Further
                                </Button>
                                <Badge className="bg-emerald-500 text-white text-[9px] font-black">2026 CONTENT SECURED</Badge>
                             </div>
                          </div>
                          
                          <div className="prose prose-zinc dark:prose-invert max-w-none">
                            <div className="p-10 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 markdown-body text-base font-medium leading-relaxed dark:text-zinc-300 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 flex flex-wrap justify-end gap-1 pointer-events-none opacity-20">
                                  {selectedKeys.map(k => (
                                    <Badge key={k} variant="outline" className="text-[8px] font-bold border-zinc-300">{k}</Badge>
                                  ))}
                                </div>
                                <ReactMarkdown>{generatedBlog}</ReactMarkdown>
                            </div>
                          </div>

                          {/* Chat Interface */}
                          <div className="mt-12 space-y-4">
                            <div className="flex items-center gap-2 px-2">
                              <MessageSquare size={14} className="text-zinc-400" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Refinement Dialogue</span>
                            </div>
                            <form onSubmit={handleChatEdit} className="relative group">
                              <Input 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="e.g., 'Make the introduction shorter', 'Add a section about future trends'..."
                                className="h-16 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pr-32 font-medium shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                              />
                              <Button 
                                type="submit"
                                disabled={isChatting || !chatInput.trim()}
                                className="absolute right-2 top-2 bottom-2 h-auto px-6 bg-zinc-950 dark:bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest"
                              >
                                {isChatting ? <Loader2 size={14} className="animate-spin" /> : "Update Blog"}
                              </Button>
                            </form>
                          </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
          </Card>
       </div>
    </div>
  );
}
