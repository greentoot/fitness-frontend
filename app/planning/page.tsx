'use client'

import { Sidebar } from '@/components/Sidebar'

export default function PlanningPage() {
  return (
    <div className="flex bg-gray-50 font-['Montserrat',sans-serif] text-gray-900">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Planning</h1>
          {/* Planning content will go here */}
        </div>
      </main>
    </div>
  )
} 