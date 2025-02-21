'use client'

import { Book, Mail, Linkedin, FileText, LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Magazine",
      icon: <Book className="h-4 w-4" />,
      href: "/creer-un-magazine"
    },
    {
      title: "Newsletter",
      icon: <Mail className="h-4 w-4" />,
      href: "/creer-une-newsletter"
    },
    {
      title: "LinkedIn",
      icon: <Linkedin className="h-4 w-4" />,
      href: "/creer-un-post-linkedin"
    },
    {
      title: "Post",
      icon: <FileText className="h-4 w-4" />,
      href: "/creer-un-post-unique"
    }
  ]

  return (
    <div className="fixed left-0 h-full w-[250px] bg-white border-r p-6 flex flex-col">
      {/* Logo/Home button */}
      <div 
        className="cursor-pointer mb-8"
        onClick={() => router.push('/')}
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-ZtN5hE8erMC4X3GDmSzeNh0j8Y0YC0.gif"
          alt="Fitness Challenges Logo"
          width={150}
          height={40}
          priority
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${pathname === item.href 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {item.icon}
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <button
        onClick={() => {
          // Add logout logic here
          router.push('/login')
        }}
        className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Déconnexion
      </button>
    </div>
  )
}

