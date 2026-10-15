import React, { useState } from 'react';
import {
  Download,
  Laptop,
  Check,
  Terminal,
  FileCode,
  ShieldCheck,
  ExternalLink,
  X,
  Play,
  Monitor,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  downloadFile,
  generatePowerShellAgent,
  generateWindowsBatchInstaller,
  generatePythonAgent,
  generateLinuxBashDaemon,
} from '../utils/desktopScripts';

interface DesktopInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNetworkName: string;
}

export const DesktopInstallerModal: React.FC<DesktopInstallerModalProps> = ({
  isOpen,
  onClose,
  activeNetworkName,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (filename: string, content: string, label: string) => {
    downloadFile(filename, content);
    setDownloadSuccess(label);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                NetPulse Bilgisayara İndirme ve Kurulum Merkezi
              </h2>
              <p className="text-xs text-slate-400">
                Programı masaüstünüze kurun veya arka plan donanım ajanını indirin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {downloadSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-700 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadSuccess} bilgisayarınıza başarıyla indirildi!</span>
            </div>
          )}

          {/* Option 1: PWA Native Desktop App Installation */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-cyan-800/60 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    ÖNERİLEN
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    1-Tıkla Masaüstü Uygulaması Olarak Kur (PWA)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  Windows, Mac veya Linux sisteminize yerel bir program olarak kurulur. Başlat menüsünde, görev çubuğunda ve masaüstünde kısayolu oluşur.
                </p>
              </div>

              {isInstalled ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800">
                  <Check className="w-4 h-4" />
                  <span>Uygulama Zaten Kurulu</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={install}
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md hover:shadow-cyan-500/20 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Bilgisayara Yükle</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span>Tarayıcınızın adres çubuğundaki (➕) Yükle butonunu da kullanabilirsiniz</span>
                </div>
              )}
            </div>
          </div>

          {/* Option 2: Standalone OS Agents & Scripts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Doğrudan İndirilebilir Masaüstü Ajanları (Scripts & Daemons)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Bilgisayarınızın fiziksel ağ bağdaştırıcısını arka planda izleyen, ping testleri yapan ve logları kaydeden hazır betikler:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Windows PowerShell Monitor */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">
                      Windows PowerShell İzleyici
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">
                      .ps1
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Windows 10/11 için yerel ağ istatistikleri, sesli kesinti uyarısı ve Windows bildirim balonu.
                  </p>
                </div>
                <button
                  onClick={() =>
                    triggerDownload(
                      'NetPulse_Monitor.ps1',
                      generatePowerShellAgent(activeNetworkName),
                      'Windows PowerShell Ajanı (NetPulse_Monitor.ps1)'
                    )
                  }
                  className="w-full py-2 px-3 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>NetPulse_Monitor.ps1 İndir</span>
                </button>
              </div>

              {/* Windows 1-Click Installer Batch */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">
                      Windows Başlangıç Kurulumu
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                      .bat
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Bilgisayar her açıldığında arka planda otomatik başlaması için zamanlanmış görev kurar.
                  </p>
                </div>
                <button
                  onClick={() =>
                    triggerDownload(
                      'Install_NetPulse_Service.bat',
                      generateWindowsBatchInstaller(),
                      'Windows Kurulum Dosyası (Install_NetPulse_Service.bat)'
                    )
                  }
                  className="w-full py-2 px-3 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Install_Service.bat İndir</span>
                </button>
              </div>

              {/* Python Cross-Platform Daemon */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">
                      Python Evrensel Ajan
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded">
                      .py
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Windows, macOS ve Linux sistemlerde psutil ile gerçek bayt sayaçlarını terminalde gösterir.
                  </p>
                </div>
                <button
                  onClick={() =>
                    triggerDownload(
                      'netpulse_agent.py',
                      generatePythonAgent(),
                      'Python Ajanı (netpulse_agent.py)'
                    )
                  }
                  className="w-full py-2 px-3 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>netpulse_agent.py İndir</span>
                </button>
              </div>

              {/* Linux/macOS Bash Daemon */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">
                      Linux / Mac Terminal Daemon
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">
                      .sh
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Bash betiği: ping denetimi, masaüstü notify-send bildirimleri ve bağlantı günlükleri.
                  </p>
                </div>
                <button
                  onClick={() =>
                    triggerDownload(
                      'netpulse_monitor.sh',
                      generateLinuxBashDaemon(),
                      'Linux/Mac Betiği (netpulse_monitor.sh)'
                    )
                  }
                  className="w-full py-2 px-3 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>netpulse_monitor.sh İndir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 block mb-1">
              Nasıl Çalıştırılır?
            </span>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>PWA Yöntemi:</strong> "Bilgisayara Yükle" butonuna basın; Edge/Chrome uygulamasını bağımsız pencere olarak yükler.
              </li>
              <li>
                <strong>PowerShell Yöntemi:</strong> İndirdiğiniz <code className="text-cyan-300">NetPulse_Monitor.ps1</code> dosyasına sağ tıklayıp "PowerShell ile Çalıştır" seçeneğini seçin.
              </li>
              <li>
                <strong>Python Yöntemi:</strong> Terminalde <code className="text-cyan-300">python netpulse_agent.py</code> komutunu verin.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
