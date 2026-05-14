import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { 
  Share2, 
  Maximize2, 
  Shield, 
  Fingerprint, 
  Database, 
  Zap, 
  Network,
  Cpu,
  Brain,
  Layers,
  Search,
  Settings2,
  RefreshCw,
  FileText,
  Link as LinkIcon,
  Download,
  Code,
  Info,
  User as UserIcon,
  Package,
  Building,
  FileJson,
  FileSpreadsheet,
  XCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button, buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { mapKnowledgeGraph } from '../lib/gemini';
import { toast } from 'sonner';
import { exportToJSON, exportToCSV, exportReportToPDF } from '../lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useAppStore } from '../lib/store';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  val: number;
  wikiId?: string;
  description?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  strength: number;
  relation?: string;
}

export default function KnowledgeGraph() {
  const { reports, setReport, updateReport, clearReport } = useAppStore();
  const persistedData = reports.knowledgeGraph;

  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[]; jsonLd?: any } | null>(persistedData?.result?.graphData || null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(persistedData?.result?.selectedNode || null);

  const [entities, setEntities] = useState(() => persistedData?.input?.entities || '');
  const [specs, setSpecs] = useState(() => persistedData?.input?.specs || '');
  const [authorities, setAuthorities] = useState(() => persistedData?.input?.authorities || '');

  useEffect(() => {
    if (persistedData) {
      if (persistedData.input?.entities) setEntities(persistedData.input.entities);
      if (persistedData.input?.specs) setSpecs(persistedData.input.specs);
      if (persistedData.input?.authorities) setAuthorities(persistedData.input.authorities);
      if (persistedData.result?.graphData) {
        setGraphData(persistedData.result.graphData);
        setTimeout(() => renderD3Graph(persistedData.result.graphData), 100);
      }
      if (persistedData.result?.selectedNode) setSelectedNode(persistedData.result.selectedNode);
    }
  }, []);

  const runMapping = async () => {
    if (!entities) {
      toast.error('Entities are required for mapping');
      return;
    }
    setLoading(true);
    setGraphData(null);
    try {
      const data = await mapKnowledgeGraph({
        entities,
        specs,
        authorities
      });
      if (data && data.nodes) {
        setGraphData(data);
        setReport('knowledgeGraph', { entities, specs, authorities }, { graphData: data, selectedNode });
        // Delay slightly to ensure ref is ready if needed, though d3 usually manages
        setTimeout(() => renderD3Graph(data), 100);
        toast.success('Semantic biosphere synchronized');
      } else {
        toast.error('Neural mapping produced void data');
      }
    } catch (err) {
      console.error(err);
      toast.error('Neural mapping interrupted');
    } finally {
      setLoading(false);
    }
  };

  const exportGraph = (format: 'pdf' | 'csv' | 'json') => {
    if (!graphData) return;

    const fileName = `Knowledge_Graph_${entities.split(',')[0].trim().replace(/[^a-z0-9]/gi, '_')}`;

    if (format === 'json') {
      exportToJSON(graphData, fileName);
    } else if (format === 'csv') {
      exportToCSV(graphData.nodes, `${fileName}_Nodes`);
    } else if (format === 'pdf') {
       const sections = [
        { title: 'Graph Overview', content: `Total Nodes: ${graphData.nodes.length}, Total Links: ${graphData.links.length}`, type: 'text' as const },
        { title: 'Detected Entities', content: graphData.nodes, type: 'table' as const },
        { title: 'Relational Mappings', content: graphData.links.map((l: any) => `${l.source.label || l.source} --(${l.relation})--> ${l.target.label || l.target}`), type: 'list' as const },
        { title: 'JSON-LD Schema', content: JSON.stringify(graphData.jsonLd, null, 2), type: 'text' as const },
      ];
      exportReportToPDF(`Neural Knowledge Map: ${entities}`, sections);
    }
    toast.success(`Exporting as ${format.toUpperCase()}`);
  };

  const renderD3Graph = (data: { nodes: Node[]; links: Link[] }) => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 600;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height] as any)
      .append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        svg.attr('transform', event.transform);
      });

    d3.select(svgRef.current).call(zoom as any);

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force('link', d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.strength || 1) * 2);

    const node = svg.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', 'node-group')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', d => d.val * 3 + 12)
      .attr('fill', d => getNodeColor(d.type))
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
        updateReport('knowledgeGraph', { selectedNode: d });
      });

    node.append('text')
      .attr('dy', d => d.val * 3 + 24)
      .attr('text-anchor', 'middle')
      .text(d => d.label)
      .attr('fill', '#f1f5f9')
      .attr('font-size', '12px')
      .attr('font-weight', '900')
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)');

    // Add identifier text (@id)
    node.append('text')
      .attr('dy', d => d.val * 3 + 36)
      .attr('text-anchor', 'middle')
      .text(d => `@${d.id}`)
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('font-weight', '400')
      .attr('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'brand': return '#ec4899'; // Pink
      case 'product': return '#38bdf8'; // Sky
      case 'person': return '#f59e0b'; // Amber
      case 'concept': return '#818cf8'; // Indigo
      case 'technology': return '#2dd4bf'; // Teal
      default: return '#64748b';
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500 text-left">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-pink-400 border border-pink-500/20">
              <Network size={12} /> Semantic Infrastructure
           </div>
           <h2 className="text-4xl font-black tracking-tighter text-white">Neural Knowledge Mapping</h2>
           <p className="text-zinc-400 text-sm font-medium max-w-xl leading-relaxed">
              Define entities, specifications, and authorities to build a high-fidelity semantic graph that AI engines use to resolve brand ambiguity.
           </p>
        </div>
        <div className="flex gap-3">
           <Button 
            onClick={runMapping}
            disabled={loading}
            className="bg-white text-zinc-950 hover:bg-zinc-200 font-black px-8 rounded-xl h-11"
           >
              {loading ? <RefreshCw className="animate-spin mr-2" /> : <Zap size={18} className="mr-2" />}
              Synchronize Map
           </Button>

           {graphData && (
             <Button 
               variant="outline"
               onClick={() => {
                 clearReport('knowledgeGraph');
                 setEntities('');
                 setSpecs('');
                 setAuthorities('');
                 setGraphData(null);
                 setSelectedNode(null);
                 toast.info('Knowledge map cleared');
               }}
               className="h-11 px-6 rounded-xl border-white/10 font-bold text-sm bg-white/5 hover:bg-white/10 transition-all shadow-sm text-white"
             >
               <XCircle size={18} className="mr-2 text-rose-500" /> Clear Map
             </Button>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           {/* Input Controls */}
           <Card className="glass border-slate-800 shadow-2xl relative overflow-hidden group">
              <CardHeader className="border-b border-white/5">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Settings2 size={16} className="text-pink-400" /> Mapping Protocol
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Building size={12} /> Primary Entities
                    </label>
                    <Input 
                      value={entities}
                      onChange={(e) => setEntities(e.target.value)}
                      placeholder="Acme Corp, John Doe (CEO), NeuralEngine X1"
                      className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-slate-800 focus:border-pink-500 text-xs font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-10 rounded-xl"
                    />
                 </div>

                 <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <FileText size={12} /> Technical Specifications (CSV)
                    </label>
                    <textarea 
                      value={specs}
                      onChange={(e) => setSpecs(e.target.value)}
                      placeholder="Entity,Spec,Value&#10;NeuralEngine X1,Core Clock,3.2GHz&#10;NeuralEngine X1,Latency,1.2ms"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-pink-500 transition-all min-h-[100px]"
                    />
                 </div>

                 <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <LinkIcon size={12} /> Authority Identifiers
                    </label>
                    <Input 
                      value={authorities}
                      onChange={(e) => setAuthorities(e.target.value)}
                      placeholder="Wikipedia URLs, Wikidata IDs..."
                      className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-slate-800 focus:border-pink-500 text-xs font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-10 rounded-xl"
                    />
                 </div>
              </CardContent>
           </Card>

           {/* Selected Identity Info */}
           <Card className="glass border-slate-800 shadow-2xl relative overflow-hidden group min-h-[250px]">
              <CardContent className="p-8 h-full flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Entity Intelligence</h4>
                    <div className="p-2 bg-slate-900 rounded-xl">
                       <Fingerprint size={16} className="text-pink-500" />
                    </div>
                 </div>
                 
                 <div className="flex-1 text-left">
                    {selectedNode ? (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="text-2xl font-black text-white">{selectedNode.label}</h3>
                               <Badge className="bg-pink-500/10 text-pink-400 border-none text-[8px] font-black uppercase">@{selectedNode.id}</Badge>
                            </div>
                            <div className="flex gap-2">
                               <Badge className="bg-zinc-800 text-zinc-400 border-none text-[8px] font-black uppercase">{selectedNode.type}</Badge>
                               {selectedNode.wikiId && (
                                 <Badge className="bg-sky-500/10 text-sky-400 border-none text-[8px] font-black uppercase">Wikidata Verified</Badge>
                               )}
                            </div>
                         </div>
                         
                         <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                            {selectedNode.description || `Detected as a primary ${selectedNode.type} node within the semantic cluster. Maintaining ${graphData?.links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id || (typeof l.source === 'object' && (l.source as any).id === selectedNode.id)).length || 0} active relational connections.`}
                         </p>

                         {selectedNode.wikiId && (
                            <div className="pt-4 border-t border-white/5 space-y-2">
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Global Authority ID</p>
                               <p className="text-[10px] font-bold text-sky-400 truncate">{selectedNode.wikiId}</p>
                            </div>
                         )}
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                         <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                            <Info size={24} className="text-slate-800" />
                         </div>
                         <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Select Node for Analysis</p>
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
           {/* Visual Map */}
           <Card className="glass border-slate-800 shadow-2xl h-[600px] overflow-hidden relative flex flex-col rounded-[2.5rem]">
              <CardHeader className="bg-slate-900/40 border-b border-slate-800/40 p-8 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                       <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                       <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                    </div>
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Live Relational Canvas v4.0</CardTitle>
                 </div>
                 <div className="flex gap-2">
                    <div className="flex items-center gap-6 mr-6">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-pink-500" />
                          <span className="text-[9px] font-black text-zinc-500 uppercase">Brand</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-[9px] font-black text-zinc-500 uppercase">Person</span>
                       </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-white rounded-xl">
                       <Maximize2 size={16} />
                    </Button>
                    {graphData ? (
                       <DropdownMenu>
                         <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9 text-slate-500 hover:text-white rounded-xl flex items-center justify-center")}>
                           <Download size={16} />
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden min-w-[140px] z-[100]">
                           <DropdownMenuItem onClick={() => exportGraph('pdf')} className="flex items-center gap-2 p-3 text-[10px] font-bold cursor-pointer hover:bg-slate-800 text-slate-300 hover:text-white">
                             <FileText size={14} className="text-rose-500" /> PDF Report
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => exportGraph('csv')} className="flex items-center gap-2 p-3 text-[10px] font-bold cursor-pointer hover:bg-slate-800 text-slate-300 hover:text-white">
                             <FileSpreadsheet size={14} className="text-emerald-500" /> CSV Nodes
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => exportGraph('json')} className="flex items-center gap-2 p-3 text-[10px] font-bold cursor-pointer hover:bg-slate-800 text-slate-300 hover:text-white">
                             <FileJson size={14} className="text-amber-500" /> JSON Raw
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    ) : (
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-white rounded-xl">
                          <Download size={16} />
                       </Button>
                    )}
                 </div>
              </CardHeader>
              <CardContent ref={containerRef} className="flex-1 p-0 relative bg-[#020617] cursor-grab active:cursor-grabbing">
                 {loading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]/80 backdrop-blur-md">
                       <div className="relative">
                          <div className="w-20 h-20 rounded-full border-[6px] border-pink-500/10 border-t-pink-500 animate-spin" />
                          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={24} />
                       </div>
                       <p className="mt-8 text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse">Reconstructing Semantic Sphere...</p>
                    </div>
                 )}
                 <svg ref={svgRef} className="w-full h-full" />
                 
                 {!loading && !graphData && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-20">
                      <div className="p-8 bg-slate-900/50 rounded-[3rem] border border-slate-800/50">
                         <Network size={48} className="text-slate-800 mb-6 mx-auto" strokeWidth={1} />
                         <p className="text-lg font-black text-white leading-tight">Neural Map Offline</p>
                         <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">Initialize mapping protocol to visualize entity clusters</p>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* Structured JSON-LD Database */}
           {graphData?.jsonLd && (
             <Card className="glass border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-950 p-8 border-b border-white/5 flex flex-row items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                         <Code size={20} />
                      </div>
                      <div className="text-left">
                         <CardTitle className="text-xl font-black text-white tracking-tight">Technical Structured Data</CardTitle>
                         <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">JSON-LD Database for AI Engine ingestion</p>
                      </div>
                   </div>
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-800 text-zinc-400 hover:text-white rounded-xl font-black text-[10px] uppercase"
                    onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(graphData.jsonLd, null, 2));
                        toast.success('Database copied to clipboard');
                    }}
                    >
                      Copy Schema
                   </Button>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="max-h-[400px] overflow-y-auto bg-slate-950 p-8">
                      <pre className="text-[11px] font-mono text-zinc-400 leading-relaxed text-left">
                         {JSON.stringify(graphData.jsonLd, null, 2)}
                      </pre>
                   </div>
                </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}

