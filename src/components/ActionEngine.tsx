import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Copy, 
  Check, 
  MapPin, 
  AlertCircle, 
  Zap, 
  Code, 
  FileText, 
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ActionFix {
  issue: string;
  change: string;
  content: string;
  placement: string;
  category: 'Content' | 'Technical' | 'Strategic';
  priority: 'P1' | 'P2' | 'P3';
  impactScore: number;
  effort: 'Low' | 'Medium' | 'High';
  expectedOutcome: string;
}

interface ActionEngineProps {
  actions: ActionFix[];
  title?: string;
  onRevalidate?: () => void;
}

export const ActionEngine: React.FC<ActionEngineProps> = ({ 
  actions, 
  title = "Insight-to-Action Engine",
  onRevalidate
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('appliedFixes');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleFix = (issue: string) => {
    const newSets = new Set(appliedFixes);
    if (newSets.has(issue)) {
      newSets.delete(issue);
    } else {
      newSets.add(issue);
    }
    setAppliedFixes(newSets);
    localStorage.setItem('appliedFixes', JSON.stringify(Array.from(newSets)));
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!actions || actions.length === 0) return null;

  const categories = ['Content', 'Technical', 'Strategic'] as const;
  const groupedActions = categories.reduce((acc, cat) => {
    acc[cat] = actions.filter(a => a.category === cat);
    return acc;
  }, {} as Record<string, ActionFix[]>);

  const totalActions = actions.length;
  const completedActions = actions.filter(a => appliedFixes.has(a.issue)).length;
  const completionPercentage = Math.round((completedActions / totalActions) * 100);

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'P1': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'P2': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'P3': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getEffortColor = (e: string) => {
    switch(e) {
      case 'Low': return 'text-emerald-400';
      case 'Medium': return 'text-amber-400';
      case 'High': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div id="action-engine-container" className="space-y-8">
      {/* Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            <p className="text-slate-400">Context-aware fixes with execution intelligence</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-slate-500">Execution Progress</span>
            <span className="text-indigo-400">{completionPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
          <p className="text-[10px] text-slate-500 text-right">
            {completedActions} of {totalActions} tasks verified
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-10">
        {categories.map(category => (
          groupedActions[category].length > 0 && (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  {category} Improvements
                </span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <div className="grid gap-4">
                {groupedActions[category].map((action, idx) => {
                  const globalIdx = actions.findIndex(a => a.issue === action.issue);
                  const isApplied = appliedFixes.has(action.issue);
                  
                  return (
                    <motion.div
                      key={action.issue}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`
                        relative overflow-hidden rounded-xl border transition-all duration-300
                        ${isApplied ? 'bg-slate-900/40 border-slate-800 opacity-75' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20'}
                        ${expandedIndex === globalIdx ? 'ring-1 ring-indigo-500/50 scale-[1.01]' : ''}
                      `}
                    >
                      <div 
                        className="p-5 cursor-pointer flex items-start gap-4"
                        onClick={() => setExpandedIndex(expandedIndex === globalIdx ? null : globalIdx)}
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFix(action.issue);
                          }}
                          className={`
                            mt-1 w-6 h-6 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                            ${isApplied ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 hover:border-indigo-500'}
                          `}
                        >
                          {isApplied && <Check className="w-4 h-4" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(action.priority)}`}>
                              {action.priority}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              IMPACT: {action.impactScore}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {action.placement}
                            </span>
                          </div>
                          
                          <h3 className={`text-lg font-bold leading-tight ${isApplied ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                            {action.issue}
                          </h3>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                           <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
                             EFFORT: <span className={getEffortColor(action.effort)}>{action.effort}</span>
                           </span>
                           {expandedIndex === globalIdx ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedIndex === globalIdx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-950/50 border-t border-slate-800/50"
                          >
                            <div className="p-5 space-y-6">
                              {/* Expected Outcome */}
                              <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start gap-3">
                                <Zap className="w-5 h-5 text-indigo-400 mt-0.5" />
                                <div>
                                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Expected Outcome</span>
                                  <p className="text-sm text-slate-300 font-medium">{action.expectedOutcome}</p>
                                </div>
                              </div>

                              {/* Content area */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                                    <FileText className="w-4 h-4" />
                                    Optimized Implementation
                                  </span>
                                  <button
                                    onClick={() => handleCopy(action.content, globalIdx)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all"
                                  >
                                    {copiedIndex === globalIdx ? (
                                      <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
                                    ) : (
                                      <><Copy className="w-3.5 h-3.5" /> Copy Fix</>
                                    )}
                                  </button>
                                </div>
                                <pre className="p-4 rounded-xl border border-slate-800 bg-black font-mono text-xs leading-relaxed text-slate-400 overflow-x-auto whitespace-pre-wrap">
                                  {action.content}
                                </pre>
                              </div>

                              <div className="flex items-center justify-between gap-4 pt-2">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                  Type: <span className="text-slate-300">{action.change}</span>
                                </div>
                                {isApplied && onRevalidate && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onRevalidate(); }}
                                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 uppercase tracking-widest"
                                  >
                                    Re-validate Fix
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};
