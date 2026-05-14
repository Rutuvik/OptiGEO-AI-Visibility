import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion } from 'motion/react';
import { Globe2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { toast } from 'sonner';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        toast.success(`Welcome to the platform, ${name}!`);
        navigate('/');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background font-sans overflow-y-auto">
      {/* Right Panel: Minimalist Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-24 relative order-2 lg:order-1">
        <div className="absolute top-8 left-8">
           <Link to="/login">
             <Button variant="ghost" className="text-zinc-500 hover:text-zinc-950 font-medium tracking-tight">
                <ArrowRight size={14} className="mr-2 rotate-180" /> Sign In Instead
             </Button>
           </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] space-y-12"
        >
          <div className="space-y-4 text-left">
            <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
               <Cpu className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">Join the Collective</h1>
            <p className="text-zinc-500 font-medium leading-relaxed">Initialize your node within the high-frequency AI visibility network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 text-left group">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 group-focus-within:text-zinc-950 transition-colors">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Lexington Dev" 
                  className="h-14 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-zinc-950 focus:ring-0 rounded-2xl transition-all px-4" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 text-left group">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 group-focus-within:text-zinc-950 transition-colors">Email Id</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="operator@cryptic.xyz" 
                  className="h-14 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-zinc-950 focus:ring-0 rounded-2xl transition-all px-4" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 text-left group">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 group-focus-within:text-zinc-950 transition-colors">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••••••"
                  className="h-14 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-zinc-950 focus:ring-0 rounded-2xl transition-all px-4" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl h-14 text-sm font-bold transition-all shadow-2xl shadow-zinc-500/20" 
                  disabled={loading}
                >
                  {loading ? "Initializing..." : "Authorize System Access"}
                </Button>
              </motion.div>
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                    <ShieldCheck size={12} className="text-emerald-500" /> AES-256 Protected
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">v2.5.0 STABLE</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Left Panel: Minimalist Aesthetic Photo */}
      <div className="hidden lg:block relative overflow-hidden bg-zinc-100 order-1 lg:order-2">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=2606" 
          alt="GEO Data Visualization" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 backdrop-contrast-75" />
        <div className="absolute top-12 right-12 z-10 text-right">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="h-px w-12 bg-white/50 ml-auto" />
            <h2 className="text-4xl font-light text-white tracking-tight leading-tight max-w-sm">
              Architect the <br />
              Future of <span className="font-medium text-white/90">Presence.</span>
            </h2>
            <p className="text-white/60 text-sm font-light uppercase tracking-[0.2em]">Next Gen GEO Integration</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
