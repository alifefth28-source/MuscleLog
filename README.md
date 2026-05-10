# XXV Fitness Logbook 🏋️

**Aplikasi Web Logbook Latihan Beban dengan Stagnation Detector**

Dibangun dengan AstroJS (Islands Architecture) + Firebase + Vercel. Dioptimalkan untuk penggunaan mobile-first di dalam sasana kebugaran.

## Fitur Utama

- **Pencatatan Set Real-time** — Input beban (kg), repetisi, RPE, dan RIR per set
- **Kalkulasi Volume Load Otomatis** — Beban × Repetisi per set
- **Stagnation Detector** — Peringatan otomatis jika Volume Load stagnan 3 sesi berturut-turut
- **Estimasi 1RM** — Formula Brzycki untuk prediksi kekuatan maksimal
- **Analitik Visual** — Grafik Volume Load per gerakan menggunakan Recharts
- **Rekomendasi Deload** — Saran pemulihan saat plateau terdeteksi

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | AstroJS 4.x (SSR + Islands) |
| Frontend | React 18 (interactive islands) |
| Styling | Tailwind CSS 3.4 |
| Database | Firebase Firestore |
| Auth | Firebase Auth + JWT |
| Hosting | Vercel (serverless) |
| Charts | Recharts |

## Setup

```bash
# Clone repository
git clone https://github.com/username/xxv-fitness-logbook.git
cd xxv-fitness-logbook

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan Firebase credentials kamu

# Jalankan development server
npm run dev
```

## Environment Variables

Buat file `.env` dan isi:

```env
PUBLIC_FIREBASE_API_KEY="..."
PUBLIC_FIREBASE_AUTH_DOMAIN="..."
PUBLIC_FIREBASE_PROJECT_ID="..."
PUBLIC_FIREBASE_STORAGE_BUCKET="..."
PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
PUBLIC_FIREBASE_APP_ID="..."

FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."

JWT_SECRET="..."
```

## Deploy ke Vercel

1. Push ke GitHub
2. Import project di Vercel
3. Tambahkan environment variables di Vercel Dashboard
4. Deploy otomatis

## Struktur Database (Firestore)

```
users/
  {userId}/
    - nama, email, createdAt

exercises/
  {exerciseId}/
    - nama, targetOtot, kategori, isDefault

workout_sessions/
  {sessionId}/
    - userId, tanggal, namaSesi, durasiMenit, isClosed

workout_logs/
  {logId}/
    - sessionId, exerciseId, userId
    - setKe, bebanKg, repetisi
    - skorRpe, skorRir
    - volumeLoad (auto-calculated)
    - estimasi1rm (auto-calculated)
```

## Algoritma Stagnation Detector

```
1. Ambil 3 sesi terakhir untuk gerakan X
2. Hitung total Volume Load per sesi
3. Bandingkan perubahan antar sesi (threshold: 2%)
4. Jika semua perubahan < 2% → PLATEAU (warning)
5. Jika VL menurun berturut-turut → REGRESI (alert)
6. Tampilkan rekomendasi: deload, ubah beban, atau ganti variasi
```

## Lisensi

Proyek ini dibuat sebagai bagian dari penulisan ilmiah / tugas akhir.
