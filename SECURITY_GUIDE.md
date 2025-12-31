# 🔒 WealthEase Security Guide

## ⚠️ FILE YANG TIDAK AMAN UNTUK DIPUBLISH

### 1. **Environment Variables (.env)**
```
.env
.env.local
.env.production
.env.staging
```
**Mengapa berbahaya:** Berisi API keys, database credentials, dan secrets

### 2. **Data Transaksi User**
```
backend/data/transactions.json
backend/data/users.json
```
**Mengapa berbahaya:** Berisi informasi finansial pribadi user

### 3. **API Keys & Secrets**
```
config/secrets.js
config/keys.js
secrets.json
api-keys.json
```
**Mengapa berbahaya:** Credentials untuk layanan eksternal

### 4. **Database Files**
```
*.db
*.sqlite
*.sqlite3
database/
```
**Mengapa berbahaya:** Data user tersimpan di database

## ✅ FILE YANG AMAN UNTUK DIPUBLISH

### 1. **Template Files**
```
env.example
transactions.example.json
```
**Mengapa aman:** Hanya template tanpa data sensitif

### 2. **Source Code**
```
*.js
*.html
*.css
*.json (kecuali data sensitif)
```
**Mengapa aman:** Kode aplikasi tidak mengandung secrets

### 3. **Documentation**
```
README.md
SETUP_GUIDE.md
HOSTING_GUIDE.md
```
**Mengapa aman:** Dokumentasi publik

## 🛡️ CARA MELINDUNGI FILE SENSITIF

### 1. **Gunakan .gitignore**
File `.gitignore` sudah dibuat untuk melindungi file sensitif.

### 2. **Environment Variables**
```bash
# Jangan commit file .env
echo ".env" >> .gitignore

# Gunakan env.example sebagai template
cp env.example .env
# Edit .env dengan nilai sebenarnya
```

### 3. **Data Sensitif**
```bash
# Jangan commit data user
echo "backend/data/transactions.json" >> .gitignore
echo "backend/data/users.json" >> .gitignore

# Gunakan file example
cp transactions.json transactions.example.json
```

## 🚀 DEPLOYMENT AMAN

### 1. **Environment Variables di Production**
```bash
# Set di hosting platform (Vercel, Heroku, dll)
OPENAI_API_KEY=sk-your-actual-key
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-secret
```

### 2. **Database Production**
- Gunakan database cloud (MongoDB Atlas, PostgreSQL, dll)
- Jangan gunakan file database lokal di production

### 3. **HTTPS Only**
- Pastikan aplikasi menggunakan HTTPS di production
- Set secure cookies

## 🔍 CHECKLIST SEBELUM PUSH KE GITHUB

- [ ] File `.env` tidak ada di repository
- [ ] Data transaksi user tidak ada di repository
- [ ] API keys tidak hardcode di source code
- [ ] Database credentials tidak ada di repository
- [ ] File `.gitignore` sudah dikonfigurasi
- [ ] File example sudah dibuat untuk template

## 📋 COMMANDS UNTUK SETUP AMAN

```bash
# 1. Buat file .env dari template
cp backend/env.example backend/.env

# 2. Edit file .env dengan nilai sebenarnya
# (Jangan commit file .env)

# 3. Buat data example
cp backend/data/transactions.json backend/data/transactions.example.json

# 4. Hapus data sensitif dari repository
git rm --cached backend/data/transactions.json
git rm --cached backend/.env

# 5. Commit perubahan
git add .
git commit -m "Add security configuration and example files"

# 6. Push ke GitHub
git push origin main
```

## ⚡ QUICK SECURITY CHECK

```bash
# Cek apakah ada file sensitif yang akan di-commit
git status

# Cek isi file yang akan di-commit
git diff --cached

# Pastikan .gitignore bekerja
git check-ignore backend/.env
git check-ignore backend/data/transactions.json
```

## 🆘 JIKA TERLANJUR COMMIT FILE SENSITIF

```bash
# 1. Hapus dari repository (tapi tetap di local)
git rm --cached backend/.env
git rm --cached backend/data/transactions.json

# 2. Commit perubahan
git commit -m "Remove sensitive files from repository"

# 3. Push perubahan
git push origin main

# 4. Regenerate API keys yang sudah ter-expose
# (Login ke OpenAI, Google Cloud Console, dll)
```

---

**⚠️ PENTING:** Setelah file sensitif ter-expose di GitHub, anggap sudah tidak aman lagi dan regenerate semua credentials!
