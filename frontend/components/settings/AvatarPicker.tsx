'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AvatarProfile from '@/components/AvatarProfile'
import Toast from '@/components/Toast'

interface User {
  id: string
  name: string
  email: string
  role?: string
}

interface AvatarPickerProps {
  user: User | null
  loading?: boolean
}

// Preset avatars - icon bertema keuangan
const PRESET_AVATARS = [
  { id: 1, emoji: '💰', name: 'Money Bag' },
  { id: 2, emoji: '💵', name: 'Dollar' },
  { id: 3, emoji: '💴', name: 'Yen' },
  { id: 4, emoji: '💶', name: 'Euro' },
  { id: 5, emoji: '💷', name: 'Pound' },
  { id: 6, emoji: '💸', name: 'Money Wings' },
  { id: 7, emoji: '💳', name: 'Credit Card' },
  { id: 8, emoji: '💎', name: 'Diamond' },
  { id: 9, emoji: '🏦', name: 'Bank' },
  { id: 10, emoji: '💼', name: 'Briefcase' },
  { id: 11, emoji: '📈', name: 'Chart Up' },
  { id: 12, emoji: '📊', name: 'Chart' },
  { id: 13, emoji: '📉', name: 'Chart Down' },
  { id: 14, emoji: '💱', name: 'Currency Exchange' },
  { id: 15, emoji: '🪙', name: 'Coin' },
  { id: 16, emoji: '💲', name: 'Dollar Sign' },
  { id: 17, emoji: '🔄', name: 'Exchange' },
  { id: 18, emoji: '💹', name: 'Yen Chart' },
  { id: 19, emoji: '📅', name: 'Calendar' },
  { id: 20, emoji: '🏛️', name: 'Building' },
  { id: 21, emoji: '🎯', name: 'Target' },
  { id: 22, emoji: '⚖️', name: 'Balance' },
  { id: 23, emoji: '📋', name: 'Clipboard' },
  { id: 24, emoji: '✅', name: 'Checkmark' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AvatarPicker({ user, loading: userLoading }: AvatarPickerProps) {
  const router = useRouter()
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
    visible: boolean
  }>({
    message: '',
    type: 'success',
    visible: false,
  })

  // Fetch current avatar selection from database
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token tidak ditemukan. Silakan login ulang.')
        }

        const response = await fetch(`${API_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Gagal mengambil data profil.')
        }

        const userData = await response.json()
        if (userData.avatar_selected) {
          setSelectedAvatar(userData.avatar_selected)
        }
      } catch (err) {
        console.error('Error fetching avatar:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (!userLoading) {
      fetchAvatar()
    }
  }, [user?.id, userLoading])

  const handleSelectAvatar = async (avatarId: number) => {
    if (!user?.id || isSaving) return

    setIsSaving(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.')
      }

      const response = await fetch(`${API_URL}/user/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_selected: avatarId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Gagal menyimpan pilihan avatar')
      }

      setSelectedAvatar(avatarId)
      showToast('Avatar berhasil dipilih!', 'success')
      
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      console.error('Save avatar error:', error)
      showToast(
        error instanceof Error ? error.message : 'Gagal menyimpan pilihan avatar',
        'error'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, visible: true })
  }

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }))
  }

  // Get current avatar emoji for display
  const getCurrentAvatarEmoji = () => {
    if (selectedAvatar) {
      const avatar = PRESET_AVATARS.find((a) => a.id === selectedAvatar)
      return avatar?.emoji || null
    }
    return null
  }

  if (userLoading || isLoading) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-8"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Pilih Avatar
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <AvatarProfile
              userId={user?.id}
              userName={user?.name}
              userEmail={user?.email}
              avatarSelected={selectedAvatar}
              size="sm"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Pilih avatar favorit Anda
            </p>
          </div>

          <div className="grid grid-cols-12 gap-1">
            {PRESET_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleSelectAvatar(avatar.id)}
                disabled={isSaving}
                className={`relative w-full aspect-square rounded-full flex items-center justify-center text-sm transition-all duration-200 ${
                  selectedAvatar === avatar.id
                    ? 'ring-1.5 ring-emerald-500 scale-105 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={avatar.name}
              >
                {avatar.emoji}
                {selectedAvatar === avatar.id && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2 h-2 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />
    </>
  )
}

