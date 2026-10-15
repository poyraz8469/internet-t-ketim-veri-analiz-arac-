import { useState, useEffect, useRef, useCallback } from 'react';
import {
  NetworkProfile,
  SpeedDataPoint,
  ThrottlingConfig,
  HistoryRecord,
} from '../types/network';
import { INITIAL_NETWORKS, INITIAL_HISTORY } from '../data/mockData';

export function useNetworkMonitor(isOnline: boolean) {
  const [networks, setNetworks] = useState<NetworkProfile[]>(() => {
    try {
      const saved = localStorage.getItem('netpulse_networks');
      return saved ? JSON.parse(saved) : INITIAL_NETWORKS;
    } catch {
      return INITIAL_NETWORKS;
    }
  });

  const [activeNetworkId, setActiveNetworkId] = useState<string>(() => {
    const active = INITIAL_NETWORKS.find((n) => n.isCurrent);
    return active ? active.id : INITIAL_NETWORKS[0].id;
  });

  const [throttling, setThrottling] = useState<ThrottlingConfig>({
    enabled: false,
    preset: 'unlimited',
    maxDownloadMbps: 15,
    maxUploadMbps: 5,
    appliedToAdapter: 'Tüm Ağ Bağdaştırıcıları',
  });

  const [liveDownloadSpeed, setLiveDownloadSpeed] = useState<number>(34.2 * 1024 * 1024); // 34.2 MB/s
  const [liveUploadSpeed, setLiveUploadSpeed] = useState<number>(8.6 * 1024 * 1024);     // 8.6 MB/s

  const [speedHistory, setSpeedHistory] = useState<SpeedDataPoint[]>(() => {
    const points: SpeedDataPoint[] = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const ts = now - i * 1000;
      const d = new Date(ts);
      points.push({
        timestamp: ts,
        timeLabel: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        downloadSpeedBps: Math.max(1024 * 1024, (28 + Math.sin(i / 3) * 12 + Math.random() * 8) * 1024 * 1024),
        uploadSpeedBps: Math.max(512 * 1024, (6 + Math.cos(i / 2) * 3 + Math.random() * 2) * 1024 * 1024),
      });
    }
    return points;
  });

  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('netpulse_history');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  const [isMonitoring, setIsMonitoring] = useState(true);

  // Sync networks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('netpulse_networks', JSON.stringify(networks));
    } catch {
      // Storage save fallback
    }
  }, [networks]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('netpulse_history', JSON.stringify(historyRecords));
    } catch {
      // Storage save fallback
    }
  }, [historyRecords]);

  const activeNetwork = networks.find((n) => n.id === activeNetworkId) || networks[0];

  // Ref to hold current state inside the 1-second interval
  const stateRef = useRef({
    isOnline,
    isMonitoring,
    throttling,
    activeNetworkId,
  });

  useEffect(() => {
    stateRef.current = {
      isOnline,
      isMonitoring,
      throttling,
      activeNetworkId,
    };
  }, [isOnline, isMonitoring, throttling, activeNetworkId]);

  // Main real-time sampling loop
  useEffect(() => {
    const interval = setInterval(() => {
      const { isOnline: online, isMonitoring: running, throttling: throttle, activeNetworkId: netId } = stateRef.current;
      const now = Date.now();
      const timeLabel = new Date(now).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      if (!online || !running) {
        setLiveDownloadSpeed(0);
        setLiveUploadSpeed(0);
        setSpeedHistory((prev) => [
          ...prev.slice(1),
          {
            timestamp: now,
            timeLabel,
            downloadSpeedBps: 0,
            uploadSpeedBps: 0,
          },
        ]);
        return;
      }

      // Base speed calculation depending on network type
      const currentNet = networks.find((n) => n.id === netId);
      let baseDownMBps = 32;
      let baseUpMBps = 9;

      if (currentNet?.type === 'ethernet') {
        baseDownMBps = 85;
        baseUpMBps = 48;
      } else if (currentNet?.type === 'hotspot') {
        baseDownMBps = 14;
        baseUpMBps = 3.5;
      }

      // Add realistic natural jitter
      const jitterFactor = Math.sin(now / 5000) * 0.3 + (Math.random() - 0.5) * 0.4;
      let nextDownBps = Math.max(500 * 1024, baseDownMBps * (1 + jitterFactor) * 1024 * 1024);
      let nextUpBps = Math.max(250 * 1024, baseUpMBps * (1 + jitterFactor * 0.7) * 1024 * 1024);

      // Apply Instantaneous Bandwidth Limiter (Throttler)
      if (throttle.enabled) {
        const maxDownBps = (throttle.maxDownloadMbps * 1000 * 1000) / 8;
        const maxUpBps = (throttle.maxUploadMbps * 1000 * 1000) / 8;

        if (throttle.maxDownloadMbps > 0 && nextDownBps > maxDownBps) {
          // Throttled close to the ceiling with small ±2% realistic cap variance
          nextDownBps = maxDownBps * (0.97 + Math.random() * 0.05);
        }
        if (throttle.maxUploadMbps > 0 && nextUpBps > maxUpBps) {
          nextUpBps = maxUpBps * (0.97 + Math.random() * 0.05);
        }
      }

      setLiveDownloadSpeed(nextDownBps);
      setLiveUploadSpeed(nextUpBps);

      // Accumulate traffic bytes on active network
      setNetworks((prev) =>
        prev.map((net) => {
          if (net.id === netId) {
            return {
              ...net,
              downloadBytes: net.downloadBytes + nextDownBps,
              uploadBytes: net.uploadBytes + nextUpBps,
            };
          }
          return net;
        })
      );

      // Push to 30-point rolling history
      setSpeedHistory((prev) => [
        ...prev.slice(1),
        {
          timestamp: now,
          timeLabel,
          downloadSpeedBps: nextDownBps,
          uploadSpeedBps: nextUpBps,
        },
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, [networks]);

  const switchNetwork = useCallback((networkId: string) => {
    setActiveNetworkId(networkId);
    setNetworks((prev) =>
      prev.map((n) => ({
        ...n,
        isCurrent: n.id === networkId,
        lastConnected: n.id === networkId ? 'Şu an aktif' : n.lastConnected,
      }))
    );
  }, []);

  const addNetwork = useCallback((newNet: Omit<NetworkProfile, 'id' | 'isCurrent' | 'downloadBytes' | 'uploadBytes'>) => {
    const id = `net-${Date.now()}`;
    const profile: NetworkProfile = {
      ...newNet,
      id,
      isCurrent: false,
      downloadBytes: 0,
      uploadBytes: 0,
    };
    setNetworks((prev) => [...prev, profile]);
  }, []);

  const updateNetworkQuota = useCallback((networkId: string, quotaGB: number) => {
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === networkId
          ? {
              ...n,
              monthlyQuotaBytes: quotaGB > 0 ? quotaGB * 1024 * 1024 * 1024 : 0,
            }
          : n
      )
    );
  }, []);

  const resetNetworkStats = useCallback((networkId: string) => {
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === networkId
          ? {
              ...n,
              downloadBytes: 0,
              uploadBytes: 0,
            }
          : n
      )
    );
  }, []);

  // Total across all networks
  const totalDownloadedAll = networks.reduce((acc, curr) => acc + curr.downloadBytes, 0);
  const totalUploadedAll = networks.reduce((acc, curr) => acc + curr.uploadBytes, 0);
  const totalCombinedAll = totalDownloadedAll + totalUploadedAll;

  return {
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
  };
}
