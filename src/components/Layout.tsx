import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Zap, 
  BarChart3, 
  FileEdit, 
  TestTube2, 
  Share2, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Bell,
  SearchIcon,
  HelpCircle,
  Sparkles,
  Database,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Detailed Analysis', path: '/analysis', icon: Activity, status: 'CORE' },
    { name: 'Visibility Tracker', path: '/visibility', icon: Search, status: 'Live Data' },
    { name: 'Growth Strategy', path: '/growth', icon: BarChart3, status: 'AI Intel' },
    { name: 'GEO Optimizer', path: '/optimizer', icon: Zap, status: 'v2.0' },
    { name: 'Content Generator', path: '/generator', icon: FileEdit, status: 'Synthesis' },
    { name: 'Competitor Analysis', path: '/competitor', icon: BarChart3, status: 'Global' },
    { name: 'Knowledge Graph', path: '/kg', icon: Share2, status: 'Neural' },
    { name: 'Prompt Lab', path: '/lab', icon: TestTube2, status: 'SOV' },
    { name: 'Intelligence Audit', path: '/audit', icon: ShieldCheck, status: 'New Module' },
    { name: 'Blog Lab', path: '/blog-lab', icon: Sparkles, status: 'Premium' },
    { name: 'Automation', path: '/automation', icon: Settings, status: 'Active' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-background transition-all duration-300 border-r border-border
          ${isSidebarOpen ? 'w-64' : 'w-20'} 
          hidden lg:flex flex-col z-50`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-semibold text-lg tracking-tight text-foreground"
                >
                  OptiGEO
                </motion.span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={() => `
                    flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative
                    ${isActive 
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50'}
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-zinc-900'}`} />
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] font-semibold tracking-tight"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {item.status && isSidebarOpen && (
                    <Badge className="ml-auto text-[8px] px-1.5 h-4 bg-zinc-900 text-white font-black border-none pointer-events-none uppercase">
                      {item.status}
                    </Badge>
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-5 bg-zinc-950 rounded-r-full" 
                    />
                  )}
                  {!isActive && (
                    <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowRight size={10} className="text-zinc-300" />
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Sidebar Section */}
          <div className="p-4">
            {isSidebarOpen ? (
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  <Database size={10} /> Systems Ready
                </div>
                <div className="space-y-3">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[8px] font-black uppercase text-zinc-500">
                         <span>Neural Load</span>
                         <span>24%</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                         <div className="w-[24%] h-full bg-emerald-500" />
                      </div>
                   </div>
                   <p className="text-[9px] text-zinc-500 font-mono tracking-tighter">NODE: GEO-CLUSTER-09</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <HelpCircle size={18} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:flex hidden text-muted-foreground hover:text-foreground"
            >
              <Menu size={18} />
            </Button>
            <div className="relative lg:block hidden">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-zinc-50 border border-zinc-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-400 transition-all w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} className="text-muted-foreground hover:text-foreground" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="relative h-10 w-fit pl-1 pr-3 flex items-center gap-2 hover:bg-zinc-100 rounded-full border border-border"
              >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {user?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start lg:block hidden">
                    <span className="text-xs font-semibold text-foreground leading-none mb-0.5 block capitalize">{user?.name || 'User'}</span>
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight">Verified</span>
                  </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto p-8 bg-background relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <header className="mb-10">
                 <div className="flex items-center gap-2 mb-2 opacity-50">
                    <div className="w-1 h-1 rounded-full bg-foreground" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Network Node</span>
                 </div>
                 <h1 className="text-3xl font-medium tracking-tight text-foreground">
                    {navItems.find(n => n.path === location.pathname)?.name || 'Platform'}
                 </h1>
              </header>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
