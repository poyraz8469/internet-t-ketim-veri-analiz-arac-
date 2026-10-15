/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { NetworkSelector } from './components/NetworkSelector';
import { LiveDashboard } from './components/LiveDashboard';
import { BandwidthLimiter } from './components/BandwidthLimiter';
import { HistoricalReports } from './components/HistoricalReports';
import { OutageNotifier } from './components/OutageNotifier';
import { LanDeviceScanner } from './components/LanDeviceScanner';
import { DesktopInstallerModal } from './components/DesktopInstallerModal';
import { PrintReportModal } from './components/PrintReportModal';

import { useOutageDetector } from './hooks/useOutageDetector';
import { useNetworkMonitor } from './hooks/useNetworkMonitor';
import { formatBytes } from './utils/formatters';
import { HistoryRecord } from './types/network';
import { WifiOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'limiter' | 'reports' | 'outage' | 'devices'>('live');
  const [isInstallerOpen, setIsInstallerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Outage detection hook
  const {
    isOnline,
    latencyMs,
    outages,
    isSimulatingOutage,
    notificationPermission,
    soundEnabled,
    requestNotificationPermission,
    simulateOutage,
    toggleSound,
    clearOutages,
  } = useOutageDetector();

  // Network monitoring hook
  const {
    networks,
    activeNetwork,
    activeNetworkId,
    throttling,
    liveDownloadSpeed,
    liveUploadSpeed,
    speedHistory,
    historyRecords,
    isMonitoring,
    totalDownloadedAll,
    totalUploadedAll,
    totalCombinedAll,
    setIsMonitoring,
    setThrottling,
    switchNetwork,
    addNetwork,
    updateNetworkQuota,
    resetNetworkStats,
    setHistoryRecords,
  } = useNetworkMonitor(isOnline);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Snapshot current session to history records
  const handleSaveCurrentSession = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: HistoryRecord = {
      id: `hist-snapshot-${Date.now()}`,
      date: todayStr,
      networkId: activeNetwork.id,
      networkName: activeNetwork.name,
      connectionType: activeNetwork.type,
      downloadBytes: activeNetwork.downloadBytes,
      uploadBytes: activeNetwork.uploadBytes,
      durationSeconds: Math.floor(Math.random() * 7200) + 1800,
      peakDownloadBps: Math.max(...speedHistory.map((p) => p.downloadSpeedBps)),
      peakUploadBps: Math.max(...speedHistory.map((p) => p.uploadSpeedBps)),
    };

    setHistoryRecords((prev) => [newRecord, ...prev]);
    showToast('Aktif oturum geçmiş raporlarına başarıyla kaydedildi!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInstallerModal={() => setIsInstallerOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Offline Alert Strip if disconnected */}
        {!isOnline && (
          <div className="bg-rose-950/80 border border-rose-600 rounded-xl p-4 flex items-center justify-between gap-4 text-rose-200 animate-pulse">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-rose-100">İnternet Bağlantısı Kesildi! </span>
                NetPulse kesinti süresini ve ağ olayını arka planda kaydetmeye başladı.
              </div>
            </div>
            <button
              onClick={() => setActiveTab('outage')}
              className="text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors"
            >
              Kesinti Ayrıntıları &rarr;
            </button>
          </div>
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/80 text-cyan-300 text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB 1: Canlı Takip & Ağ Seçici */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <LiveDashboard
              activeNetwork={activeNetwork}
              liveDownloadSpeed={liveDownloadSpeed}
              liveUploadSpeed={liveUploadSpeed}
              speedHistory={speedHistory}
              throttling={throttling}
              isMonitoring={isMonitoring}
              isOnline={isOnline}
              latencyMs={latencyMs}
              totalDownloadedAll={totalDownloadedAll}
              totalUploadedAll={totalUploadedAll}
              totalCombinedAll={totalCombinedAll}
              onToggleMonitoring={() => setIsMonitoring(!isMonitoring)}
              onNavigateToLimiter={() => setActiveTab('limiter')}
            />

            <NetworkSelector
              networks={networks}
              activeNetworkId={activeNetworkId}
              onSelectNetwork={switchNetwork}
              onAddNetwork={(newNet) => {
                addNetwork(newNet);
                showToast(`"${newNet.name}" profili başarıyla eklendi!`);
              }}
              onUpdateQuota={(id, quota) => {
                updateNetworkQuota(id, quota);
                showToast('Aylık veri kotası güncellendi.');
              }}
              onResetStats={(id) => {
                resetNetworkStats(id);
                showToast('Ağ sayaçları sıfırlandı.');
              }}
            />
          </div>
        )}

        {/* TAB 2: Hız Sınırlandırıcı (Limiter) */}
        {activeTab === 'limiter' && (
          <BandwidthLimiter
            throttling={throttling}
            onUpdateThrottling={(cfg) => {
              setThrottling(cfg);
              if (cfg.enabled) {
                showToast(`Hız sınırı uygulandı: DL ${cfg.maxDownloadMbps} Mbps, UL ${cfg.maxUploadMbps} Mbps`);
              } else {
                showToast('Bant genişliği sınırlandırması kapatıldı (Tam Hız).');
              }
            }}
            activeAdapterName={activeNetwork.interfaceName}
          />
        )}

        {/* TAB 3: Geçmiş Raporlar */}
        {activeTab === 'reports' && (
          <HistoricalReports
            historyRecords={historyRecords}
            networks={networks}
            activeNetwork={activeNetwork}
            onSaveCurrentSession={handleSaveCurrentSession}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {/* TAB 4: Kesinti Bildirimi */}
        {activeTab === 'outage' && (
          <OutageNotifier
            isOnline={isOnline}
            latencyMs={latencyMs}
            outages={outages}
            isSimulatingOutage={isSimulatingOutage}
            notificationPermission={notificationPermission}
            soundEnabled={soundEnabled}
            onRequestNotificationPermission={async () => {
              const res = await requestNotificationPermission();
              if (res === 'granted') {
                showToast('Masaüstü bildirimleri başarıyla aktifleştirildi!');
              }
              return res;
            }}
            onSimulateOutage={() => {
              simulateOutage(6);
              showToast('6 saniyelik test kesintisi başlatıldı...');
            }}
            onToggleSound={() => {
              toggleSound();
              showToast(soundEnabled ? 'Sesli uyarılar kapatıldı.' : 'Sesli uyarılar açıldı.');
            }}
            onClearOutages={() => {
              clearOutages();
              showToast('Kesinti günlüğü temizlendi.');
            }}
          />
        )}

        {/* TAB 5: Yerel Ağ Cihazları */}
        {activeTab === 'devices' && (
          <LanDeviceScanner />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">NetPulse</span>
            <span>·</span>
            <span>Yerel Ağ ve İnternet Trafik Takip Platformu</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Örnekleme: 1000ms</span>
            <span>·</span>
            <span>QoS Denetimi: Aktif</span>
            <span>·</span>
            <span>PWA & Daemon Uyumlu</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DesktopInstallerModal
        isOpen={isInstallerOpen}
        onClose={() => setIsInstallerOpen(false)}
        activeNetworkName={activeNetwork.name}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        historyRecords={historyRecords}
        networks={networks}
        totalDownloadedAll={totalDownloadedAll}
        totalUploadedAll={totalUploadedAll}
        totalCombinedAll={totalCombinedAll}
      />
    </div>
  );
}
