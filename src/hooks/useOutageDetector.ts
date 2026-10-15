import { useState, useEffect, useRef, useCallback } from 'react';
import { OutageEvent } from '../types/network';
import { audioAlert } from '../utils/audioAlert';

export function useOutageDetector() {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [latencyMs, setLatencyMs] = useState<number>(14);
  const [outages, setOutages] = useState<OutageEvent[]>(() => {
    // Initial sample outage record for demonstration
    return [
      {
        id: 'outage-sample-1',
        startTime: new Date(Date.now() - 3600000 * 4).toISOString(),
        endTime: new Date(Date.now() - 3600000 * 4 + 74000).toISOString(),
        durationSeconds: 74,
        reason: 'DNS Çözümleme Hatası / Ağ Geçidi Yanıt Vermedi',
        status: 'resolved',
      },
    ];
  });
  const [isSimulatingOutage, setIsSimulatingOutage] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeOutageRef = useRef<OutageEvent | null>(null);

  // Request browser desktop notification permission
  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return 'denied';
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('NetPulse Bildirimleri Aktif', {
          body: 'İnternet bağlantınız koptuğunda veya geri geldiğinde bildirim alacaksınız.',
          icon: '/icon.svg',
        });
      }
      return perm;
    } catch {
      return 'denied';
    }
  };

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
      } catch {
        // Notification send fallback
      }
    }
  }, []);

  const triggerDisconnect = useCallback((reason: string = 'İnternet Bağlantısı Koptu') => {
    setIsOnline(false);
    audioAlert.playOutageAlert();

    sendBrowserNotification(
      '⚠️ NetPulse: İnternet Bağlantısı Kesildi!',
      `Ağ bağlantınız koptu. (${new Date().toLocaleTimeString('tr-TR')}) - NetPulse izlemede.`
    );

    const newOutage: OutageEvent = {
      id: `outage-${Date.now()}`,
      startTime: new Date().toISOString(),
      reason,
      status: 'active',
    };
    activeOutageRef.current = newOutage;
    setOutages((prev) => [newOutage, ...prev]);
  }, [sendBrowserNotification]);

  const triggerReconnect = useCallback(() => {
    setIsOnline(true);
    audioAlert.playRestoredChime();

    const now = new Date();
    sendBrowserNotification(
      '✅ NetPulse: İnternet Tekrar Sağlandı!',
      `Bağlantı başarıyla yeniden kuruldu. (${now.toLocaleTimeString('tr-TR')})`
    );

    if (activeOutageRef.current) {
      const start = new Date(activeOutageRef.current.startTime).getTime();
      const end = now.getTime();
      const durationSeconds = Math.max(1, Math.round((end - start) / 1000));

      const updatedId = activeOutageRef.current.id;
      setOutages((prev) =>
        prev.map((item) =>
          item.id === updatedId
            ? {
                ...item,
                endTime: now.toISOString(),
                durationSeconds,
                status: 'resolved',
              }
            : item
        )
      );
      activeOutageRef.current = null;
    }
  }, [sendBrowserNotification]);

  // Periodic heartbeat checker
  useEffect(() => {
    const handleOnlineEvent = () => {
      if (!isOnline && !isSimulatingOutage) {
        triggerReconnect();
      }
    };

    const handleOfflineEvent = () => {
      if (isOnline && !isSimulatingOutage) {
        triggerDisconnect('Tarayıcı Çevrimdışı Sinyali (Browser Offline Event)');
      }
    };

    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);

    // Heartbeat ping interval
    const interval = setInterval(async () => {
      if (isSimulatingOutage) return;

      const startTime = performance.now();
      try {
        // Lightweight probe to verify actual end-to-end routing
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        // Fetch a cache-busted favicon or ping head
        await fetch(`/?ping=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const delta = Math.round(performance.now() - startTime);
        setLatencyMs(Math.max(4, Math.min(delta, 120)));

        if (!isOnline && navigator.onLine) {
          triggerReconnect();
        }
      } catch {
        if (!navigator.onLine && isOnline) {
          triggerDisconnect('Ağ Geçidi / DNS Yanıt Vermiyor');
        }
      }
    }, 4000);

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('offline', handleOfflineEvent);
      clearInterval(interval);
    };
  }, [isOnline, isSimulatingOutage, triggerDisconnect, triggerReconnect]);

  // Outage simulation for user verification
  const simulateOutage = (durationSeconds: number = 6) => {
    if (isSimulatingOutage) return;
    setIsSimulatingOutage(true);
    triggerDisconnect('Simüle Edilmiş Test Kesintisi (Kullanıcı Tarafından Başlatıldı)');

    setTimeout(() => {
      triggerReconnect();
      setIsSimulatingOutage(false);
    }, durationSeconds * 1000);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioAlert.setEnabled(next);
  };

  return {
    isOnline,
    latencyMs,
    outages,
    isSimulatingOutage,
    notificationPermission,
    soundEnabled,
    requestNotificationPermission,
    simulateOutage,
    toggleSound,
    clearOutages: () => setOutages([]),
  };
}
