'use client'

import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { ReactNode } from "react"

interface Card3DProps {
  title: string
  icon: ReactNode
  color: string
  href: string
}

export function Card3D({ title, icon, color, href }: Card3DProps) {
  return (
    <Link href={href}>
      <Card className="group relative transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer overflow-hidden">
        <div className={`p-6 rounded-lg ${color} relative z-10`}>
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg p-2 shadow-md transform transition-transform group-hover:scale-110">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 transform transition-transform group-hover:translate-x-2">
              {title}
            </h3>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      </Card>
    </Link>
  )
}
