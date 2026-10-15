import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Printer,
  PlusCircle,
  TrendingUp,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Database,
} from 'lucide-react';
import { HistoryRecord, NetworkProfile } from '../types/network';
import { formatBytes, formatTransferRate, formatDuration, formatDateTurkish } from '../utils/formatters';
import { downloadFile } from '../utils/desktopScripts';

interface HistoricalReportsProps {
  historyRecords: HistoryRecord[];
  networks: NetworkProfile[];
  activeNetwork: NetworkProfile;
  onSaveCurrentSession: () => void;
  onOpenPrintModal: () => void;
}

export const HistoricalReports: React.FC<HistoricalReportsProps> = ({
  historyRecords,
  networks,
  activeNetwork,
  onSaveCurrentSession,
  onOpenPrintModal,
}) => {
  const [selectedNetworkFilter, setSelectedNetworkFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic
  const now = new Date();
  const filteredRecords = historyRecords.filter((record) => {
    // Network filter
    if (selectedNetworkFilter !== 'all' && record.networkId !== selectedNetworkFilter) {
      return false;
    }

    // Search term
    if (searchTerm && !record.networkName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Date filter
    const recordDate = new Date(record.date);
    if (selectedDateFilter === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      return record.date === todayStr;
    }
    if (selectedDateFilter === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= sevenDaysAgo;
    }
    if (selectedDateFilter === 'month') {
      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Calculate totals
  const totalDownload = filteredRecords.reduce((sum, r) => sum + r.downloadBytes, 0);
  const totalUpload = filteredRecords.reduce((sum, r) => sum + r.uploadBytes, 0);
  const totalCombined = totalDownload + totalUpload;
  const totalDuration = filteredRecords.reduce((sum, r) => sum + r.durationSeconds, 0);
  const peakSpeed = Math.max(...filteredRecords.map((r) => r.peakDownloadBps), 0);

  // Export CSV
  const exportCSV = () => {
    const headers = ['Tarih', 'Ag_Adi', 'Baglanti_Turu', 'Indirme_Bayt', 'Indirme_Formatli', 'Yukleme_Bayt', 'Yukleme_Formatli', 'Toplam_Bayt', 'Toplam_Formatli', 'Sure_Saniye'];
    const rows = filteredRecords.map((r) => [
      r.date,
      `"${r.networkName.replace(/"/g, '""')}"`,
      r.connectionType,
      r.downloadBytes,
      `"${formatBytes(r.downloadBytes)}"`,
      r.uploadBytes,
      `"${formatBytes(r.uploadBytes)}"`,
      r.downloadBytes + r.uploadBytes,
      `"${formatBytes(r.downloadBytes + r.uploadBytes)}"`,
      r.durationSeconds,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    downloadFile(`NetPulse_Trafik_Raporu_${new Date().toISOString().split('T')[0]}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };

  // Export JSON
  const exportJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      reportTitle: 'NetPulse Ağ Trafik ve Bant Genişliği Raporu',
      summary: {
        totalDownloadBytes: totalDownload,
        totalUploadBytes: totalUpload,
        totalCombinedBytes: totalCombined,
        totalSessions: filteredRecords.length,
      },
      records: filteredRecords,
    };
    downloadFile(`NetPulse_Rapor_${new Date().toISOString().split('T')[0]}.json`, JSON.stringify(reportData, null, 2), 'application/json');
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Geçmiş Ağ Trafik Verileri & Raporlama Merkezi
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Farklı ağlardaki upload ve download oturumlarını inceleyin, CSV veya PDF raporu olarak dışa aktarın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onSaveCurrentSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Şu anki aktif oturumu geçmiş tablosuna kaydeder"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Anlık Oturumu Kaydet</span>
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV İndir</span>
            </button>
            <button
              onClick={exportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>JSON İndir</span>
            </button>
            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Raporu</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Ağ Filtresi:
            </label>
            <select
              value={selectedNetworkFilter}
              onChange={(e) => setSelectedNetworkFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">Tüm Ağlar ({networks.length} Profil)</option>
              {networks.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Zaman Aralığı:
            </label>
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setSelectedDateFilter('all')}
                className={`flex-1 py-1 rounded font-medium ${
                  selectedDateFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setSelectedDateFilter('7days')}
                className={`flex-1 py-1 rounded font-medium ${
                  selectedDateFilter === '7days' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Son 7 Gün
              </button>
              <button
                onClick={() => setSelectedDateFilter('month')}
                className={`flex-1 py-1 rounded font-medium ${
                  selectedDateFilter === 'month' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Bu Ay
              </button>
              <button
                onClick={() => setSelectedDateFilter('today')}
                className={`flex-1 py-1 rounded font-medium ${
                  selectedDateFilter === 'today' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Bugün
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Ağ İsmine Göre Ara:
            </label>
            <input
              type="text"
              placeholder="Örn: Superonline, Ofis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <ArrowDownCircle className="w-4 h-4 text-cyan-400" />
            <span>Filtrelenen İndirme</span>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
            {formatBytes(totalDownload)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
            <span>Filtrelenen Yükleme</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatBytes(totalUpload)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Toplam Veri Hacmi</span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {formatBytes(totalCombined)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Toplam Bağlantı Süresi</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
            {formatDuration(totalDuration)}
          </div>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Ağ Kullanım Geçmiş Günlüğü ({filteredRecords.length} Kayıt)
          </h3>
          <span className="text-xs text-slate-500">
            Tablo değerleri gerçek zamanlı oturum kayıtlarını temsil eder
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Tarih</th>
                <th className="py-3 px-4 font-semibold">Ağ Profili</th>
                <th className="py-3 px-4 font-semibold">Tür</th>
                <th className="py-3 px-4 font-semibold text-right">İndirme (DL)</th>
                <th className="py-3 px-4 font-semibold text-right">Yükleme (UL)</th>
                <th className="py-3 px-4 font-semibold text-right">Toplam Trafik</th>
                <th className="py-3 px-4 font-semibold text-right">Tepe Hız</th>
                <th className="py-3 px-4 font-semibold text-right">Süre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Seçilen filtre kriterlerine uygun geçmiş veri bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-100 whitespace-nowrap">
                      {record.networkName}
                    </td>
                    <td className="py-3 px-4 text-slate-400 capitalize whitespace-nowrap">
                      {record.connectionType === 'wifi' ? 'Wi-Fi' : record.connectionType === 'ethernet' ? 'Kablolu' : 'Hotspot'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-cyan-400 tabular-nums">
                      {formatBytes(record.downloadBytes)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 tabular-nums">
                      {formatBytes(record.uploadBytes)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-white font-medium tabular-nums">
                      {formatBytes(record.downloadBytes + record.uploadBytes)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                      {formatTransferRate(record.peakDownloadBps)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                      {formatDuration(record.durationSeconds)}
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
