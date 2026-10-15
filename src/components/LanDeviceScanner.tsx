import React, { useState } from 'react';
import {
  Wifi,
  Laptop,
  Smartphone,
  Tv,
  Gamepad,
  Cpu,
  HelpCircle,
  Search,
  RefreshCw,
  Edit2,
  ShieldAlert,
  Server,
  Radio,
  Clock,
  ArrowDownUp,
  Tag,
} from 'lucide-react';
import { LanDevice } from '../types/network';
import { INITIAL_LAN_DEVICES } from '../data/mockData';
import { formatBytes, formatSpeed } from '../utils/formatters';

interface LanDeviceScannerProps {
  onNotify?: (msg: string) => void;
}

export const LanDeviceScanner: React.FC<LanDeviceScannerProps> = () => {
  const [devices, setDevices] = useState<LanDevice[]>(() => {
    try {
      const saved = localStorage.getItem('netpulse_lan_devices');
      return saved ? JSON.parse(saved) : INITIAL_LAN_DEVICES;
    } catch {
      return INITIAL_LAN_DEVICES;
    }
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScannedIp, setCurrentScannedIp] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Device edit modal state
  const [editingDevice, setEditingDevice] = useState<LanDevice | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Save devices to localStorage
  const saveDevices = (updated: LanDevice[]) => {
    setDevices(updated);
    try {
      localStorage.setItem('netpulse_lan_devices', JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  };

  const runNetworkScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    const baseIp = '192.168.1.';
    let current = 1;

    const interval = setInterval(() => {
      current += 6;
      setScanProgress(Math.min(100, Math.round((current / 254) * 100)));
      setCurrentScannedIp(`${baseIp}${Math.min(254, current)}`);

      if (current >= 254) {
        clearInterval(interval);
        setIsScanning(false);
        setCurrentScannedIp('');
        // Add random slight jitter to active device latency
        setDevices((prev) =>
          prev.map((dev) => ({
            ...dev,
            latencyMs: dev.isOnline ? Math.max(1, +(dev.latencyMs + (Math.random() - 0.5) * 2).toFixed(1)) : 0,
            currentTrafficBps: dev.isOnline
              ? Math.max(5000, Math.round(dev.currentTrafficBps * (0.8 + Math.random() * 0.4)))
              : 0,
          }))
        );
      }
    }, 50);
  };

  const getDeviceIcon = (type: LanDevice['deviceType']) => {
    switch (type) {
      case 'router':
        return <Server className="w-4 h-4 text-cyan-400" />;
      case 'computer':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'phone':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'tv':
        return <Tv className="w-4 h-4 text-purple-400" />;
      case 'console':
        return <Gamepad className="w-4 h-4 text-pink-400" />;
      case 'iot':
        return <Radio className="w-4 h-4 text-amber-400" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleEditOpen = (dev: LanDevice) => {
    setEditingDevice(dev);
    setEditName(dev.customName || dev.hostname);
    setEditNotes(dev.notes || '');
  };

  const handleEditSave = () => {
    if (!editingDevice) return;
    const updated = devices.map((d) =>
      d.id === editingDevice.id
        ? {
            ...d,
            customName: editName.trim() || d.hostname,
            notes: editNotes.trim(),
          }
        : d
    );
    saveDevices(updated);
    setEditingDevice(null);
  };

  // Filter devices
  const filteredDevices = devices.filter((dev) => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'computer' && dev.deviceType !== 'computer') return false;
      if (selectedCategory === 'phone' && dev.deviceType !== 'phone' && dev.deviceType !== 'tablet') return false;
      if (selectedCategory === 'tv_console' && dev.deviceType !== 'tv' && dev.deviceType !== 'console') return false;
      if (selectedCategory === 'iot' && dev.deviceType !== 'iot') return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (dev.customName || '').toLowerCase().includes(q);
      const matchHost = dev.hostname.toLowerCase().includes(q);
      const matchIp = dev.ip.includes(q);
      const matchMac = dev.mac.toLowerCase().includes(q);
      const matchVendor = dev.vendor.toLowerCase().includes(q);
      return matchName || matchHost || matchIp || matchMac || matchVendor;
    }

    return true;
  });

  const onlineCount = devices.filter((d) => d.isOnline).length;
  const totalLanTrafficBps = devices.reduce((sum, d) => sum + (d.isOnline ? d.currentTrafficBps : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Subnet Scanner Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Yerel Ağdaki Cihazları Tarama & Keşif (LAN Device Discovery)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ağınıza bağlı tüm bilgisayarları, telefonları, akıllı televizyonları ve IoT cihazlarını anlık bant genişlikleriyle listeleyin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runNetworkScan}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Ağ Taranıyor...' : 'Ağı Şimdi Tara (ARP/ICMP)'}</span>
            </button>
          </div>
        </div>

        {/* Scan Progress Bar */}
        {isScanning && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
              <span>IP Adresleri Taranıyor: {currentScannedIp}</span>
              <span>%{scanProgress}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-75"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Cihaz Türü:
            </label>
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded font-medium whitespace-nowrap ${
                  selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Tümü ({devices.length})
              </button>
              <button
                onClick={() => setSelectedCategory('computer')}
                className={`px-3 py-1 rounded font-medium whitespace-nowrap ${
                  selectedCategory === 'computer' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Bilgisayarlar
              </button>
              <button
                onClick={() => setSelectedCategory('phone')}
                className={`px-3 py-1 rounded font-medium whitespace-nowrap ${
                  selectedCategory === 'phone' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Telefon & Tablet
              </button>
              <button
                onClick={() => setSelectedCategory('tv_console')}
                className={`px-3 py-1 rounded font-medium whitespace-nowrap ${
                  selectedCategory === 'tv_console' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                TV & Konsol
              </button>
              <button
                onClick={() => setSelectedCategory('iot')}
                className={`px-3 py-1 rounded font-medium whitespace-nowrap ${
                  selectedCategory === 'iot' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Akıllı Ev / IoT
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              IP, MAC veya Cihaz Adı Ara:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Örn: 192.168.1.104, iPhone, LG TV, Samsung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LAN Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Tespit Edilen Cihaz</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {devices.length} Cihaz
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Şu An Çevrimiçi</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {onlineCount} Aktif
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Ağ Geçidi / Modem</span>
          <span className="text-sm font-semibold font-mono text-slate-200 block truncate mt-1">
            192.168.1.1 (ZTE)
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Yerel Ağ Toplam Trafik</span>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatSpeed(totalLanTrafficBps)}
          </span>
        </div>
      </div>

      {/* Device Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Ağ Cihazları Listesi ({filteredDevices.length} Gösteriliyor)
          </h3>
          <span className="text-xs text-slate-500">
            Cihaz isimlerini düzenlemek için satır sonundaki butona tıklayabilirsiniz
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Cihaz Tanımı</th>
                <th className="py-3 px-4 font-semibold">IP Adresi</th>
                <th className="py-3 px-4 font-semibold">MAC Adresi / Üretici</th>
                <th className="py-3 px-4 font-semibold">Bağlantı</th>
                <th className="py-3 px-4 font-semibold text-right">Anlık Trafik</th>
                <th className="py-3 px-4 font-semibold text-right">Toplam Veri</th>
                <th className="py-3 px-4 font-semibold text-right">Ping</th>
                <th className="py-3 px-4 font-semibold text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDevices.map((dev) => (
                <tr
                  key={dev.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    dev.isThisDevice ? 'bg-cyan-950/15' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                        {getDeviceIcon(dev.deviceType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-100">
                            {dev.customName || dev.hostname}
                          </span>
                          {dev.isThisDevice && (
                            <span className="text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.2 rounded">
                              Bu Bilgisayar
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {dev.hostname}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-cyan-400 tabular-nums">
                    {dev.ip}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-300 text-[11px]">
                      {dev.mac}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {dev.vendor}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-slate-300 font-medium">
                      {dev.connectionType === 'ethernet'
                        ? 'Kablolu LAN'
                        : dev.connectionType === '5ghz'
                        ? 'Wi-Fi 5 GHz'
                        : 'Wi-Fi 2.4 GHz'}
                    </span>
                    {dev.signalDbm && (
                      <span className="text-[11px] text-slate-400 ml-1 font-mono">
                        ({dev.signalDbm} dBm)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {dev.isOnline && dev.currentTrafficBps > 0 ? (
                      <span className="text-emerald-400 font-medium">
                        {formatSpeed(dev.currentTrafficBps)}
                      </span>
                    ) : (
                      <span className="text-slate-400">Boşta</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-300 tabular-nums">
                    {formatBytes(dev.totalUsageBytes)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {dev.isOnline ? (
                      <span className="text-slate-300">{dev.latencyMs} ms</span>
                    ) : (
                      <span className="text-rose-400 text-[11px]">Çevrimdışı</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleEditOpen(dev)}
                      className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                      title="Cihaz İsmini ve Notlarını Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Device Modal */}
      {editingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              Cihaz Bilgisini Düzenle
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              IP: {editingDevice.ip} · MAC: {editingDevice.mac}
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Özel Cihaz Adı / Sahibi
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Örn: Ahmet'in Telefonu, Salon Akıllı TV"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notlar / Açıklama
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Örn: Sabit IP atandı, 4K video akışı için kullanılıyor"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingDevice(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                İptal
              </button>
              <button
                onClick={handleEditSave}
                className="px-3.5 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
