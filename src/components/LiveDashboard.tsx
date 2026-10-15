import React, { useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Layers,
  Pause,
  Play,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { NetworkProfile, SpeedDataPoint, ThrottlingConfig } from '../types/network';
import { formatBytes, formatSpeed, formatTransferRate } from '../utils/formatters';

interface LiveDashboardProps {
  activeNetwork: NetworkProfile;
  liveDownloadSpeed: number;
  liveUploadSpeed: number;
  speedHistory: SpeedDataPoint[];
  throttling: ThrottlingConfig;
  isMonitoring: boolean;
  isOnline: boolean;
  latencyMs: number;
  totalDownloadedAll: number;
  totalUploadedAll: number;
  totalCombinedAll: number;
  onToggleMonitoring: () => void;
  onNavigateToLimiter: () => void;
}

export const LiveDashboard: React.FC<LiveDashboardProps> = ({
  activeNetwork,
  liveDownloadSpeed,
  liveUploadSpeed,
  speedHistory,
  throttling,
  isMonitoring,
  isOnline,
  latencyMs,
  totalDownloadedAll,
  totalUploadedAll,
  totalCombinedAll,
  onToggleMonitoring,
  onNavigateToLimiter,
}) => {
  const [speedUnit, setSpeedUnit] = useState<'bytes' | 'bits'>('bytes');

  // Calculate peak speeds in current history buffer
  const peakDownload = Math.max(...speedHistory.map((p) => p.downloadSpeedBps), 1);
  const peakUpload = Math.max(...speedHistory.map((p) => p.uploadSpeedBps), 1);
  const chartMax = Math.max(peakDownload, peakUpload, 5 * 1024 * 1024);

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 200;
  const paddingBottom = 24;
  const paddingTop = 12;
  const effectiveHeight = chartHeight - paddingBottom - paddingTop;

  // Build SVG path points for download and upload
  const pointsCount = speedHistory.length;
  const getX = (index: number) => (index / (pointsCount - 1 || 1)) * chartWidth;
  const getY = (val: number) =>
    chartHeight - paddingBottom - (Math.min(val, chartMax) / chartMax) * effectiveHeight;

  const downloadPath = speedHistory
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.downloadSpeedBps).toFixed(1)}`)
    .join(' ');

  const downloadArea = `${downloadPath} L ${chartWidth} ${chartHeight - paddingBottom} L 0 ${chartHeight - paddingBottom} Z`;

  const uploadPath = speedHistory
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.uploadSpeedBps).toFixed(1)}`)
    .join(' ');

  const uploadArea = `${uploadPath} L ${chartWidth} ${chartHeight - paddingBottom} L 0 ${chartHeight - paddingBottom} Z`;

  return (
    <div className="space-y-6">
      {/* Throttling Alert Banner if enabled */}
      {throttling.enabled && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-amber-300">Hız Sınırlandırıcı Devrede: </span>
              İndirme en fazla {throttling.maxDownloadMbps} Mbps, Yükleme en fazla {throttling.maxUploadMbps} Mbps ile limitlendi.
            </div>
          </div>
          <button
            onClick={onNavigateToLimiter}
            className="text-xs font-medium text-amber-400 hover:text-amber-200 underline whitespace-nowrap"
          >
            Sınırlandırma Ayarlarını Değiştir &rarr;
          </button>
        </div>
      )}

      {/* Speedometers & Real-time Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Instant Download Speed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ArrowDownCircle className="w-4 h-4 text-cyan-400" />
              Anlık İndirme Hızı
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Tepe: {formatTransferRate(peakDownload)}
            </span>
          </div>
          <div className="mt-1">
            <div className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {speedUnit === 'bytes'
                ? formatTransferRate(liveDownloadSpeed)
                : formatSpeed(liveDownloadSpeed)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="font-mono text-slate-300">
                {formatSpeed(liveDownloadSpeed)}
              </span>
              <span>·</span>
              <span className="text-cyan-400">Gelen Veri Akışı</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
            <ArrowDownCircle className="w-32 h-32 text-cyan-400" />
          </div>
        </div>

        {/* Instant Upload Speed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
              Anlık Yükleme Hızı
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              Tepe: {formatTransferRate(peakUpload)}
            </span>
          </div>
          <div className="mt-1">
            <div className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {speedUnit === 'bytes'
                ? formatTransferRate(liveUploadSpeed)
                : formatSpeed(liveUploadSpeed)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="font-mono text-slate-300">
                {formatSpeed(liveUploadSpeed)}
              </span>
              <span>·</span>
              <span className="text-emerald-400">Giden Veri Akışı</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
            <ArrowUpCircle className="w-32 h-32 text-emerald-400" />
          </div>
        </div>

        {/* Active Network Total Usage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-4 h-4 text-blue-400" />
              Seçili Ağ Kullanımı
            </span>
            <span className="text-[11px] text-slate-400 truncate max-w-[100px]">
              {activeNetwork.name}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
            {formatBytes(activeNetwork.downloadBytes + activeNetwork.uploadBytes)}
          </div>
          <div className="mt-2 text-xs text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>DL: {formatBytes(activeNetwork.downloadBytes)}</span>
              <span>UL: {formatBytes(activeNetwork.uploadBytes)}</span>
            </div>
            {activeNetwork.monthlyQuotaBytes && activeNetwork.monthlyQuotaBytes > 0 && (
              <div className="text-[11px] text-amber-400 font-mono pt-1">
                Kota: {formatBytes(activeNetwork.monthlyQuotaBytes)}
              </div>
            )}
          </div>
        </div>

        {/* Global Total Usage across ALL networks */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-700/80 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Layers className="w-4 h-4 text-indigo-400" />
              Genel Toplam İnternet
            </span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
              Tüm Ağlar
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatBytes(totalCombinedAll)}
          </div>
          <div className="mt-2 text-xs text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>Toplam DL: {formatBytes(totalDownloadedAll)}</span>
            </div>
            <div className="flex justify-between">
              <span>Toplam UL: {formatBytes(totalUploadedAll)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Bandwidth SVG Graph (60-second telemetry) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-200">
                Gerçek Zamanlı Trafik Akış Grafiği (Son 30 Saniye)
              </h3>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-400">
                Gecikme: {latencyMs} ms
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              İndirme (Cyan) ve Yükleme (Zümrüt Yeşili) hızlarının anlık spektrum dağılımı
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Speed Unit Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setSpeedUnit('bytes')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  speedUnit === 'bytes'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MB/s (Bayt)
              </button>
              <button
                onClick={() => setSpeedUnit('bits')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  speedUnit === 'bits'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mbps (Bit)
              </button>
            </div>

            {/* Pause/Resume Monitor */}
            <button
              onClick={onToggleMonitoring}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isMonitoring
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
              }`}
            >
              {isMonitoring ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Durdur</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Devam Et</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs mb-3 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            <span>İndirme (Download)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span>Yükleme (Upload)</span>
          </div>
          <div className="ml-auto font-mono text-[11px] text-slate-500">
            Maksimum Ölçek: {formatTransferRate(chartMax)}
          </div>
        </div>

        {/* SVG Canvas Chart */}
        <div className="w-full bg-slate-950 rounded-lg p-2 border border-slate-800/80 overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 sm:h-52 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35" />
                <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0" />
              </linearGradient>
              <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - paddingBottom - ratio * effectiveHeight;
              return (
                <g key={ratio}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="8"
                    y={y - 4}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {formatTransferRate(chartMax * ratio)}
                  </text>
                </g>
              );
            })}

            {/* Download Area & Stroke */}
            <path d={downloadArea} fill="url(#downloadGrad)" />
            <path
              d={downloadPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Upload Area & Stroke */}
            <path d={uploadArea} fill="url(#uploadGrad)" />
            <path
              d={uploadPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Timestamp labels on bottom */}
            {speedHistory.map((p, idx) => {
              if (idx % 6 !== 0 && idx !== speedHistory.length - 1) return null;
              const x = getX(idx);
              return (
                <text
                  key={idx}
                  x={x}
                  y={chartHeight - 6}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor={idx === 0 ? 'start' : idx === speedHistory.length - 1 ? 'end' : 'middle'}
                >
                  {p.timeLabel}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Current Active Connection Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">Bağdaştırıcı:</span>
            <span className="font-medium text-slate-300 truncate block">
              {activeNetwork.interfaceName}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Protokol Güvenliği:</span>
            <span className="font-medium text-slate-300 block">
              {activeNetwork.security || 'WPA2/3'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Ping / Gecikme:</span>
            <span className="font-mono text-cyan-400 font-semibold block">
              {isOnline ? `${latencyMs} ms` : 'Bağlantı Yok'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">İzleme Durumu:</span>
            <span className="text-emerald-400 font-medium block">
              {isMonitoring ? 'Aktif (1 sn Örnekleme)' : 'Duraklatıldı'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
