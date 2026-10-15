# NetPulse ⚡ — Ağ Trafik & Bant Genişliği Yöneticisi

> Bilgisayarınız için ağ bazlı upload ve download trafik takip aracı, anlık hız sınırlayıcı (traffic shaper), internet kesintisi sesli/masaüstü bildirim sistemi ve yerel ağ cihaz tarayıcısı.

---

## 📌 İçindekiler
- [Genel Bakış](#-genel-bakış)
- [Öne Çıkan Özellikler](#-öne-çıkan-özellikler)
  - [1. Ağ Bazında Upload & Download Takibi](#1-ağ-bazında-upload--download-takibi)
  - [2. Anlık Hız Sınırlandırma (Traffic Shaper)](#2-anlık-hız-sınırlandırma-traffic-shaper)
  - [3. Geçmiş Verileri Raporlama & Dışa Aktarma](#3-geçmiş-verileri-raporlama--dışa-aktarma)
  - [4. İnternet Kesintisi Bildirimi & Sesli Alarm](#4-internet-kesintisi-bildirimi--sesli-alarm)
  - [5. Yerel Ağdaki Cihazları Tarama (LAN Discovery)](#5-yerel-ağdaki-cihazları-tarama-lan-discovery)
  - [6. Masaüstü Kurulum & Arka Plan Ajanları](#6-masaüstü-kurulum--arka-plan-ajanları)
- [Teknoloji Yığını & Mimarisi](#-teknoloji-yığını--mimarisi)
- [Kurulum & Çalıştırma](#-kurulum--çalıştırma)
  - [Web / Geliştirme Ortamı](#web--geliştirme-ortamı)
  - [Masaüstü Uygulaması (PWA) Olarak Kurulum](#masaüstü-uygulaması-pwa-olarak-kurulum)
  - [Windows PowerShell Ajanı ile Donanım Takibi](#windows-powershell-ajanı-ile-donanım-takibi)
  - [Python Arka Plan Ajanı](#python-arka-plan-ajanı)
  - [Linux / macOS Bash Betiği](#linux--macos-bash-betiği)
- [Dizin Yapısı](#-dizin-yapısı)
- [Lisans](#-lisans)

---

## 🌐 Genel Bakış

**NetPulse**, bilgisayar kullanıcılarının ve ağ yöneticilerinin internet kotasını, farklı ağ profillerindeki (Ev Wi-Fi, Şirket Ağı, Telefon Hotspot, Kablolu Ethernet) veri tüketimini ve bağlantı stabilitesini tek bir modern panelden kontrol etmelerini sağlayan tam kapsamlı bir masaüstü ve web yazılımıdır.

İster tarayıcınızdan bağımsız bir **Masaüstü Uygulaması (PWA)** olarak yükleyebilir, isterseniz sisteminizin arka planında çalışan yerel **PowerShell**, **Python** veya **Bash** ajanlarıyla işletim sistemi çekirdek sayaçlarını doğrudan izleyebilirsiniz.

---

## 🚀 Öne Çıkan Özellikler

### 1. Ağ Bazında Upload & Download Takibi
- **Ağ Profili Segmentasyonu**: Ev Wi-Fi, Ofis Wi-Fi, Telefon Hotspot ve Kablolu Ethernet ağlarını ayrı ayrı tanımlar.
- **Detaylı Sayaçlar**: Her bir ağda ne kadar veri indirildiği (Download) ve ne kadar yüklendiği (Upload) tek tek hesaplanır.
- **Genel Toplam Tüketim**: Tüm ağların toplam kullanımını tek bir çatı altında birleştiren genel veri hacmi göstergesi.
- **Aylık Kota & Uyarı Sistemi**: Ağlara özel kota tanımlama (örn: Hotspot için 30 GB, Ev için 500 GB) ve %80 - %100 aşım uyarı göstergeleri.
- **Canlı Spektrum Grafiği**: Son 30 saniyenin anlık indirme (Cyan) ve yükleme (Zümrüt Yeşili) hızlarını milisaniyelik hassasiyetle çizen SVG grafiği.
- **Birim Seçimi**: Hızları dilediğiniz zaman `MB/s` (Bayt) veya `Mbps` (Bit) olarak görüntüleme.

### 2. Anlık Hız Sınırlandırma (Traffic Shaper)
İnternet bağlantınızı anında kısıtlayarak büyük indirmelerin oyunlardaki gecikmeyi (ping) artırmasını veya video toplantılarınızı kesmesini engelleyin.
- **Hazır Profiller**:
  - 🎮 **Oyun & Düşük Ping Modu**: İndirmeleri sınırlandırarak Bufferbloat gecikmesini önler, oyun içi ping sıçramalarını keser.
  - 📹 **Toplantı & Konferans Modu**: Zoom, Teams ve Google Meet ses/görüntü paketlerine öncelik tanır; arka plan yüklemelerini frenler.
  - 🔋 **Kota Tasarruf Modu**: Mobil hotspot veya kotalı paketlerde hızlı veri tüketimini engellemek için 6 Mbps tavanı koyar.
  - ♾️ **Sınırsız Mod**: Tam hat kapasitesi.
  - 🎛️ **Özel Hız Sürgüsü**: İndirme ve yükleme limitlerini 1 ile 200 Mbps arasında serbestçe ayarlayın.
- **İşletim Sistemi Çekirdek QoS Entegrasyonu**: Windows PowerShell (`New-NetQosPolicy`) ve Linux (`wondershaper`) için tek tıkla kopyalanabilir komut üretimi.

### 3. Geçmiş Verileri Raporlama & Dışa Aktarma
- **Filtreleme & Arama**: Zaman aralığına (Bugün, Son 7 Gün, Bu Ay, Tümü) ve ağ profiline göre geçmiş kayıtları sorgulama.
- **Özet Metrikler**: Filtrelenen toplam download, upload, toplam veri hacmi, tepe hız ve oturum süresi.
- **Anlık Oturumu Kaydetme**: Canlı seansı geçmiş günlüğüne tek tıkla arşivleme.
- **Çoklu Dışa Aktarma Formatı**:
  - **CSV İndir**: Excel ve tablolama yazılımlarıyla tam uyumlu format.
  - **JSON İndir**: Ham veri analizi ve yedekleme için yapılandırılmış JSON çıktısı.
  - **Yazdır / PDF Raporu**: Şirket içi veya kişisel arşiv için optimize edilmiş, resmi antetli yazdırılabilir rapor görünümü.

### 4. İnternet Kesintisi Bildirimi & Sesli Alarm
- **Canlı Ping & Sağlık Kontrolü**: Ağ geçidi ve DNS yanıt sürelerini (ms) periyodik olarak kontrol eden arka plan mekanizması.
- **Web Audio API Sentetik Ses Uyarısı**: İnternet bağlantısı koptuğunda hoparlörden çalan çift tonlu acil durum alarmı; bağlantı sağlandığında çalan onay akoru.
- **Masaüstü Bildirimleri (Notification API)**: Ekranın sağ alt köşesinde yerel Windows / macOS bildirim balonu çıkarma.
- **Kesinti Süresi Kaydı**: Kesintinin başladığı anı, bittiği anı ve toplam kesinti süresini (örn: *1 dk 14 sn*) saniyesi saniyesine kaydeden olay günlüğü.
- **Kesinti Testi Simülasyonu**: Kabloyu çekmeden ses ve bildirim sistemini denemeniz için 6 saniyelik simülasyon butonu.

### 5. Yerel Ağdaki Cihazları Tarama (LAN Discovery)
- **Subnet Keşfi**: Yerel alt ağdaki (`192.168.1.0/24`) tüm cihazları listeleyen ARP/ICMP tarayıcısı.
- **Cihaz Ayrıntıları**: IP adresi, MAC adresi, donanım üreticisi (Apple, Samsung, LG, Sony vb.), bağlantı frekansı (5 GHz, 2.4 GHz, Kablolu LAN), ping süresi ve anlık tahmini trafik.
- **Kişiselleştirme**: Cihazlara özel ad (örneğin: *"Ahmet'in Telefonu"*, *"Salon Akıllı TV"*) ve açıklama notları ekleme.

### 6. Masaüstü Kurulum & Arka Plan Ajanları
Uygulama arayüzündeki **"Programı Kur & İndir"** menüsünden dilediğiniz ortamı seçebilirsiniz:
- **PWA Masaüstü Kurulumu**: Chrome/Edge üzerinden sistem uygulaması olarak tek tıkla yükleme.
- **`NetPulse_Monitor.ps1`**: Windows 10/11 PowerShell ile çalışan, `Get-NetAdapterStatistics` komutuyla donanım sayaçlarını okuyan ve kesintide Windows bildirim balonu çıkartan betik.
- **`Install_NetPulse_Service.bat`**: PowerShell ajanını bilgisayar açılışında arka plan görevi olarak çalıştıran Windows toplu iş dosyası.
- **`netpulse_agent.py`**: Python `psutil` kütüphanesiyle donanım sayaçlarını ve internet durumunu terminalde canlı yazdıran betik.
- **`netpulse_monitor.sh`**: Linux ve macOS sistemler için terminal bildirimli (`notify-send`) arka plan izleyicisi.

---

## 🛠️ Teknoloji Yığını & Mimarisi

- **Frontend**: React 19, TypeScript, Vite 8
- **Stil & Tasarım**: Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans & JetBrains Mono tipografisi
- **PWA & Çevrimdışı**: `vite-plugin-pwa`, Web App Manifest, Service Worker
- **Ses & Bildirim**: Web Audio API (Sentetik Osilatörler), HTML5 Notification API
- **Veri Saklama**: LocalStorage (Ağ profilleri, özel cihaz adları ve geçmiş oturumlar tarayıcıda kalıcı olarak saklanır)
- **Harici Ajanlar**: Windows PowerShell 5.1/7+, Python 3 (psutil), Bash

---

## 💻 Kurulum & Çalıştırma

### Web / Geliştirme Ortamı

Projeyi bilgisayarınızda yerel olarak çalıştırmak için:

1. **Depoyu klonlayın**:
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
   cd REPO_ADINIZ
   ```

2. **Bağımlılıkları yükleyin**:
   ```bash
   npm install
   ```

3. **Geliştirme sunucusunu başlatın**:
   ```bash
   npm run dev
   ```
   Tarayıcınızda `http://localhost:3000` adresini açın.

4. **Üretim için derleme**:
   ```bash
   npm run build
   ```

---

### Masaüstü Uygulaması (PWA) Olarak Kurulum

1. NetPulse web arayüzünü Google Chrome, Microsoft Edge veya Brave ile açın.
2. Sağ üst köşedeki **"Programı Kur & İndir"** butonuna tıklayın.
3. Açılan pencerede **"Bilgisayara Yükle"** seçeneğini seçin (veya tarayıcınızın adres çubuğundaki **Yükle ⊕** simgesine tıklayın).
4. Uygulama artık Windows Başlat menüsünde, görev çubuğunda ve masaüstünüzde bağımsız bir yerel pencere olarak çalışacaktır.

---

### Windows PowerShell Ajanı ile Donanım Takibi

Windows işletim sisteminizin gerçek ağ bağdaştırıcı sayaçlarını okumak için:

1. NetPulse arayüzündeki indirme merkezinden `NetPulse_Monitor.ps1` dosyasını indirin.
2. Dosyaya sağ tıklayıp **"PowerShell ile Çalıştır"** seçeneğine tıklayın.
   *(Eğer yetki uyarısı alırsanız PowerShell'i yönetici olarak açıp `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` komutunu verebilirsiniz).*
3. Ajan, ağ trafiğini anlık olarak terminalde gösterecek ve bağlantı koptuğunda Windows bildirim balonu ile sesli ikaz verecektir.
4. Bilgisayar her açıldığında otomatik başlaması için `Install_NetPulse_Service.bat` dosyasını yönetici olarak çalıştırabilirsiniz.

---

### Python Arka Plan Ajanı

Linux, macOS veya Windows üzerinde Python ile çalıştırmak için:

1. `psutil` kütüphanesini yükleyin:
   ```bash
   pip install psutil
   ```
2. NetPulse arayüzünden `netpulse_agent.py` dosyasını indirin.
3. Betiği çalıştırın:
   ```bash
   python netpulse_agent.py
   ```

---

### Linux / macOS Bash Betiği

1. `netpulse_monitor.sh` dosyasını indirin.
2. Çalıştırma izni verip başlatın:
   ```bash
   chmod +x netpulse_monitor.sh
   ./netpulse_monitor.sh
   ```

---

## 📂 Dizin Yapısı

```text
├── public/
│   ├── icon.svg                     # NetPulse vektörel marka ikonu
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.tsx               # Üst gezinme çubuğu ve PWA yükleme butonu
│   │   ├── LiveDashboard.tsx        # Canlı hız göstergeleri & 30s SVG grafik
│   │   ├── NetworkSelector.tsx      # Ağ profilleri, kota ayarları ve sayaçlar
│   │   ├── BandwidthLimiter.tsx     # Hız sınırlandırma, profiller & QoS komutları
│   │   ├── HistoricalReports.tsx    # Geçmiş veriler, filtreleme & CSV/JSON dışa aktarma
│   │   ├── OutageNotifier.tsx       # Kesinti dedektörü, sesli alarm & olay günlüğü
│   │   ├── LanDeviceScanner.tsx     # Yerel ağ cihaz tarayıcısı ve düzenleyici
│   │   ├── DesktopInstallerModal.tsx# Masaüstü kurulum & betik indirme merkezi
│   │   └── PrintReportModal.tsx     # Yazdırılabilir resmi PDF rapor modalı
│   ├── data/
│   │   └── mockData.ts              # Başlangıç ağları, geçmiş kayıtları ve LAN cihazları
│   ├── hooks/
│   │   ├── useNetworkMonitor.ts     # Ağ sayaçları ve bant genişliği simülasyon motoru
│   │   ├── useOutageDetector.ts     # Ping denetleyici, ses ve masaüstü bildirimleri
│   │   └── usePWAInstall.ts         # PWA kurulum olay yakalayıcısı
│   ├── types/
│   │   └── network.ts               # TypeScript arayüz ve tip tanımları
│   ├── utils/
│   │   ├── audioAlert.ts            # Web Audio API sentetik alarm üreticisi
│   │   ├── desktopScripts.ts        # PowerShell, Batch, Python ve Bash betik üreticileri
│   │   └── formatters.ts            # Bayt, hız, süre ve tarih biçimlendiricileri
│   ├── App.tsx                      # Ana uygulama bileşeni
│   ├── index.css                    # Tailwind CSS ve global tipografi
│   └── main.tsx                     # React kök başlatıcı
├── index.html                       # HTML5 giriş sayfası ve SEO meta etiketleri
├── metadata.json                    # Uygulama metadata ve yetki tanımları
├── package.json                     # NPM paketleri ve betikler
├── tsconfig.json                    # TypeScript yapılandırması
└── vite.config.ts                   # Vite & VitePWA servis işleyici konfigürasyonu
```

---

## 📄 Lisans

Bu proje [Apache-2.0](LICENSE) lisansı altında sunulmaktadır.
Dilediğiniz gibi geliştirebilir, özelleştirebilir ve kullanabilirsiniz.
