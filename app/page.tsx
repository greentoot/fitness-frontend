'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Layout, Calendar } from 'lucide-react'
import { Card3D } from '@/components/Card3D'
import { IntroAnimation } from '@/components/IntroAnimation'
import { Sidebar } from '@/components/Sidebar'
import { LogoutButton } from '@/components/LogoutButton'

export default function Dashboard() {
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const auth = sessionStorage.getItem('auth') || localStorage.getItem('auth')
    if (!auth) {
      // If not authenticated, redirect to login immediately
      router.replace('/login')
      return
    }

    // Check if intro has been shown this session
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro')
    if (hasSeenIntro) {
      setShowIntro(false)
    } else {
      sessionStorage.setItem('hasSeenIntro', 'true')
    }
  }, [router]) // Only depend on router

  const projectCards = [
    {
      title: "Créer un nouveau magazine",
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/newspaper-mbuiYIa8kLISqnX2ahYI6WN3xQdSR6.png"
          alt="Magazine"
          width={24}
          height={24}
          className="h-8 w-8"
        />
      ),
      color: "bg-blue-100",
      href: "/creer-un-magazine"
    },
    {
      title: "Créer une Newsletter",
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/newsletter-SdjohB0PsZFTr2yLdiRa1zROtCJApR.png"
          alt="Newsletter"
          width={24}
          height={24}
          className="h-8 w-8"
        />
      ),
      color: "bg-pink-100",
      href: "/creer-une-newsletter"
    },
    {
      title: "Créer un post LinkedIn",
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/linkedin-O8hfqRYqJvtUIvrb4A4tGtT4TJrVKj.png"
          alt="LinkedIn"
          width={24}
          height={24}
          className="h-8 w-8"
        />
      ),
      color: "bg-blue-100",
      href: "/creer-un-post-linkedin"
    },
    {
      title: "Créer un post unique",
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blog-Kh4cvRA12Kp7rlrMaDQDJtqR5VMpHx.png"
          alt="Blog"
          width={24}
          height={24}
          className="h-8 w-8"
        />
      ),
      color: "bg-purple-100",
      href: "/creer-un-post-unique"
    },
  ]

  const navItems = [
    { icon: Home, label: "Accueil", href: "/" },
    { icon: Layout, label: "Articles", href: "/articles" },
    { icon: Calendar, label: "Planning", href: "/planning" },
  ]

  const feedItems = [
    {
      author: "Pierre Martin",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "Article 'Nouvelles tendances fitness 2024' généré",
      time: "Il y a 2h",
    },
    {
      author: "Marie Dubois",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "Traduction terminée : 'Home workout revolution'",
      time: "Il y a 3h",
    },
    {
      author: "Jean Dupont",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "Nouveau post LinkedIn : 'L'importance de l'hydratation pendant l'entraînement'",
      time: "Il y a 5h",
    },
  ]

  return (
    <>
      {showIntro && <IntroAnimation />}
      <div className="flex bg-gray-50 font-['Montserrat',sans-serif] text-gray-900">
        <aside className="fixed left-0 top-0 z-20 h-screen w-64 bg-white shadow-lg">
          <div className="flex flex-col h-full">
            <div className="p-6">
              <Link href="/" className="block transform transition-transform hover:scale-105" onClick={(e) => {
                e.preventDefault()
                if (window.location.pathname === '/') return
                router.push('/')
              }}>
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-ZtN5hE8erMC4X3GDmSzeNh0j8Y0YC0.gif"
                  alt="Fitness Challenges Logo"
                  width={150}
                  height={80}
                  className="mb-8"
                />
              </Link>
              <nav className="space-y-1">
                {navItems.map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      if (window.location.pathname === item.href) return
                      router.push(item.href)
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg py-2 transform transition-all hover:translate-x-1"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                
                <div className="my-4 border-t border-gray-200" />
                
                <LogoutButton />
              </nav>
            </div>
          </div>
        </aside>

        <main className="ml-64 flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {projectCards.map((card, index) => (
                <Card3D
                  key={index}
                  title={card.title}
                  icon={card.icon}
                  color={card.color}
                  href={card.href}
                />
              ))}
            </div>

            <Card className="bg-white shadow-md transform transition-all hover:shadow-xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/media-rzhb85hF07nWimUkm43OfFBcMxEVPY.png"
                    alt="Media"
                    width={24}
                    height={24}
                    className="mr-3"
                  />
                  News du secteur
                </h2>
              </div>
              <ScrollArea className="max-h-[400px]">
                <div className="p-6 space-y-6">
                  {feedItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <Image
                        src={item.avatar}
                        alt={item.author}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{item.author}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                        <span className="text-xs text-gray-500 mt-2 block">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}

