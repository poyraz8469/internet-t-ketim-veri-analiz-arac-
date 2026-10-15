/**
 * Utility functions for formatting network traffic, speeds, and timestamps
 */

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

export function formatSpeed(bytesPerSecond: number): string {
  const bitsPerSecond = bytesPerSecond * 8;
  if (bitsPerSecond < 1000) {
    return `${bitsPerSecond.toFixed(0)} bps`;
  }
  if (bitsPerSecond < 1000 * 1000) {
    return `${(bitsPerSecond / 1000).toFixed(1)} Kbps`;
  }
  if (bitsPerSecond < 1000 * 1000 * 1000) {
    return `${(bitsPerSecond / (1000 * 1000)).toFixed(1)} Mbps`;
  }
  return `${(bitsPerSecond / (1000 * 1000 * 1000)).toFixed(2)} Gbps`;
}

export function formatTransferRate(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(0)} B/s`;
  }
  if (bytesPerSecond < 1024 * 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  }
  if (bytesPerSecond < 1024 * 1024 * 1024) {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
  }
  return `${(bytesPerSecond / (1024 * 1024 * 1024)).toFixed(2)} GB/s`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sn`;
  }
  const mins = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  if (mins < 60) {
    return `${mins} dk ${remainingSecs > 0 ? remainingSecs + ' sn' : ''}`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours} sa ${remainingMins > 0 ? remainingMins + ' dk' : ''}`;
}

export function formatDateTurkish(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTimeTurkish(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateString;
  }
}
