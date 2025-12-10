'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGetStarted = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-gray-50 dark:from-[#121212] dark:via-[#1E1E1E] dark:to-[#121212] transition-colors duration-200">
      {/* Navbar */}
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-green rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200" style={{ fontFamily: 'Inter, sans-serif' }}>
              WealthEase
            </span>
          </div>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-emerald-green text-white rounded-lg font-medium hover:bg-dark-green transition-colors duration-200 shadow-sm hover:shadow-md"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Kelola Keuangan{' '}
              <span className="text-emerald-green">Lebih Pintar.</span>
            </h1>
            <p
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Catat transaksi dengan AI Chatbot, kelola Smart Bill otomatis, dan dapatkan insight finansial cerdas untuk mengelola keuanganmu dengan lebih baik.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-emerald-green text-white rounded-xl font-semibold text-lg hover:bg-dark-green transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Mulai Sekarang
            </button>
          </div>

          {/* Right Illustration */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-lg">
              {/* SVG Illustration - Financial Chart */}
              <svg
                viewBox="0 0 500 400"
                className="w-full h-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Circle */}
                <circle cx="250" cy="200" r="180" fill="#D1F2EB" opacity="0.3" />
                <circle cx="250" cy="200" r="140" fill="#E8F8F5" opacity="0.5" />

                {/* Chart Bars */}
                <rect x="120" y="150" width="40" height="120" rx="8" fill="#2ECC71" opacity="0.8" />
                <rect x="180" y="100" width="40" height="170" rx="8" fill="#2ECC71" opacity="0.9" />
                <rect x="240" y="130" width="40" height="140" rx="8" fill="#2ECC71" />
                <rect x="300" y="80" width="40" height="190" rx="8" fill="#2ECC71" opacity="0.9" />
                <rect x="360" y="110" width="40" height="160" rx="8" fill="#2ECC71" opacity="0.8" />

                {/* AI Icon */}
                <circle cx="250" cy="80" r="30" fill="#2ECC71" />
                <text
                  x="250"
                  y="90"
                  textAnchor="middle"
                  fill="white"
                  fontSize="20"
                  fontWeight="bold"
                >
                  AI
                </text>

                {/* Floating Icons */}
                <circle cx="100" cy="100" r="25" fill="#2ECC71" opacity="0.8" />
                <text x="100" y="110" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">💰</text>

                <circle cx="400" cy="280" r="25" fill="#1E8449" opacity="0.7" />
                <text x="400" y="290" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">📊</text>

                <circle cx="150" cy="320" r="20" fill="#2ECC71" opacity="0.8" />
                <text x="150" y="328" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">💳</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 bg-white/50 dark:bg-[#1E1E1E]/50 transition-colors duration-200">
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Fitur Utama
          </h2>
          <p
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-200"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Semua yang Anda butuhkan untuk mengelola keuangan dengan lebih baik
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature Card 1 - AI Chatbot Transaksi */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-emerald-green/10 dark:bg-emerald-green/20 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-emerald-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              AI Chatbot Transaksi
            </h3>
            <p
              className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Catat transaksi dengan mudah melalui obrolan alami. Cukup ketik "saya beli makan 50 ribu" dan AI akan otomatis mencatatnya. Mendukung bahasa Indonesia dan format fleksibel.
            </p>
          </div>

          {/* Feature Card 2 - Smart Bill AI */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-emerald-green/10 dark:bg-emerald-green/20 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-emerald-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Smart Bill AI
            </h3>
            <p
              className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Buat tagihan otomatis dengan AI Chatbot Bill. Katakan "saya akan bayar listrik 500 ribu tanggal 15" dan sistem akan membuat reminder tagihan. Tidak akan lupa bayar tagihan lagi!
            </p>
          </div>

          {/* Feature Card 3 - Laporan & Analytics */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-emerald-green/10 dark:bg-emerald-green/20 rounded-xl flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-emerald-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Laporan & Analytics
            </h3>
            <p
              className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Dapatkan laporan keuangan otomatis dengan visualisasi grafik yang mudah dipahami. Analisis pengeluaran dan pemasukan, plus AI Forecast untuk prediksi keuangan masa depan.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-700 mt-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-green rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span
                className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                WealthEase
              </span>
            </div>
            <div className="text-center md:text-right">
              <p
                className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                © 2024 WealthEase. All rights reserved.
              </p>
              <p
                className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Email: support@wealthease.com
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
