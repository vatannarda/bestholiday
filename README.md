# BestHoliday Finans Paneli

Türkiye'nin önde gelen turizm acentası BestHoliday için geliştirilmiş dahili muhasebe ve finans yönetim paneli.

## 🚀 Özellikler

- **Rol Tabanlı Erişim**: Yönetici ve Personel rolleri
- **Finansal Dashboard**: KPI kartları, grafikler ve raporlar
- **AI Destekli İşlem Girişi**: Doğal dilde işlem ekleme
- **AI Finans Analist**: Sorularla finansal analiz
- **n8n Entegrasyonu**: Webhook tabanlı veri entegrasyonu
- **Koyu/Açık Tema**: Kullanıcı tercihine göre tema

## 🛠️ Teknolojiler

- **Framework**: Next.js 15 (App Router)
- **Dil**: TypeScript
- **Stil**: Tailwind CSS
- **UI**: shadcn/ui + Radix UI
- **İkonlar**: Lucide React
- **Grafikler**: Recharts
- **State**: Zustand
- **Deployment**: Docker & Docker Compose

## 📦 Kurulum

### Docker ile (Önerilen)

```bash
# Scripti çalıştırılabilir yap
chmod +x setup.sh

# Kurulumu başlat
./setup.sh
```

### Manuel Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu
npm run dev

# Prodüksiyon build
npm run build
npm start
```

## 🔐 Giriş Bilgileri

| Rol | Kullanıcı Adı | Şifre |
|-----|---------------|-------|
| Yönetici | admin | admin |
| Personel | user | user |

## 📁 Proje Yapısı

```
/app
├── (auth)/login          # Giriş sayfası
├── (protected)
│   ├── admin/dashboard   # Yönetici paneli
│   ├── admin/query       # AI Analist
│   ├── worker/dashboard  # Personel paneli
│   └── transactions      # İşlemler
/components
├── best-holiday-ui       # Marka bileşenleri
└── ui                    # shadcn/ui bileşenleri
/lib
├── actions               # Server actions (n8n)
└── store                 # Zustand state
```

## 🔗 n8n Webhook Yapılandırması

`.env` dosyasında aşağıdaki değişkenleri ayarlayın:

```env
N8N_TRANSACTION_WEBHOOK=https://n8n.globaltripmarket.com/webhook/transaction
N8N_QUERY_WEBHOOK=https://n8n.globaltripmarket.com/webhook/query
N8N_REPORT_WEBHOOK=https://n8n.globaltripmarket.com/webhook/report
```

## 📄 Lisans

Bu proje BestHoliday Turizm için özel olarak geliştirilmiştir.
