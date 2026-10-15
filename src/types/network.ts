export type ConnectionType = 'wifi' | 'ethernet' | 'hotspot' | 'cellular';

export interface NetworkProfile {
  id: string;
  name: string;
  ssid?: string;
  type: ConnectionType;
  interfaceName: string; // e.g. "Wi-Fi (Intel Wi-Fi 6 AX200)", "Ethernet (Realtek PCIe GbE)"
  isCurrent: boolean;
  downloadBytes: number; // in bytes
  uploadBytes: number;   // in bytes
  monthlyQuotaBytes?: number; // 0 or undefined = unlimited
  color: string;
  lastConnected: string;
  security?: string; // WPA3-Personal, WPA2-Enterprise, 802.1X
}

export interface SpeedDataPoint {
  timestamp: number; // ms
  timeLabel: string; // e.g. "14:20:05"
  downloadSpeedBps: number; // bytes per second
  uploadSpeedBps: number;   // bytes per second
}

export type ThrottlingPreset = 'unlimited' | 'gaming' | 'meeting' | 'saving' | 'custom';

export interface ThrottlingConfig {
  enabled: boolean;
  preset: ThrottlingPreset;
  maxDownloadMbps: number; // 0 = unlimited
  maxUploadMbps: number;   // 0 = unlimited
  appliedToAdapter: string;
}

export interface HistoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  networkId: string;
  networkName: string;
  connectionType: ConnectionType;
  downloadBytes: number;
  uploadBytes: number;
  durationSeconds: number;
  peakDownloadBps: number;
  peakUploadBps: number;
}

export interface OutageEvent {
  id: string;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  reason: string;
  status: 'active' | 'resolved';
}

export interface LanDevice {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  customName?: string;
  deviceType: 'router' | 'computer' | 'phone' | 'tablet' | 'tv' | 'console' | 'iot' | 'unknown';
  vendor: string;
  connectionType: '5ghz' | '2.4ghz' | 'ethernet';
  signalDbm?: number;
  currentTrafficBps: number;
  totalUsageBytes: number;
  isOnline: boolean;
  latencyMs: number;
  isThisDevice?: boolean;
  notes?: string;
}
