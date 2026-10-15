import React, { useState } from 'react';
import { Wifi, Cpu, Smartphone, Globe, Plus, Trash2, Settings, ShieldCheck, Check } from 'lucide-react';
import { NetworkProfile, ConnectionType } from '../types/network';
import { formatBytes } from '../utils/formatters';

interface NetworkSelectorProps {
  networks: NetworkProfile[];
  activeNetworkId: string;
  onSelectNetwork: (id: string) => void;
  onAddNetwork: (profile: Omit<NetworkProfile, 'id' | 'isCurrent' | 'downloadBytes' | 'uploadBytes'>) => void;
  onUpdateQuota: (id: string, quotaGB: number) => void;
  onResetStats: (id: string) => void;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks,
  activeNetworkId,
  onSelectNetwork,
  onAddNetwork,
  onUpdateQuota,
  onResetStats,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuotaId, setEditingQuotaId] = useState<string | null>(null);
  const [quotaInput, setQuotaInput] = useState<number>(100);

  // New Network form state
  const [newName, setNewName] = useState('');
  const [newSsid, setNewSsid] = useState('');
  const [newType, setNewType] = useState<ConnectionType>('wifi');
  const [newInterface, setNewInterface] = useState('Wi-Fi Bağdaştırıcısı');
  const [newQuotaGB, setNewQuotaGB] = useState(0);

  const getNetworkIcon = (type: ConnectionType) => {
    switch (type) {
      case 'wifi':
        return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'ethernet':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'hotspot':
        return <Smartphone className="w-4 h-4 text-amber-400" />;
      default:
        return <Globe className="w-4 h-4 text-blue-400" />;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddNetwork({
      name: newName.trim(),
      ssid: newSsid.trim() || undefined,
      type: newType,
      interfaceName: newInterface.trim() || 'Standart Ağ Bağdaştırıcısı',
      monthlyQuotaBytes: newQuotaGB > 0 ? newQuotaGB * 1024 * 1024 * 1024 : 0,
      color: newType === 'wifi' ? '#06b6d4' : newType === 'ethernet' ? '#10b981' : '#f59e0b',
      lastConnected: 'Şimdi oluşturuldu',
      security: newType === 'wifi' ? 'WPA2/WPA3 Kişisel' : 'Yerel Ağ',
    });

    setNewName('');
    setNewSsid('');
    setNewQuotaGB(0);
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Ağ Profilleri ve Veri Takibi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hangi ağda ne kadar upload & download yaptığınızı ayrı ayrı izleyin
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Yeni Ağ Ekle</span>
        </button>
      </div>

      {/* Network Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {networks.map((net) => {
          const isActive = net.id === activeNetworkId;
          const totalBytes = net.downloadBytes + net.uploadBytes;
          const hasQuota = !!net.monthlyQuotaBytes && net.monthlyQuotaBytes > 0;
          const quotaPercent = hasQuota
            ? Math.min(100, Math.round((totalBytes / net.monthlyQuotaBytes!) * 100))
            : null;

          return (
            <div
              key={net.id}
              onClick={() => onSelectNetwork(net.id)}
              className={`relative cursor-pointer rounded-lg p-3.5 transition-all border text-left flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-500/60 shadow-md shadow-cyan-950/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-slate-950 border border-slate-800">
                      {getNetworkIcon(net.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 truncate max-w-[140px] sm:max-w-[170px]">
                        {net.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        {net.interfaceName}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-1.5 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      Aktif
                    </span>
                  )}
                </div>

                {/* Usage breakdown */}
                <div className="space-y-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">İndirme (DL):</span>
                    <span className="font-mono text-slate-200 tabular-nums font-medium">
                      {formatBytes(net.downloadBytes)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Yükleme (UL):</span>
                    <span className="font-mono text-slate-200 tabular-nums font-medium">
                      {formatBytes(net.uploadBytes)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/40">
                    <span className="text-slate-300 font-medium">Toplam Kullanım:</span>
                    <span className="font-mono text-cyan-400 font-semibold tabular-nums">
                      {formatBytes(totalBytes)}
                    </span>
                  </div>
                </div>

                {/* Quota Progress if set */}
                {hasQuota && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Kota Durumu:</span>
                      <span className={`font-mono tabular-nums ${quotaPercent! > 85 ? 'text-rose-400' : 'text-slate-300'}`}>
                        %{quotaPercent} ({formatBytes(totalBytes)} / {formatBytes(net.monthlyQuotaBytes!)})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          quotaPercent! > 90
                            ? 'bg-rose-500'
                            : quotaPercent! > 75
                            ? 'bg-amber-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${quotaPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{net.security || 'WPA2/3'}</span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditingQuotaId(net.id);
                      setQuotaInput(net.monthlyQuotaBytes ? Math.round(net.monthlyQuotaBytes / (1024 * 1024 * 1024)) : 50);
                    }}
                    title="Kota Belirle"
                    className="p-1 hover:text-slate-200 hover:bg-slate-700/60 rounded"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`${net.name} ağı için sayaçları sıfırlamak istiyor musunuz?`)) {
                        onResetStats(net.id);
                      }
                    }}
                    title="Sayaçları Sıfırla"
                    className="p-1 hover:text-rose-400 hover:bg-slate-700/60 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quota Edit Modal */}
      {editingQuotaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              Aylık Veri Kotası Ayarla
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Bu ağ için GB cinsinden kota belirleyin (0 = Sınırsız kota).
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Aylık Kota (GB)
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                value={quotaInput}
                onChange={(e) => setQuotaInput(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingQuotaId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  onUpdateQuota(editingQuotaId, quotaInput);
                  setEditingQuotaId(null);
                }}
                className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Network Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              Yeni Ağ Profili Ekle
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Farklı bir Wi-Fi, Ethernet veya Hotspot ağını takibe alın.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ağ Profil Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ev 2. Kat Wi-Fi, Yazlık Modem"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bağlantı Türü
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('wifi')}
                    className={`py-2 text-xs rounded-lg border font-medium transition-colors ${
                      newType === 'wifi'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Wi-Fi
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('ethernet')}
                    className={`py-2 text-xs rounded-lg border font-medium transition-colors ${
                      newType === 'ethernet'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Kablolu Ethernet
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('hotspot')}
                    className={`py-2 text-xs rounded-lg border font-medium transition-colors ${
                      newType === 'hotspot'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Mobil Hotspot
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  SSID / Ağ Yayını Adı (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: TurkTelekom_VDSL_4B"
                  value={newSsid}
                  onChange={(e) => setNewSsid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Aylık Kota (GB - 0 = Sınırsız)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newQuotaGB}
                  onChange={(e) => setNewQuotaGB(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                >
                  Profili Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
