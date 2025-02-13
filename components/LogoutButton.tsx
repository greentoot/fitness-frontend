'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Clear server-side auth
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // Clear ALL sessionStorage data
      sessionStorage.clear()
      
      // Clear localStorage auth if it exists
      localStorage.removeItem('auth')
      
      // Redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg py-2 transform transition-all hover:translate-x-1"
      onClick={handleLogout}
    >
      <LogOut className="mr-3 h-5 w-5" />
      Logout
    </Button>
  )
} 