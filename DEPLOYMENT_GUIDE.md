# Panduan Lengkap Deployment: GitHub & Vercel

Panduan ini mencakup langkah-langkah dari persiapan file, upload ke GitHub, hingga aplikasi live di Vercel.

## Bagian 1: Apa yang TIDAK BOLEH di-upload? (Security Check)

Sebelum upload, pastikan file/folder ini **TIDAK** ikut ter-upload ke GitHub karena bersifat rahasia atau terlalu besar. Saya sudah membuatkan file `.gitignore` untuk mencegahnya otomatis, tapi pastikan Anda **TIDAK** memaksa upload file berikut:

1.  **Folder `node_modules`**: Ini sangat besar. Kita akan install ulang di Vercel nanti.
2.  **File Environment (`.env`, `.env.local`)**: Berisi password database dan API Key. **JANGAN PERNAH UPLOAD INI**.
3.  **Folder `.next` & `.vercel`**: Ini file hasil build/cache lokal.

**Cek file `.gitignore` Anda:**
Pastikan ada file bernama `.gitignore` di folder `backend`, `frontend`, dan root folder utama yang berisi minimal:
```text
node_modules
.env
.env.local
```

---

## Bagian 2: Upload ke GitHub

Buka terminal di folder utama project (`Newest WealthEase`), lalu jalankan perintah berikut satu per satu:

1.  **Inisialisasi Git** (jika belum pernah):
    ```bash
    git init
    ```

2.  **Masukkan semua file ke antrian upload**:
    ```bash
    git add .
    ```
    *(Git akan otomatis mengabaikan file yang ada di .gitignore)*

3.  **Simpan perubahan (Commit)**:
    ```bash
    git commit -m "Siap deploy ke Vercel"
    ```

4.  **Hubungkan ke Repository GitHub Anda**:
    *   Buat repository baru di website GitHub (kosongkan, jangan centang "Add README").
    *   Salin link repository (misal: `https://github.com/username/nama-repo.git`).
    *   Jalankan command (ganti URL dengan milik Anda):
    ```bash
    git branch -M main
    git remote add origin https://github.com/username/nama-repo.git
    git push -u origin main
    ```

---

## Bagian 3: Hosting ke Vercel

Kita akan men-deploy Frontend dan Backend secara terpisah dari repository yang sama.

### Langkah 3a: Deploy Backend (Express)
1.  Buka [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New...** -> **Project**.
2.  Import repository GitHub Anda.
3.  **PENTING**: Di bagian **Root Directory**, klik **Edit** dan pilih folder **`backend`**.
4.  Beri nama project, misal: `wealthease-backend`.
5.  **Environment Variables**: Masukkan isi file `backend/.env` Anda di sini.
    *   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`, `MONGODB_URI`, `JWT_SECRET`, dll.
6.  Klik **Deploy**.
7.  Setelah sukses, **copy URL domain** yang diberikan (misal: `https://wealthease-backend.vercel.app`).

### Langkah 3b: Deploy Frontend (Next.js)
1.  Kembali ke Dashboard, klik **Add New...** -> **Project**.
2.  Import repository yang **SAMA**.
3.  **PENTING**: Di bagian **Root Directory**, klik **Edit** dan pilih folder **`frontend`**.
4.  Beri nama project, misal: `wealthease-frontend`.
5.  **Environment Variables**:
    *   Masukkan variabel dari `frontend/.env.local` jika ada.
    *   **UPDATE URL BACKEND**: Cari variabel yang menyimpan URL API (misal `NEXT_PUBLIC_API_URL`). Isi nilainya dengan URL Backend dari Langkah 3a (`https://wealthease-backend.vercel.app`).
6.  Klik **Deploy**.

---

## Bagian 4: Finishing Touch

Agar Backend bisa menerima request dari Frontend yang baru (mengatasi masalah CORS):

1.  Pergi ke dashboard project **Backend** di Vercel.
2.  Masuk ke **Settings** -> **Environment Variables**.
3.  Tambahkan atau Edit variabel `FRONTEND_URL`. Isi dengan URL domain Frontend Anda (misal: `https://wealthease-frontend.vercel.app`).
4.  Pergi ke tab **Deployments**, klik titik tiga di deployment terbaru, lalu pilih **Redeploy** (agar environment variable baru aktif).

✅ **Selesai!** Aplikasi Anda sekarang live.
