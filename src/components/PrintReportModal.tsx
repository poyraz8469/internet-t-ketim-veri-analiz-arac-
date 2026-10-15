import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { HistoryRecord, NetworkProfile } from '../types/network';
import { formatBytes, formatDuration, formatTransferRate } from '../utils/formatters';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyRecords: HistoryRecord[];
  networks: NetworkProfile[];
  totalDownloadedAll: number;
  totalUploadedAll: number;
  totalCombinedAll: number;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  historyRecords,
  networks,
  totalDownloadedAll,
  totalUploadedAll,
  totalCombinedAll,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 print:m-0 print:w-full print:shadow-none">
        {/* Header - Not printed or styled for print */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Yazdırılabilir İnternet Trafik & Veri Kullanım Raporu
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-slate-800" id="printable-report">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                NetPulse Ağ Trafik & Bant Genişliği Raporu
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Oluşturulma Tarihi: {currentDate} · Bilgisayar Ağ Analiz Özeti
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-slate-700">
                RESMİ RAPOR
              </span>
            </div>
          </div>

          {/* High-Level Totals Grid */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="text-xs text-slate-500 block">Genel Toplam İndirme (DL)</span>
              <span className="text-xl font-bold font-mono text-cyan-700">
                {formatBytes(totalDownloadedAll)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Genel Toplam Yükleme (UL)</span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {formatBytes(totalUploadedAll)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Tüm Ağlar Birleşik Hacim</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {formatBytes(totalCombinedAll)}
              </span>
            </div>
          </div>

          {/* Network Profiles Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              1. Ağ Bazında Toplam Veri Dağılımı
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Ağ Profili</th>
                  <th className="p-2">Bağdaştırıcı Türü</th>
                  <th className="p-2 text-right">İndirme (DL)</th>
                  <th className="p-2 text-right">Yükleme (UL)</th>
                  <th className="p-2 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {networks.map((n) => (
                  <tr key={n.id}>
                    <td className="p-2 font-medium">{n.name}</td>
                    <td className="p-2 text-slate-500">{n.interfaceName}</td>
                    <td className="p-2 text-right font-mono">{formatBytes(n.downloadBytes)}</td>
                    <td className="p-2 text-right font-mono">{formatBytes(n.uploadBytes)}</td>
                    <td className="p-2 text-right font-mono font-bold">
                      {formatBytes(n.downloadBytes + n.uploadBytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Session Logs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              2. Kayıtlı Oturum Geçmişi
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Tarih</th>
                  <th className="p-2">Ağ Adı</th>
                  <th className="p-2 text-right">İndirme</th>
                  <th className="p-2 text-right">Yükleme</th>
                  <th className="p-2 text-right">Toplam</th>
                  <th className="p-2 text-right">Süre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {historyRecords.slice(0, 10).map((r) => (
                  <tr key={r.id}>
                    <td className="p-2 font-mono text-slate-600">{r.date}</td>
                    <td className="p-2 font-medium">{r.networkName}</td>
                    <td className="p-2 text-right font-mono">{formatBytes(r.downloadBytes)}</td>
                    <td className="p-2 text-right font-mono">{formatBytes(r.uploadBytes)}</td>
                    <td className="p-2 text-right font-mono font-semibold">
                      {formatBytes(r.downloadBytes + r.uploadBytes)}
                    </td>
                    <td className="p-2 text-right font-mono text-slate-600">
                      {formatDuration(r.durationSeconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer certification */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
            <span>NetPulse v2.4 Network Telemetry Suite</span>
            <span>Rapor Doğrulandı: Sistem Otomatik Oluşturmuştur</span>
          </div>
        </div>

        {/* Footer actions for screen view */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Kapat
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır</span>
          </button>
        </div>
      </div>
    </div>
  );
};
