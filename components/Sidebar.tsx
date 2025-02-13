'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Home, Newspaper, Calendar } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Accueil", href: "/" },
    { icon: Newspaper, label: "Créer un magazine", href: "/creer-un-magazine" },
    { icon: Calendar, label: "Planning", href: "/planning" },
  ]

  return (
    <aside className="fixed left-0 top-0 z-20 h-screen w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <Link href="/">
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
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg py-2 ${
                  pathname === item.href ? 'bg-gray-100 text-gray-900' : ''
                }`}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}

