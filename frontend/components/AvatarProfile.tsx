'use client'

import { useState, useEffect } from 'react'

interface AvatarProfileProps {
  userId?: string
  userName?: string
  userEmail?: string
  googleImageUrl?: string | null
  avatarSelected?: number | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Preset avatars - must match AvatarPicker (tema keuangan)
const PRESET_AVATARS: Record<number, string> = {
  1: '💰',
  2: '💵',
  3: '💴',
  4: '💶',
  5: '💷',
  6: '💸',
  7: '💳',
  8: '💎',
  9: '🏦',
  10: '💼',
  11: '📈',
  12: '📊',
  13: '📉',
  14: '💱',
  15: '🪙',
  16: '💲',
  17: '🔄',
  18: '💹',
  19: '📅',
  20: '🏛️',
  21: '🎯',
  22: '⚖️',
  23: '📋',
  24: '✅',
}

export default function AvatarProfile({
  userId,
  userName,
  userEmail,
  googleImageUrl,
  avatarSelected: initialAvatarSelected,
  size = 'md',
  className = '',
}: AvatarProfileProps) {
  const [avatarSelected, setAvatarSelected] = useState<number | null>(initialAvatarSelected || null)
  const [loading, setLoading] = useState(false)

  // Fetch avatar selection from API if userId is provided
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!userId || initialAvatarSelected !== undefined) {
        return
      }

      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) return

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${API_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          if (userData.avatar_selected) {
            setAvatarSelected(userData.avatar_selected)
          }
        }
      } catch (err) {
        console.error('Error fetching avatar:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAvatar()
  }, [userId, initialAvatarSelected])

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-32 h-32 text-2xl',
  }

  // Get emoji size based on avatar size
  const emojiSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  }

  // Get initial letter for placeholder
  const getInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase()
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase()
    }
    return '?'
  }

  // Get avatar emoji if selected
  const getAvatarEmoji = () => {
    if (avatarSelected && PRESET_AVATARS[avatarSelected]) {
      return PRESET_AVATARS[avatarSelected]
    }
    return null
  }

  // Priority: preset avatar emoji > google image > initial letter
  const avatarEmoji = getAvatarEmoji()
  const displayImage = googleImageUrl && !avatarEmoji ? googleImageUrl : null
  const showPlaceholder = !avatarEmoji && !displayImage && !loading

  if (loading) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      {avatarEmoji ? (
        <div className={`w-full h-full bg-gradient-to-br from-emerald-500 to-dark-green flex items-center justify-center ${emojiSizes[size]}`}>
          {avatarEmoji}
        </div>
      ) : displayImage ? (
        <img
          src={displayImage}
          alt={userName || 'Profile picture'}
          className="w-full h-full object-cover"
          onError={() => {
            // If image fails to load, fallback to placeholder
            setAvatarSelected(null)
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-dark-green flex items-center justify-center text-white font-semibold">
          {getInitial()}
        </div>
      )}
    </div>
  )
}

