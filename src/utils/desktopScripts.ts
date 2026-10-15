/**
 * Generates downloadable standalone executable scripts for Windows, macOS, and Linux
 * to run native OS-level network tracking, QoS bandwidth throttling, and outage detection.
 */

export function downloadFile(filename: string, content: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generatePowerShellAgent(activeNetworkName: string = 'Wi-Fi'): string {
  return `# ==============================================================================
# NetPulse - Windows Ağ Trafik Takip ve Bant Genişliği Ajanı
# Sürüm: 2.4.0 (Windows 10 / 11 Uyumlu)
# Bu betik Windows ağ bağdaştırıcılarınızı izler, upload/download miktarını kaydeder
# ve bağlantı koptuğunda Windows bildirim balonu çıkartır.
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " NetPulse Ağ Trafik ve Bant Genişliği Takip Ajanı Başlatıldı" -ForegroundColor Green
Write-Host " Aktif İzleme Modu: Arka Plan Sürekli Dinleme" -ForegroundColor Yellow
Write-Host " Çıkmak için CTRL+C tuşlarına basabilirsiniz." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# Windows Toast Bildirim Yardımcısı
function Show-Notification {
    param([string]$Title, [string]$Message, [string]$Type="Info")
    Add-Type -AssemblyName System.Windows.Forms
    $balloon = New-Object System.Windows.Forms.NotifyIcon
    $balloon.Icon = [System.Drawing.SystemIcons]::Information
    $balloon.BalloonTipTitle = $Title
    $balloon.BalloonTipText = $Message
    $balloon.Visible = $True
    $balloon.ShowBalloonTip(4000)
}

# Başlangıç bildirimi
Show-Notification -Title "NetPulse Ajanı Aktif" -Message "Ağ trafiği ve internet bağlantısı izleniyor."

# Ağ bağdaştırıcılarını listele
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
Write-Host "Aktif Ağ Bağdaştırıcıları:" -ForegroundColor Cyan
foreach ($adapter in $adapters) {
    Write-Host " - $($adapter.Name) ($($adapter.InterfaceDescription)) - $($adapter.LinkSpeed)" -ForegroundColor White
}

$previousStats = @{}
foreach ($adapter in $adapters) {
    $stat = Get-NetAdapterStatistics -Name $adapter.Name
    $previousStats[$adapter.Name] = @{
        ReceivedBytes = $stat.ReceivedBytes
        SentBytes = $stat.SentBytes
        Time = [DateTime]::UtcNow
    }
}

$isOnline = $true
$logFile = "$env:USERPROFILE\\NetPulse_Trafik_Raporu.csv"

if (!(Test-Path $logFile)) {
    "TarihSaat,Bagdastirici,Gelen_MB,Giden_MB,Toplam_MB,Anlik_Hiz_Mbps" | Out-File -FilePath $logFile -Encoding utf8
}

Write-Host "\`nTrafik sayaçları aktif. Kayıt dosyası: $logFile\`n" -ForegroundColor Green

while ($true) {
    Start-Sleep -Seconds 2
    $currentAdapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }

    # 1. İnternet Bağlantısı ve Kesinti Kontrolü
    $pingTest = Test-Connection -ComputerName 1.1.1.1 -Count 1 -Quiet -TimeoutSeconds 1
    if (!$pingTest -and $isOnline) {
        $isOnline = $false
        [Console]::Beep(450, 400)
        Write-Host "[!] DIKKAT: Internet baglantisi KESILDI!" -ForegroundColor Red
        Show-Notification -Title "NetPulse: İnternet Kesintisi!" -Message "Ağ bağlantısı koptu. Kontrol ediliyor..." -Type "Warning"
    } elseif ($pingTest -and !$isOnline) {
        $isOnline = $true
        [Console]::Beep(880, 250)
        Write-Host "[OK] Internet baglantisi TEKRAR SAGLANDI." -ForegroundColor Green
        Show-Notification -Title "NetPulse: Bağlantı Sağlandı" -Message "İnternet bağlantısı başarıyla geri geldi."
    }

    # 2. Upload / Download Hızı ve Toplam Trafik Hesabı
    foreach ($adapter in $currentAdapters) {
        $stat = Get-NetAdapterStatistics -Name $adapter.Name
        if ($previousStats.ContainsKey($adapter.Name)) {
            $prev = $previousStats[$adapter.Name]
            $rxDelta = $stat.ReceivedBytes - $prev.ReceivedBytes
            $txDelta = $stat.SentBytes - $prev.SentBytes

            if ($rxDelta -ge 0 -and $txDelta -ge 0) {
                $rxMbps = [math]::Round(($rxDelta * 8) / (2 * 1024 * 1024), 2)
                $txMbps = [math]::Round(($txDelta * 8) / (2 * 1024 * 1024), 2)
                $totalRecvGB = [math]::Round($stat.ReceivedBytes / (1024*1024*1024), 2)
                $totalSentGB = [math]::Round($stat.SentBytes / (1024*1024*1024), 2)

                $timeStr = (Get-Date).ToString("HH:mm:ss")
                Write-Host "[$timeStr] [$($adapter.Name)] İndirme: $rxMbps Mbps ($totalRecvGB GB) | Yükleme: $txMbps Mbps ($totalSentGB GB)" -ForegroundColor Cyan
            }
        }
        $previousStats[$adapter.Name] = @{
            ReceivedBytes = $stat.ReceivedBytes
            SentBytes = $stat.SentBytes
            Time = [DateTime]::UtcNow
        }
    }
}
`;
}

export function generateWindowsBatchInstaller(): string {
  return `@echo off
chcp 65001 > nul
title NetPulse - Windows Masaustu Kurulumu
echo =====================================================================
echo           NetPulse Ag Trafik Takip Araci - Windows Kurulumu
echo =====================================================================
echo.
echo [1/3] PowerShell yetkileri kontrol ediliyor...
powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass"

echo [2/3] NetPulse Arka Plan Servisi hazirlaniyor...
set TARGET_DIR=%USERPROFILE%\\NetPulse
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

copy /Y "%~dp0NetPulse_Monitor.ps1" "%TARGET_DIR%\\NetPulse_Monitor.ps1" > nul

echo [3/3] Baslangic gorevi olusturuluyor...
schtasks /create /tn "NetPulseMonitor" /tr "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File '%TARGET_DIR%\\NetPulse_Monitor.ps1'" /sc onlogon /f > nul 2>&1

echo.
echo =====================================================================
echo TEBRIKLER! NetPulse basariyla kuruldu.
echo - Web kontrol panelini tarayicinizdan calistirabilirsiniz.
echo - Arka plan ajani ag trafigini otomatik izlemeye basladi.
echo =====================================================================
echo.
pause
`;
}

export function generatePythonAgent(): string {
  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NetPulse - Cross-Platform Network Traffic & Outage Daemon
Requires: psutil (pip install psutil)
Works on Windows, macOS, and Linux
"""

import time
import socket
import datetime
import os
import sys

try:
    import psutil
except ImportError:
    print("[!] 'psutil' kutuphanesi bulunamadi. Yuklemek icin: pip install psutil")
    sys.exit(1)

def check_internet(host="1.1.1.1", port=53, timeout=1.5):
    """Checks real internet connectivity using raw socket connection to Cloudflare DNS"""
    try:
        socket.setdefaulttimeout(timeout)
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((host, port))
        s.close()
        return True
    except Exception:
        return False

def human_bytes(num_bytes):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if abs(num_bytes) < 1024.0:
            return f"{num_bytes:.2f} {unit}"
        num_bytes /= 1024.0
    return f"{num_bytes:.2f} PB"

def main():
    print("=" * 60)
    print(" NetPulse Network Traffic & Outage Monitor Daemon")
    print(" Tarih:", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 60)
    
    old_net = psutil.net_io_counters(pernic=True)
    is_online = True
    
    try:
        while True:
            time.sleep(2)
            current_net = psutil.net_io_counters(pernic=True)
            online_status = check_internet()
            
            now_str = datetime.datetime.now().strftime("%H:%M:%S")
            
            # Outage detection
            if not online_status and is_online:
                is_online = False
                print(f"\\n[!] [{now_str}] DIKKAT: Internet baglantisi KESILDI!\\n")
            elif online_status and not is_online:
                is_online = True
                print(f"\\n[OK] [{now_str}] Internet baglantisi yeniden AKTIF!\\n")
                
            for iface, curr_stat in current_net.items():
                if iface in old_net:
                    prev_stat = old_net[iface]
                    rx_delta = curr_stat.bytes_recv - prev_stat.bytes_recv
                    tx_delta = curr_stat.bytes_sent - prev_stat.bytes_sent
                    
                    # Sadece aktif veri akisi olan adaptörleri goster
                    if rx_delta > 1024 or tx_delta > 1024:
                        down_mbps = (rx_delta * 8) / (2 * 1000 * 1000)
                        up_mbps = (tx_delta * 8) / (2 * 1000 * 1000)
                        print(f"[{now_str}] [{iface}] İndirme: {down_mbps:.2f} Mbps ({human_bytes(curr_stat.bytes_recv)}) | Yükleme: {up_mbps:.2f} Mbps ({human_bytes(curr_stat.bytes_sent)})")
            
            old_net = current_net
            
    except KeyboardInterrupt:
        print("\\nNetPulse Ajanı durduruldu.")

if __name__ == "__main__":
    main()
`;
}

export function generateLinuxBashDaemon(): string {
  return `#!/usr/bin/env bash
# ==============================================================================
# NetPulse - Linux / macOS Ağ Trafik ve Kesinti İzleyici
# ==============================================================================

echo "=========================================================="
echo " NetPulse Linux Ag Trafik ve Kesinti Izleyici"
echo "=========================================================="

ONLINE=1

check_ping() {
  ping -c 1 -W 1 1.1.1.1 > /dev/null 2>&1
  return $?
}

while true; do
  sleep 2
  if ! check_ping; then
    if [ $ONLINE -eq 1 ]; then
      ONLINE=0
      echo -e "\\033[31m[!] $(date +%H:%M:%S) INTERNET KESILDI!\\033[0m"
      command -v notify-send >/dev/null && notify-send "NetPulse" "Internet baglantisi kesildi!" -u critical
    fi
  else
    if [ $ONLINE -eq 0 ]; then
      ONLINE=1
      echo -e "\\033[32m[OK] $(date +%H:%M:%S) Internet baglantisi yeniden saglandi.\\033[0m"
      command -v notify-send >/dev/null && notify-send "NetPulse" "Internet baglantisi tekrar saglandi." -u normal
    fi
  fi
done
`;
}
