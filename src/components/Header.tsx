import React from 'react';
import { Download, Monitor, Activity } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  activeTab: 'live' | 'limiter' | 'reports' | 'outage' | 'devices';
  setActiveTab: (tab: 'live' | 'limiter' | 'reports' | 'outage' | 'devices') => void;
  onOpenInstallerModal: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenInstallerModal,
  isOnline,
}) => {
  const { isInstallable, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      onOpenInstallerModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            NetPulse
          </span>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline ml-1">
            v2.4
          </span>
        </div>

        {/* Zone 2: 5 Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'live'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Canlı Takip
          </button>
          <button
            onClick={() => setActiveTab('limiter')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'limiter'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Hız Sınırla
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Geçmiş Raporlar
          </button>
          <button
            onClick={() => setActiveTab('outage')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'outage'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Kesinti Bildirimi</span>
            {!isOnline && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'devices'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Ağ Cihazları
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Download / Install App) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm hover:shadow-cyan-500/20 transition-all whitespace-nowrap shrink-0"
            title="Programı bilgisayarınıza indirin veya masaüstü uygulaması olarak kurun"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Programı Kur & İndir</span>
            <span className="sm:hidden">Kurulum</span>
          </button>
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-slate-950 px-2 py-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${
            activeTab === 'live' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          Canlı
        </button>
        <button
          onClick={() => setActiveTab('limiter')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${
            activeTab === 'limiter' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          Hız Sınırı
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${
            activeTab === 'reports' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          Raporlar
        </button>
        <button
          onClick={() => setActiveTab('outage')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${
            activeTab === 'outage' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          Kesinti
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-2.5 py-1 text-xs font-medium rounded ${
            activeTab === 'devices' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          Cihazlar
        </button>
      </div>
    </header>
  );
};
