import React, { useState } from 'react';
import { 
  Wand2, 
  Save, 
  Copy, 
  Download, 
  Share2, 
  Sparkles, 
  Loader2, 
  Type, 
  FileText, 
  MessageSquare, 
  Layout, 
  Check, 
  Settings2,
  Fingerprint,
  Users,
  Target,
  Hash,
  Table as TableIcon,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { Button, buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { generateCitableContent } from '../lib/gemini';
import { toast } from 'sonner';
import { exportToJSON, exportToCSV, exportReportToPDF } from '../lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface CitableOutput {
  brief: string;
  comparisonTable: { headers: string[], rows: string[][] };
  faqs: { question: string, answer: string }[];
  draft: string;
}

export default function ContentGenerator() {
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandVoice, setBrandVoice] = useState('Authoritative');
  const [persona, setPersona] = useState('');
  const [citationGaps, setCitationGaps] = useState('');
  
  const [output, setOutput] = useState<CitableOutput | null>(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [activeTab, setActiveTab] = useState<'brief' | 'table' | 'faq' | 'draft'>('brief');

  const handleGenerate = async () => {
    if (!keywords) {
      toast.error('Seed keywords are required');
      return;
    }
    setLoading(true);
    setOutput(null);
    
    try {
      const pipelineSteps = [0, 1, 2, 3];
      for (const step of pipelineSteps) {
        setActiveStep(step);
        await new Promise(r => setTimeout(r, 600));
      }

      const content = await generateCitableContent({
        keywords,
        brandName,
        brandVoice,
        persona,
        citationGaps
      });

      if (content) {
        setOutput(content);
        toast.success('Citable content synthesized');
      } else {
        toast.error('Synthesis failed. Check engine status.');
      }
    } catch (err) {
      toast.error('Synthesis engine failure');
    } finally {
      setLoading(false);
      setActiveStep(-1);
    }
  };

  const steps = [
    { title: 'Grounding', desc: 'Neural search discovery' },
    { title: 'Structuring', desc: 'Entity extraction' },
    { title: 'Drafting', desc: 'High-authority synthesis' },
    { title: 'Review', desc: 'Citation validation' }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportContent = (format: 'pdf' | 'csv' | 'json') => {
    if (!output) return;

    const fileName = `Content_${keywords.replace(/[^a-z0-9]/gi, '_')}`;

    if (format === 'json') {
      exportToJSON(output, fileName);
    } else if (format === 'csv') {
      exportToCSV([
        { type: 'Brief', content: output.brief },
        { type: 'Draft', content: output.draft },
      ], fileName);
    } else if (format === 'pdf') {
      const sections = [
        { title: 'Content Brief', content: output.brief, type: 'text' as const },
        { title: 'Comparison Matrix', content: output.comparisonTable.rows.map(row => {
            const obj: any = {};
            output.comparisonTable.headers.forEach((h, i) => obj[h] = row[i]);
            return obj;
          }), type: 'table' as const },
        { title: 'Structured FAQs', content: output.faqs.map(f => `${f.question}: ${f.answer}`), type: 'list' as const },
        { title: 'Final Draft', content: output.draft, type: 'text' as const },
      ];
      exportReportToPDF(`Citable Asset Report: ${keywords}`, sections);
    }
    toast.success(`Exporting as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500 text-left">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-zinc-200">
              <Type size={12} /> Citable Asset Synthesis
           </div>
           <h2 className="text-3xl font-black tracking-tighter text-zinc-950">Content Studio</h2>
           <p className="text-muted-foreground text-sm font-medium max-w-xl">
              Architect high-fidelity, citation-ready assets designed to dominate Generative Engine results.
           </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 h-10 px-4 text-[11px] font-black uppercase tracking-widest">
              <Save size={14} className="mr-2" /> Templates
           </Button>
           <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 h-10 px-4 text-[11px] font-black uppercase tracking-widest">
              <Settings2 size={14} className="mr-2" /> Engine Config
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
           <div className="aesthetic-card p-8">
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block flex items-center gap-2">
                       <Sparkles size={12} className="text-amber-500" /> Brand Name
                    </label>
                    <Input 
                       value={brandName}
                       onChange={(e) => setBrandName(e.target.value)}
                       placeholder="e.g., Acme Cloud, TechFlow Solutions..."
                       className="rounded-xl bg-zinc-50 border-zinc-100 font-bold text-sm"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block flex items-center gap-2">
                       <Hash size={12} /> Seed Keywords
                    </label>
                    <Input 
                       value={keywords}
                       onChange={(e) => setKeywords(e.target.value)}
                       placeholder="e.g., Enterprise SaaS GEO, AI SEO Tactic..."
                       className="rounded-xl bg-zinc-50 border-zinc-100 font-bold text-sm"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block flex items-center gap-2">
                       <Target size={12} /> Citation Gaps
                    </label>
                    <textarea 
                       value={citationGaps}
                       onChange={(e) => setCitationGaps(e.target.value)}
                       placeholder="Mention topics where competitors serve as citations but you don't..."
                       className="w-full h-24 bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-xs text-foreground outline-none focus:border-zinc-300 transition-all resize-none font-bold"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block flex items-center gap-2">
                       <Users size={12} /> Target Persona
                    </label>
                    <Input 
                       value={persona}
                       onChange={(e) => setPersona(e.target.value)}
                       placeholder="e.g., CTO, Content Director, SEO Pro..."
                       className="rounded-xl bg-zinc-50 border-zinc-100 font-bold text-sm"
                    />
                 </div>

                 <div className="space-y-4 pt-6 border-t border-zinc-100">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block flex items-center gap-2">
                       <Fingerprint size={12} /> Brand Voice
                    </label>
                     <div className="grid grid-cols-2 gap-2">
                       {['Authoritative', 'Technical', 'Neutral', 'Direct'].map(t => (
                          <button 
                            key={t} 
                            onClick={() => setBrandVoice(t)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${brandVoice === t ? 'bg-zinc-950 text-white border-transparent shadow-md font-bold' : 'border-zinc-100 hover:bg-zinc-50 group'}`}
                          >
                             <span className={`text-[9px] font-black uppercase tracking-tight ${brandVoice === t ? '' : 'text-zinc-400 group-hover:text-zinc-950'}`}>{t}</span>
                             {brandVoice === t && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                          </button>
                       ))}
                    </div>
                 </div>

                 <Button 
                   onClick={handleGenerate}
                   disabled={loading || !keywords}
                   className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl h-14 text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-zinc-950/10"
                 >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />}
                    Generate Citable Asset
                 </Button>
              </div>
           </div>

           <div className="aesthetic-card overflow-hidden">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synthesis Pipeline</h3>
              </div>
              <div className="divide-y divide-zinc-100">
                 {steps.map((s, i) => (
                   <div key={i} className={`p-4 flex items-center gap-4 transition-colors ${activeStep === i ? 'bg-emerald-50/50' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all ${activeStep >= i ? 'border-zinc-950 bg-zinc-950 text-white shadow-lg' : 'border-zinc-100 text-zinc-300'}`}>
                         {activeStep > i ? <Check size={12} strokeWidth={4} /> : <span className="text-[10px] font-black">{i+1}</span>}
                      </div>
                      <div>
                         <p className={`text-[10px] font-black uppercase tracking-widest ${activeStep >= i ? 'text-zinc-950' : 'text-zinc-400'}`}>{s.title}</p>
                         <p className="text-[9px] font-bold text-zinc-400">{s.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Editor Output */}
        <div className="lg:col-span-8">
           <div className="aesthetic-card h-full min-h-[700px] flex flex-col overflow-hidden relative border-zinc-200">
              <div className="bg-zinc-50 border-b border-zinc-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'brief', label: 'Brief', icon: Layout },
                      { id: 'table', label: 'Comp Matrix', icon: TableIcon },
                      { id: 'faq', label: 'FAQ', icon: HelpCircle },
                      { id: 'draft', label: 'Draft', icon: FileText }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === tab.id ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-950'}`}
                      >
                         <tab.icon size={12} />
                         {tab.label}
                      </button>
                    ))}
                 </div>
                 {output && (
                   <div className="flex items-center gap-2">
                      <Button onClick={() => copyToClipboard(activeTab === 'brief' ? output.brief : activeTab === 'draft' ? output.draft : JSON.stringify(output[activeTab as keyof CitableOutput]))} variant="ghost" size="sm" className="h-10 w-10 text-zinc-400 hover:text-zinc-950 rounded-xl">
                         <Copy size={16} /> 
                      </Button>
                      <DropdownMenu>
                         <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-10 w-10 text-zinc-400 hover:text-zinc-950 rounded-xl flex items-center justify-center")}>
                           <Download size={16} /> 
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="bg-white border-zinc-200 rounded-xl overflow-hidden min-w-[160px]">
                            <DropdownMenuItem onClick={() => exportContent('pdf')} className="flex items-center gap-2 p-3 text-xs font-bold cursor-pointer hover:bg-zinc-50">
                              <FileText size={14} className="text-rose-500" /> PDF Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportContent('csv')} className="flex items-center gap-2 p-3 text-xs font-bold cursor-pointer hover:bg-zinc-50">
                              <FileSpreadsheet size={14} className="text-emerald-500" /> CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportContent('json')} className="flex items-center gap-2 p-3 text-xs font-bold cursor-pointer hover:bg-zinc-50">
                              <FileJson size={14} className="text-amber-500" /> JSON
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                   </div>
                 )}
              </div>

              <div className="flex-1 overflow-auto p-10 custom-scrollbar bg-white">
                 <AnimatePresence mode="wait">
                 {loading ? (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="h-full flex flex-col items-center justify-center space-y-10 py-20"
                   >
                      <div className="relative">
                         <div className="w-24 h-24 rounded-full border-4 border-zinc-100 border-t-zinc-950 animate-spin" />
                         <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-950" size={32} />
                      </div>
                      <div className="text-center space-y-3">
                         <p className="text-2xl font-black tracking-tight text-zinc-950">Synthesizing high-authority asset...</p>
                         <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest animate-pulse">
                            Consulting neural graphs for citation opportunities
                         </p>
                      </div>
                   </motion.div>
                 ) : output ? (
                   <motion.div 
                     key={activeTab}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-left"
                   >
                      {activeTab === 'brief' && (
                        <div className="markdown-body prose prose-zinc max-w-none">
                           <ReactMarkdown>{output.brief}</ReactMarkdown>
                        </div>
                      )}

                      {activeTab === 'table' && (
                        <div className="space-y-8">
                           <div className="space-y-4">
                              <h3 className="text-xl font-black tracking-tight">Comparison Matrix</h3>
                              <p className="text-sm text-zinc-500 font-medium">Data optimized for direct extraction into generative results.</p>
                           </div>
                           <div className="border border-zinc-100 rounded-[2rem] overflow-hidden shadow-sm">
                              <table className="w-full">
                                 <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                       {(output.comparisonTable?.headers || []).map((h, i) => (
                                         <th key={i} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">{h}</th>
                                       ))}
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-zinc-100">
                                    {(output.comparisonTable?.rows || []).map((row, ri) => (
                                      <tr key={ri} className="hover:bg-zinc-50/50 transition-colors">
                                         {(row || []).map((cell, ci) => (
                                           <td key={ci} className="px-6 py-5 text-xs font-bold text-zinc-600">{cell}</td>
                                         ))}
                                      </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                      )}

                      {activeTab === 'faq' && (
                        <div className="space-y-6">
                           <div className="space-y-2 mb-8">
                              <h3 className="text-xl font-black tracking-tight">Structured FAQs</h3>
                              <p className="text-sm text-zinc-500 font-medium">Ready-to-use factual responses for snippet acquisition.</p>
                           </div>
                           {(output.faqs || []).map((f, i) => (
                             <Card key={i} className="bg-zinc-50 border-zinc-100 rounded-3xl overflow-hidden shadow-none hover:shadow-md transition-shadow">
                                <CardContent className="p-8 space-y-4">
                                   <div className="flex items-start gap-4">
                                      <Badge className="bg-zinc-950 text-white font-black text-[9px] uppercase px-3 rounded-full mt-1 shrink-0">Q</Badge>
                                      <h4 className="text-lg font-black tracking-tight">{f.question}</h4>
                                   </div>
                                   <div className="flex items-start gap-4 pt-4 border-t border-zinc-200/50">
                                      <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase px-3 rounded-full mt-1 shrink-0">A</Badge>
                                      <p className="text-sm text-zinc-600 font-bold leading-relaxed">{f.answer}</p>
                                   </div>
                                </CardContent>
                             </Card>
                           ))}
                        </div>
                      )}

                      {activeTab === 'draft' && (
                        <div className="space-y-8">
                           <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                 <h3 className="text-xl font-black tracking-tight">Authoritative Draft</h3>
                                 <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Emphasis on factual accuracy & citeable definitions</p>
                              </div>
                              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">Verified Precision</Badge>
                           </div>
                           <div className="markdown-body prose prose-zinc max-w-none p-10 bg-zinc-50 rounded-[3rem] border border-zinc-100 leading-loose">
                              <ReactMarkdown>{output.draft}</ReactMarkdown>
                           </div>
                        </div>
                      )}
                   </motion.div>
                 ) : (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20"
                   >
                      <Fingerprint size={100} strokeWidth={1} className="text-zinc-950 mb-8" />
                      <p className="text-3xl font-black tracking-tight text-zinc-950">Neural Tabula Rasa</p>
                      <p className="text-sm text-zinc-400 mt-4 font-bold uppercase tracking-widest max-w-xs mx-auto">
                        Your optimized high-authority assets will manifest here once synthesis is initialized.
                      </p>
                   </motion.div>
                 )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

