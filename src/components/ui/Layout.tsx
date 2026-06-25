import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChildStore } from '../../store/useChildStore';
import { playSound } from '../../utils/audio';
import { 
  Home, Compass, Languages, Leaf, Gamepad2, Award, Settings, LogOut 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeChild } = useChildStore();
  const location = useLocation();

  const navItems = [
    { name: 'Mulai', path: '/', icon: Home, color: 'text-emerald-500' },
    { name: 'Eksplorasi', path: '/eksplorasi', icon: Compass, color: 'text-blue-500' },
    { name: 'Konstruksi', path: '/konstruksi', icon: Languages, color: 'text-amber-500' },
    { name: 'Internalisasi', path: '/internalisasi', icon: Leaf, color: 'text-green-500' },
    { name: 'Aksi Kreasi', path: '/aksi', icon: Gamepad2, color: 'text-rose-500' },
    { name: 'Piala', path: '/progress', icon: Award, color: 'text-purple-500' },
  ];

  const handleNavClick = () => {
    playSound('pop');
  };

  const handleLogout = () => {
    playSound('error');
    if (window.confirm('Keluar dari profil ini?')) {
      useChildStore.setState({ activeChild: null });
    }
  };

  if (!activeChild) {
    return <div className="min-h-screen bg-transparent">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r-4 border-emerald-100 p-6 space-y-8 shrink-0">
        {/* Child Profile Header */}
        <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-100 flex items-center space-x-3">
          <span className="text-4xl animate-bounce">{activeChild.avatar}</span>
          <div className="overflow-hidden">
            <h4 className="font-bold text-emerald-900 truncate">{activeChild.name}</h4>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">Lvl {activeChild.level}</span>
              <span className="text-amber-500 font-bold text-sm">⭐ {activeChild.totalStars}</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-lg transition-all ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-playful-primary' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={24} className={isActive ? 'text-white' : item.color} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Buttons */}
        <div className="space-y-2">
          <Link
            to="/settings"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-lg transition-all ${
              location.pathname === '/settings' 
                ? 'bg-emerald-500 text-white shadow-playful-primary' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings size={24} className={location.pathname === '/settings' ? 'text-white' : 'text-slate-500'} />
            <span>Pengaturan</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut size={24} />
            <span>Ganti Profil</span>
          </button>
        </div>
      </aside>

      {/* TOP HEADER FOR MOBILE */}
      <header className="md:hidden bg-white border-b-4 border-emerald-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">{activeChild.avatar}</span>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm truncate max-w-[120px]">{activeChild.name}</h4>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-px rounded font-bold">Lvl {activeChild.level}</span>
              <span className="text-amber-500 font-bold text-xs">⭐ {activeChild.totalStars}</span>
            </div>
          </div>
        </div>
        <h1 className="font-black text-xl text-emerald-800 tracking-wide">ECO-DAYAK</h1>
        <div className="flex items-center space-x-1">
          <Link
            to="/settings"
            onClick={handleNavClick}
            className={`p-2 rounded-xl text-slate-500 hover:bg-slate-100 ${location.pathname === '/settings' ? 'bg-emerald-500 text-white' : ''}`}
          >
            <Settings size={20} className={location.pathname === '/settings' ? 'text-white' : ''} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-h-screen pb-24 md:pb-8">
        <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center">
          {children}
        </div>
      </main>

      {/* BOTTOM NAVIGATION FOR MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-emerald-100 flex justify-around py-2 px-1 z-40 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition ${
                isActive ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon size={22} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
