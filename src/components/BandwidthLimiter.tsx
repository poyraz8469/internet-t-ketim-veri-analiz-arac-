import React, { useState } from 'react';
import {
  Zap,
  Sliders,
  Gamepad2,
  Video,
  BatteryCharging,
  Infinity,
  Terminal,
  Copy,
  Check,
  ShieldAlert,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { ThrottlingConfig, ThrottlingPreset } from '../types/network';

interface BandwidthLimiterProps {
  throttling: ThrottlingConfig;
  onUpdateThrottling: (config: ThrottlingConfig) => void;
  activeAdapterName: string;
}

export const BandwidthLimiter: React.FC<BandwidthLimiterProps> = ({
  throttling,
  onUpdateThrottling,
  activeAdapterName,
}) => {
  const [copiedOs, setCopiedOs] = useState<string | null>(null);

  const presets = [
    {
      id: 'unlimited' as ThrottlingPreset,
      title: 'Sınırsız (Tam Hız)',
      desc: 'Herhangi bir hız limiti uygulanmaz, donanımınızın maksimum kapasitesi kullanılır.',
      downMbps: 0,
      upMbps: 0,
      icon: <Infinity className="w-5 h-5 text-slate-300" />,
      accent: 'border-slate-700 bg-slate-900',
    },
    {
      id: 'gaming' as ThrottlingPreset,
      title: 'Oyun & Düşük Ping Modu',
      desc: 'İndirmeleri sınırlandırarak Bufferbloat gecikmesini önler, oyunlarda anlık ping sıçramalarını keser.',
      downMbps: 35,
      upMbps: 12,
      icon: <Gamepad2 className="w-5 h-5 text-emerald-400" />,
      accent: 'border-emerald-500/50 bg-emerald-950/20',
    },
    {
      id: 'meeting' as ThrottlingPreset,
      title: 'Toplantı & Video Konferans',
      desc: 'Zoom, Teams ve Google Meet ses/görüntü paketlerine öncelik tanır; arka plan indirmelerini frenler.',
      downMbps: 20,
      upMbps: 6,
      icon: <Video className="w-5 h-5 text-blue-400" />,
      accent: 'border-blue-500/50 bg-blue-950/20',
    },
    {
      id: 'saving' as ThrottlingPreset,
      title: 'Kota Tasarruf Modu',
      desc: 'Mobil hotspot veya kotalı paketlerde hızlı veri tüketimini ve video kalitesini kısıtlar.',
      downMbps: 6,
      upMbps: 2,
      icon: <BatteryCharging className="w-5 h-5 text-amber-400" />,
      accent: 'border-amber-500/50 bg-amber-950/20',
    },
    {
      id: 'custom' as ThrottlingPreset,
      title: 'Özel Kullanıcı Limiti',
      desc: 'İndirme ve yükleme hız sınırını dilediğiniz gibi Megabit (Mbps) cinsinden belirleyin.',
      downMbps: throttling.maxDownloadMbps || 25,
      upMbps: throttling.maxUploadMbps || 8,
      icon: <Sliders className="w-5 h-5 text-cyan-400" />,
      accent: 'border-cyan-500/50 bg-cyan-950/20',
    },
  ];

  const handleSelectPreset = (preset: (typeof presets)[0]) => {
    if (preset.id === 'unlimited') {
      onUpdateThrottling({
        enabled: false,
        preset: 'unlimited',
        maxDownloadMbps: 0,
        maxUploadMbps: 0,
        appliedToAdapter: activeAdapterName,
      });
    } else {
      onUpdateThrottling({
        enabled: true,
        preset: preset.id,
        maxDownloadMbps: preset.downMbps,
        maxUploadMbps: preset.upMbps,
        appliedToAdapter: activeAdapterName,
      });
    }
  };

  const handleCustomChange = (down: number, up: number) => {
    onUpdateThrottling({
      enabled: true,
      preset: 'custom',
      maxDownloadMbps: down,
      maxUploadMbps: up,
      appliedToAdapter: activeAdapterName,
    });
  };

  const toggleMasterEnable = () => {
    onUpdateThrottling({
      ...throttling,
      enabled: !throttling.enabled,
    });
  };

  // Generate OS-level command for PowerShell, Linux or Mac
  const downBits = (throttling.maxDownloadMbps || 20) * 1000 * 1000;
  const windowsCmd = `New-NetQosPolicy -Name "NetPulseThrottle" -ThrottleRateActionBitsPerSecond ${downBits} -NetworkProfile All`;
  const linuxCmd = `sudo wondershaper -a eth0 -d ${(throttling.maxDownloadMbps || 20) * 1000} -u ${(throttling.maxUploadMbps || 5) * 1000}`;
  const macCmd = `sudo dnctl pipe 1 config bw ${throttling.maxDownloadMbps || 20}Mbit/s`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOs(label);
    setTimeout(() => setCopiedOs(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header and Master Switch */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Anlık Bant Genişliği & Hız Sınırlandırıcı (Traffic Shaper)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              İnternet bağlantınızı anında kısıtlayarak arka plan indirmelerinin oyununuzu veya toplantınızı yavaşlatmasını engelleyin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-300">
              {throttling.enabled ? 'Sınırlandırma Açık' : 'Sınırlandırma Kapalı'}
            </span>
            <button
              onClick={toggleMasterEnable}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-hidden ${
                throttling.enabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  throttling.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preset Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {presets.map((preset) => {
          const isSelected =
            (preset.id === 'unlimited' && !throttling.enabled) ||
            (throttling.enabled && throttling.preset === preset.id);

          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`cursor-pointer rounded-xl p-4 border transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-500 bg-slate-800 shadow-md shadow-cyan-950/30'
                  : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {preset.icon}
                  </div>
                  {isSelected && (
                    <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      Seçili
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">
                  {preset.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {preset.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                {preset.downMbps === 0 ? (
                  <span className="text-xs font-mono text-slate-400">Limitsiz Hız</span>
                ) : (
                  <div className="text-xs font-mono space-y-0.5">
                    <div className="flex items-center gap-1 text-cyan-400">
                      <ArrowDown className="w-3 h-3" />
                      <span>{preset.downMbps} Mbps DL</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <ArrowUp className="w-3 h-3" />
                      <span>{preset.upMbps} Mbps UL</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Rate Sliders (shown when enabled or custom selected) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          İnce Ayar & Hız Limit Sürgüleri (Megabit / Saniye)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Download limit slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <ArrowDown className="w-4 h-4 text-cyan-400" />
                Maksimum İndirme Limiti (Download)
              </span>
              <span className="font-mono text-cyan-400 font-bold text-sm tabular-nums">
                {throttling.maxDownloadMbps} Mbps
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="200"
              step="1"
              value={throttling.maxDownloadMbps}
              onChange={(e) => handleCustomChange(Number(e.target.value), throttling.maxUploadMbps)}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1 Mbps (Minimum)</span>
              <span>50 Mbps</span>
              <span>100 Mbps</span>
              <span>200 Mbps</span>
            </div>
          </div>

          {/* Upload limit slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <ArrowUp className="w-4 h-4 text-emerald-400" />
                Maksimum Yükleme Limiti (Upload)
              </span>
              <span className="font-mono text-emerald-400 font-bold text-sm tabular-nums">
                {throttling.maxUploadMbps} Mbps
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={throttling.maxUploadMbps}
              onChange={(e) => handleCustomChange(throttling.maxDownloadMbps, Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1 Mbps</span>
              <span>25 Mbps</span>
              <span>50 Mbps</span>
              <span>100 Mbps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operating System Native QoS Commands */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            İşletim Sistemi Çekirdek Düzeyi QoS Komutları
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Bu komutları bilgisayarınızın terminalinde (PowerShell veya Bash) çalıştırarak donanım düzeyinde gerçek bant genişliği sınırlaması uygulayabilirsiniz.
        </p>

        <div className="space-y-3">
          {/* Windows PowerShell */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300">
                Windows (PowerShell Yönetici):
              </span>
              <button
                onClick={() => copyToClipboard(windowsCmd, 'windows')}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copiedOs === 'windows' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Komutu Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <code className="text-xs font-mono text-cyan-300 break-all block select-all">
              {windowsCmd}
            </code>
          </div>

          {/* Linux */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300">
                Linux (Terminal / Wondershaper):
              </span>
              <button
                onClick={() => copyToClipboard(linuxCmd, 'linux')}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copiedOs === 'linux' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Komutu Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <code className="text-xs font-mono text-emerald-300 break-all block select-all">
              {linuxCmd}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
