import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion } from 'motion/react';
import { ShieldCheck, Globe2, ArrowRight, Fingerprint, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate('/');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background font-sans overflow-y-auto">
      {/* Left Panel: Minimalist Aesthetic Photo */}
      <div className="hidden lg:block relative overflow-hidden bg-zinc-100">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=2667" 
          alt="Minimalist Workspace" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/10 backdrop-contrast-75" />
        <div className="absolute bottom-12 left-12 z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="h-px w-12 bg-white/50" />
            <h2 className="text-4xl font-light text-white tracking-tight leading-tight max-w-sm">
              Intelligence visualized. <br />
              Performance <span className="font-medium">optimized.</span>
            </h2>
            <p className="text-white/60 text-sm font-light uppercase tracking-[0.2em]">Platform v2.5</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Minimalist Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-24 relative">
        <div className="absolute top-8 right-8">
           <Link to="/signup">
             <Button variant="ghost" className="text-zinc-500 hover:text-zinc-950 font-medium tracking-tight">
               Create Account <ArrowRight size={14} className="ml-2" />
             </Button>
           </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] space-y-12"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
               <Fingerprint className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">Secure Access</h1>
            <p className="text-zinc-500 font-medium leading-relaxed">System-ready protocols for verified brand influence monitoring.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 group-focus-within:text-zinc-950 transition-colors">Identity Node</Label>
                <div className="relative">
                   <Input 
                     id="email" 
                     type="email" 
                     placeholder="node-alpha-7@optigeo.io" 
                     className="h-14 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-zinc-950 focus:ring-0 rounded-2xl transition-all pl-4 pr-10" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                   />
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                      <Globe2 size={16} />
                   </div>
                </div>
              </div>
              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 group-focus-within:text-zinc-950 transition-colors">Auth Cipher</Label>
                </div>
                <div className="relative">
                   <Input 
                     id="password" 
                     type="password" 
                     placeholder="••••••••••••"
                     className="h-14 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-zinc-950 focus:ring-0 rounded-2xl transition-all pl-4 pr-10" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                   />
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                      <ShieldCheck size={16} />
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl h-14 text-sm font-bold transition-all shadow-2xl shadow-zinc-500/20" 
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                    />
                  ) : "Initiate Connection"}
                </Button>
              </motion.div>
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                    <Activity size={12} className="text-emerald-500" /> Endpoint Secured
                 </div>
                 <Link to="#" className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-950 transition-colors">Emergency Access</Link>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Footer info (only on small screens or as subtle text) */}
        <div className="mt-20 lg:absolute lg:bottom-12 lg:left-24 text-left">
           <div className="flex items-center gap-4 text-zinc-300">
              <Globe2 size={16} />
              <div className="h-px w-8 bg-zinc-100" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">OptiGEO Systems</span>
           </div>
        </div>
      </div>
    </div>
  );
}
