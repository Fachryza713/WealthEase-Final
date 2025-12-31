# 🤖 Panduan Install & Menjalankan Chatbot WealthEase

## ✅ Yang Sudah Saya Perbaiki

1. **✓ chatbot.js** - Bug diperbaiki, integrasi OpenAI siap
2. **✓ chatbot.css** - Styling chatbot widget
3. **✓ .env** - API Key OpenAI sudah terpasang
4. **✓ ai-server.js** - Backend server untuk OpenAI

## 📦 Langkah 1: Install Node.js

### Download & Install Node.js:
1. Buka: https://nodejs.org/
2. Download **LTS Version** (Long Term Support) - Recommended
3. Jalankan installer (.msi untuk Windows)
4. Ikuti wizard instalasi dengan setting default
5. **PENTING**: Centang "Add to PATH" saat instalasi
6. Restart VS Code setelah instalasi selesai

### Verifikasi Instalasi:
Setelah install, buka Terminal baru di VS Code dan ketik:
```powershell
node --version
npm --version
```

Jika berhasil, akan muncul versi Node.js dan npm.

---

## 🚀 Langkah 2: Install Dependencies

Setelah Node.js terinstall, jalankan command ini di Terminal:

```powershell
cd c:\Users\Eja\Downloads\WealthEase-main\WealthEase-main\WealthEase-main\backend
npm install
```

Tunggu sampai semua package terinstall (OpenAI SDK, Express, dll).

---

## 🔥 Langkah 3: Jalankan AI Server

Jalankan backend AI server:

```powershell
cd c:\Users\Eja\Downloads\WealthEase-main\WealthEase-main\WealthEase-main\backend
node ai-server.js
```

**Output yang diharapkan:**
```
WealthEase AI API server running on port 3001
OpenAI API Key configured: true
```

✅ Jika muncul seperti ini, artinya server sudah jalan dan OpenAI API key sudah dikonfigurasi!

---

## 🌐 Langkah 4: Buka Frontend Dashboard

1. **Buka file dashboard.html** dengan Live Server atau browser:
   - Klik kanan pada `frontend/dashboard.html`
   - Pilih "Open with Live Server" (jika ada ekstensi)
   - Atau buka langsung di browser

2. **Alternatif**: Jalankan server backend yang melayani frontend:
```powershell
cd c:\Users\Eja\Downloads\WealthEase-main\WealthEase-main\WealthEase-main\backend
node server.js
```

Lalu buka browser ke: `http://localhost:3000/dashboard`

---

## 💬 Langkah 5: Gunakan Chatbot!

### Cara Menggunakan:
1. **Klik ikon chatbot** di pojok kanan bawah (ikon robot)
2. **Ketik transaksi** dalam bahasa Inggris dengan Dollar ($), contoh:
   - "Bought coffee $5"
   - "Paid internet bill $75"
   - "Received salary $3,500"
   - "Grocery shopping $125.50"
   - "Lunch at restaurant $45"
   - "Bonus from work $1,000"

### Apa yang Terjadi:
- ✅ AI (OpenAI) akan mengekstrak data transaksi
- ✅ Otomatis mendeteksi tipe (pemasukan/pengeluaran)
- ✅ Otomatis mendeteksi jumlah
- ✅ Otomatis menambahkan ke dashboard
- ✅ Update statistik secara real-time

---

## 🧪 Langkah 6: Test OpenAI Connection

Untuk memastikan OpenAI bekerja, test endpoint ini di browser atau Postman:

```
GET http://localhost:3001/api/ai/health
```

**Response yang diharapkan:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-29T...",
  "openaiConfigured": true
}
```

### Test Chatbot Endpoint:
```
POST http://localhost:3001/api/ai/chatbot
Content-Type: application/json

{
  "message": "Bought coffee $5"
}
```

**Response yang diharapkan:**
```json
{
  "success": true,
  "data": {
    "tipe": "pengeluaran",
    "deskripsi": "Bought coffee",
    "jumlah": 5,
    "tanggal": "2025-10-29"
  },
  "reply": "✅ Expense recorded: \"Bought coffee\" for $5.00 on 2025-10-29."
}
```

---

## ⚠️ Troubleshooting

### 1. "Server AI tidak dapat dihubungi"
**Solusi:**
- Pastikan ai-server.js berjalan di port 3001
- Cek console apakah ada error
- Restart server jika perlu

### 2. "OpenAI API key not configured"
**Solusi:**
- Cek file `.env` di folder backend
- Pastikan `OPENAI_API_KEY` terisi dengan key yang valid
- Restart server setelah mengubah .env

### 3. "Quota OpenAI habis"
**Solusi:**
- Cek quota di https://platform.openai.com/usage
- Top up credit jika habis
- Atau gunakan API key baru

### 4. Chatbot tidak muncul
**Solusi:**
- Pastikan file `chatbot.css` dan `chatbot.js` ter-load
- Buka Console browser (F12) dan cek error
- Pastikan dashboard.html sudah include chatbot.js

---

## 🎯 Fitur Chatbot

### ✨ Apa yang Bisa Dilakukan:
- ✅ Input transaksi dengan bahasa natural dalam Bahasa Inggris
- ✅ Otomatis deteksi tipe transaksi (income/expense)
- ✅ Ekstraksi jumlah dari berbagai format Dollar ($5, 5, 5 dollars, $1,234.56)
- ✅ Auto-kategori berdasarkan deskripsi
- ✅ Simpan ke localStorage dan sinkronisasi dengan dashboard
- ✅ Update statistik real-time
- ✅ Chat history tersimpan

### 📝 Contoh Input yang Didukung:
```
✅ "Bought coffee $5"
✅ "Paid electricity bill $125.50"
✅ "Received salary $3,500"
✅ "Grocery shopping $150"
✅ "Lunch at restaurant $45.75"
✅ "Bonus from company $2,000"
✅ "Gas station 60 dollars"
✅ "Netflix subscription $15.99"
```

---

## 🔒 Keamanan

- ✅ API Key disimpan di `.env` (tidak di-commit ke Git)
- ✅ Rate limiting untuk mencegah spam
- ✅ CORS protection
- ✅ Input validation
- ✅ Error handling yang aman

---

## 📊 Monitoring

### Cek Log Server:
Lihat terminal tempat ai-server.js berjalan untuk log:
- Request yang masuk
- Response OpenAI
- Error yang terjadi

### Cek Browser Console:
Buka Developer Tools (F12) untuk melihat:
- Chatbot initialization
- API requests
- Transaction updates
- Errors (jika ada)

---

## 🎉 Selesai!

Chatbot AI WealthEase siap digunakan dengan fitur:
- 🤖 Integrasi OpenAI GPT
- 💬 Natural Language Processing
- 💰 Auto-detect transaksi
- 📊 Real-time dashboard update
- 💾 Data persistence

**Selamat mencoba! 🚀**

---

## 📞 Butuh Bantuan?

Jika ada masalah:
1. Cek log di terminal server
2. Cek console browser (F12)
3. Pastikan OpenAI API key valid
4. Pastikan semua server berjalan

**Happy chatting with your AI finance assistant! 💪**
