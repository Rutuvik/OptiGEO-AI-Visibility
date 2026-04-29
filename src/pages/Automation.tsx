import React, { useState } from 'react';
import { 
  Settings, 
  Play, 
  Plus, 
  Zap, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Calendar,
  Clock,
  Filter,
  MoreVertical,
  Pause,
  RefreshCcw,
  Workflow,
  Cpu,
  Fingerprint,
  Loader2,
  Bell,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Layout,
  MessageSquare,
  FileCode,
  ShieldCheck,
  Send,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { processAutomationTrigger } from '../lib/gemini';
import { toast } from 'sonner';
import { exportToCSV } from '../lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function Automation() {
  const [domain, setDomain] = useState('');
  const [trigger, setTrigger] = useState('');
  const [context, setContext] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [automationResult, setAutomationResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([
    { id: '1', time: 'Initial', event: 'SYSTEM_READY', status: 'INFO' },
  ]);

  const exportActivityLogs = () => {
    const fileName = `Activity_Logs_${Date.now()}`;
    exportToCSV(logs, fileName);
    toast.success("Activity logs exported as CSV");
  };

  const runAutomationProtocol = async () => {
    if (!domain) {
      toast.error("Enter a target domain");
      return;
    }
    setLoading(true);
    setLogs(prev => [...prev, { id: Date.now().toString(), time: new Date().toLocaleTimeString(), event: 'PROTOCOL_INITIATED', status: 'INFO' }]);
    
    try {
      const result = await processAutomationTrigger({
        domain,
        trigger,
        context
      });
      setAutomationResult(result);
      setLogs(prev => [
        ...prev, 
        { id: Date.now().toString() + '1', time: new Date().toLocaleTimeString(), event: 'TRIGGER_MATCH_SCAN', status: 'SUCCESS' },
        { id: Date.now().toString() + '2', time: new Date().toLocaleTimeString(), event: 'INTELLIGENCE_ROUTING', status: 'SUCCESS' }
      ]);
      toast.success("Automation sequence executed");
    } catch (err) {
      toast.error("Automation protocol failed");
      setLogs(prev => [...prev, { id: Date.now().toString(), time: new Date().toLocaleTimeString(), event: 'PROTOCOL_ERROR', status: 'ALERT' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 text-left animate-fade-in">
       <header className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-800">
                <Workflow size={12} className="text-indigo-400" /> Autonomous Weaver v2.0
             </div>
             <h2 className="text-4xl font-black tracking-tighter text-zinc-950">Logic Orchestration</h2>
             <p className="text-zinc-500 font-medium max-w-lg">Link data signals to executable marketing actions. Automate alerts, FAQ updates, and stakeholder reporting.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <Button 
                onClick={runAutomationProtocol}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 h-14 font-black shadow-2xl shadow-indigo-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
             >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Play size={18} className="mr-2" />}
                Fire Logic Node
             </Button>
          </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Triggers & Configuration */}
          <div className="lg:col-span-4 space-y-6">
             <Card className="aesthetic-card p-8 space-y-6 border-zinc-200 shadow-xl rounded-[2.5rem]">
                <div className="flex items-center gap-2 mb-2">
                   <Zap size={18} className="text-amber-500" />
                   <h3 className="text-sm font-black text-zinc-950 uppercase tracking-widest">Protocol Setup</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Target Domain</label>
                      <Input 
                         value={domain}
                         onChange={(e) => setDomain(e.target.value)}
                         placeholder="e.g. acmecorp.com"
                         className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-12 font-bold text-zinc-900 dark:text-zinc-100"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Trigger Condition</label>
                      <textarea 
                         value={trigger}
                         onChange={(e) => setTrigger(e.target.value)}
                         placeholder="e.g. if visibility drops below 15%..."
                         className="w-full h-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs font-bold text-zinc-950 dark:text-zinc-100 outline-none focus:border-indigo-500 transition-all custom-scrollbar"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Data Feed Context</label>
                      <textarea 
                         value={context}
                         onChange={(e) => setContext(e.target.value)}
                         placeholder="Paste external search data or integration details..."
                         className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs font-bold text-zinc-950 dark:text-zinc-100 outline-none focus:border-indigo-500 transition-all custom-scrollbar"
                      />
                   </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                   <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
                      <p className="text-[10px] font-medium text-indigo-700 leading-tight">Agents will automatically recalibrate content if trigger criteria are met.</p>
                   </div>
                </div>
             </Card>
             
             {automationResult && (
                <Card className="aesthetic-card p-0 overflow-hidden border-zinc-200 shadow-xl rounded-[2.5rem]">
                   <div className="bg-zinc-950 p-8 text-white">
                      <div className="flex items-center justify-between mb-6">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Live Dashboard Data</h4>
                         <Layout size={16} className="text-indigo-400" />
                      </div>
                      <div className="space-y-6">
                         {automationResult.reportingMetrics.map((metric: any) => (
                            <div key={metric.label} className="flex items-center justify-between">
                               <div className="space-y-1">
                                  <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{metric.label}</div>
                                  <div className="text-2xl font-black tracking-tight">{metric.value}</div>
                               </div>
                               {metric.trend === 'up' ? <TrendingUp className="text-emerald-500" size={18} /> : metric.trend === 'down' ? <TrendingDown className="text-rose-500" size={18} /> : <Activity className="text-zinc-600" size={18} />}
                            </div>
                         ))}
                      </div>
                   </div>
                </Card>
             )}
          </div>

          {/* Executable Outputs */}
          <div className="lg:col-span-8 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Alerts Section */}
                <Card className="aesthetic-card p-0 overflow-hidden border-zinc-200 shadow-xl rounded-[2.5rem]">
                   <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-950 flex items-center gap-2">
                         <Bell size={14} className="text-rose-500" /> Automated Signals
                      </h4>
                      {loading && <Loader2 size={14} className="animate-spin text-zinc-400" />}
                   </div>
                   <div className="p-4 space-y-3 min-h-[300px]">
                      {automationResult?.alerts?.map((alert: any, i: number) => (
                         <div key={i} className={`p-5 rounded-[1.5rem] border ${alert.level === 'Critical' ? 'bg-rose-50 border-rose-100 text-rose-900' : alert.level === 'Warning' ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-sky-50 border-sky-100 text-sky-900'} flex items-start gap-4 transition-all hover:scale-[1.02]`}>
                            <div className="mt-1">
                               {alert.level === 'Critical' ? <AlertCircle size={20} /> : <Bell size={20} />}
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{alert.level}</span>
                                  {alert.triggerMatch && <Badge className="bg-rose-500/10 text-rose-600 text-[8px] h-4">Trigger Match</Badge>}
                               </div>
                               <p className="text-xs font-bold leading-relaxed">{alert.message}</p>
                            </div>
                         </div>
                      ))}
                      {!automationResult && !loading && (
                         <div className="flex flex-col items-center justify-center p-10 text-zinc-300 opacity-50 space-y-4">
                            <Bell size={40} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting triggers...</p>
                         </div>
                      )}
                   </div>
                </Card>

                {/* Actions/Updates Section */}
                <Card className="aesthetic-card p-0 overflow-hidden border-zinc-200 shadow-xl rounded-[2.5rem]">
                   <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-950 flex items-center gap-2">
                         <Zap size={14} className="text-indigo-500" /> Executable Actions
                      </h4>
                      {loading && <Loader2 size={14} className="animate-spin text-zinc-400" />}
                   </div>
                   <div className="p-4 space-y-3 min-h-[300px]">
                      {automationResult?.actions?.map((action: any, i: number) => (
                         <div key={i} className="p-5 bg-white border border-zinc-100 rounded-[1.5rem] flex items-start gap-4 hover:border-indigo-200 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                               {action.type === 'FAQ' ? <MessageSquare size={18} /> : action.type === 'Technical' ? <FileCode size={18} /> : <Layout size={18} />}
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{action.type} Protocol</span>
                                  <Badge className="bg-zinc-900 text-white text-[8px] px-2 h-4">{action.priority}</Badge>
                               </div>
                               <p className="text-xs font-bold text-zinc-950 mb-3">{action.description}</p>
                               {action.type === 'FAQ' && (
                                  <Button variant="outline" className="w-full rounded-xl h-8 text-[9px] font-black uppercase tracking-widest border-zinc-200 hover:bg-zinc-50">
                                     View Generated FAQ <ArrowUpRight size={10} className="ml-1" />
                                  </Button>
                                )}
                            </div>
                         </div>
                      ))}
                      {!automationResult && !loading && (
                         <div className="flex flex-col items-center justify-center p-10 text-zinc-300 opacity-50 space-y-4">
                            <Zap size={40} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Logic idle...</p>
                         </div>
                      )}
                   </div>
                </Card>
             </div>

             {/* Activity Logs Section */}
             <Card className="aesthetic-card p-0 overflow-hidden border-zinc-200 shadow-xl rounded-[2.5rem]">
                <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                   <h4 className="text-xs font-black uppercase tracking-widest text-zinc-950 flex items-center gap-2">
                      <Activity size={14} className="text-indigo-500" /> Neural Activity Stream
                   </h4>
                   <Button onClick={exportActivityLogs} variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest text-zinc-400">Export Logs</Button>
                </div>
                <div className="p-0 font-mono h-64 overflow-auto custom-scrollbar bg-white divide-y divide-zinc-50">
                   {logs.map((log) => (
                      <div key={log.id} className="p-4 flex items-center gap-6 hover:bg-zinc-50 transition-colors">
                         <span className="text-[10px] text-zinc-400 font-bold w-16">{log.time || '00:00:00'}</span>
                         <div className="flex items-center gap-3 flex-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : log.status === 'ALERT' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                            <span className="text-[10px] font-black text-zinc-800 tracking-tight">{log.event}</span>
                         </div>
                         <Badge className={`text-[8px] font-black h-4 border-none opacity-60 ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : log.status === 'ALERT' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {log.status}
                         </Badge>
                      </div>
                   ))}
                </div>
             </Card>
          </div>
       </div>
    </div>
  );
}
