'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

export interface Card3DProps {
  title: string
  icon: ReactNode
  color: string
  href: string
}

export function Card3D({ title, icon, color, href }: Card3DProps) {
  return (
    <Link href={href}>
      <div className={`p-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${color}`}>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      </div>
    </Link>
  )
}
