import React from 'react';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  WifiOff,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { OutageEvent } from '../types/network';
import { formatDuration, formatTimeTurkish, formatDateTurkish } from '../utils/formatters';

interface OutageNotifierProps {
  isOnline: boolean;
  latencyMs: number;
  outages: OutageEvent[];
  isSimulatingOutage: boolean;
  notificationPermission: NotificationPermission;
  soundEnabled: boolean;
  onRequestNotificationPermission: () => Promise<string>;
  onSimulateOutage: () => void;
  onToggleSound: () => void;
  onClearOutages: () => void;
}

export const OutageNotifier: React.FC<OutageNotifierProps> = ({
  isOnline,
  latencyMs,
  outages,
  isSimulatingOutage,
  notificationPermission,
  soundEnabled,
  onRequestNotificationPermission,
  onSimulateOutage,
  onToggleSound,
  onClearOutages,
}) => {
  return (
    <div className="space-y-6">
      {/* Real-time Connection Status Hero */}
      <div
        className={`rounded-xl border p-5 sm:p-6 transition-colors ${
          isOnline
            ? 'bg-emerald-950/20 border-emerald-800/80'
            : 'bg-rose-950/40 border-rose-600 animate-pulse'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                isOnline
                  ? 'bg-emerald-900/60 text-emerald-400'
                  : 'bg-rose-900/80 text-rose-300'
              }`}
            >
              {isOnline ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <WifiOff className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {isOnline
                    ? 'İnternet Bağlantısı Aktif & Stabil'
                    : 'DİKKAT: İnternet Bağlantısı Koptu!'}
                </h2>
                {isSimulatingOutage && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-900/80 text-amber-300 border border-amber-700">
                    Test Simülasyonu
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {isOnline
                  ? `Bağlantı gecikmesi: ${latencyMs} ms · Ağ geçidi ve DNS yanıt veriyor.`
                  : 'Ağ geçidine veya dış sunuculara ulaşılamıyor. Kesinti süresi kaydediliyor...'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onSimulateOutage}
              disabled={isSimulatingOutage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulatingOutage ? 'Test Sürüyor...' : 'Kesinti Alarmını Test Et'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification and Alert Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Desktop Browser Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <Bell className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Masaüstü Windows/Mac Bildirimleri
                </h3>
                <p className="text-xs text-slate-400">
                  İnternet koptuğunda ekranın sağ alt köşesinde uyarı balonu çıkartır
                </p>
              </div>
            </div>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {notificationPermission === 'granted' ? 'İzin Verildi' : 'İzin Bekliyor'}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {notificationPermission === 'granted'
                ? 'Sistem bildirimleri aktif.'
                : 'Bildirim gönderebilmek için izin vermelisiniz.'}
            </span>
            {notificationPermission !== 'granted' && (
              <button
                onClick={onRequestNotificationPermission}
                className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
              >
                Bildirim İznini Aç
              </button>
            )}
          </div>
        </div>

        {/* Audio Beep Alert */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Sesli Alarm Tonu (Web Audio Synth)
                </h3>
                <p className="text-xs text-slate-400">
                  Bağlantı koptuğunda ve geri geldiğinde hoparlörden sesli uyarı verir
                </p>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden ${
                soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              {soundEnabled
                ? 'Sesli uyarılar açık (Kesintide çift düşüş tonu, bağlantıda akort sesi).'
                : 'Sesli uyarılar sessize alındı.'}
            </span>
          </div>
        </div>
      </div>

      {/* Outage Log Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              İnternet Kesinti Geçmişi & Süre Kaydı
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Meydana gelen tüm kesintiler, süresi ve tespit edilen nedenler
            </p>
          </div>
          {outages.length > 0 && (
            <button
              onClick={onClearOutages}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Günlüğü Temizle</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Başlangıç Zamanı</th>
                <th className="py-3 px-4 font-semibold">Bitiş Zamanı</th>
                <th className="py-3 px-4 font-semibold">Kesinti Süresi</th>
                <th className="py-3 px-4 font-semibold">Olay Açıklaması</th>
                <th className="py-3 px-4 font-semibold text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {outages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Henüz kayıtlı bir internet kesintisi bulunmuyor. Bağlantınız kesintisiz çalışıyor.
                  </td>
                </tr>
              ) : (
                outages.map((outage) => (
                  <tr key={outage.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {formatDateTurkish(outage.startTime)} {formatTimeTurkish(outage.startTime)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {outage.endTime ? `${formatTimeTurkish(outage.endTime)}` : 'Devam Ediyor...'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-amber-300 tabular-nums">
                      {outage.durationSeconds ? formatDuration(outage.durationSeconds) : 'Ölçülüyor'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {outage.reason}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {outage.status === 'resolved' ? (
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                          Çözüldü
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded animate-pulse">
                          Aktif Kesinti
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
