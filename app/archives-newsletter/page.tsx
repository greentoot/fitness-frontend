'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/Sidebar"
import { Copy, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Newsletter {
  filename: string
  title: string
  preview: string
  content: string
  created: string
}

export default function NewsletterArchives() {
  const router = useRouter()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/newsletter/list')
      if (!response.ok) throw new Error('Failed to fetch newsletters')
      const data = await response.json()
      if (data.status === 'success') {
        setNewsletters(data.data.newsletters)
      }
    } catch (err) {
      console.error('Error fetching newsletters:', err)
      setError('Failed to load newsletters')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, filename: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(filename)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const downloadNewsletter = async (filename: string) => {
    try {
      const response = await fetch(`/api/newsletter/download/${filename}`)
      if (!response.ok) throw new Error('Failed to download newsletter')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading newsletter:', error)
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6 ml-[250px]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/creer-une-newsletter')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Archives des Newsletters</h1>
          </div>
        </div>

        {loading ? (
          <Card className="p-6">
            <div className="text-center">Chargement des newsletters...</div>
          </Card>
        ) : error ? (
          <Card className="p-6">
            <div className="text-red-500 text-center">{error}</div>
          </Card>
        ) : newsletters.length === 0 ? (
          <Card className="p-6">
            <div className="text-center">Aucune newsletter trouvée</div>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {newsletters.map((newsletter) => (
                <Card key={newsletter.filename} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{newsletter.title}</h2>
                      <p className="text-sm text-gray-500">
                        Créé le: {new Date(newsletter.created).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(newsletter.content, newsletter.filename)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {copySuccess === newsletter.filename ? 'Copié!' : 'Copier'}
                      </Button>
                      <Button
                        onClick={() => downloadNewsletter(newsletter.filename)}
                        variant="outline"
                        size="sm"
                      >
                        Télécharger
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{newsletter.content}</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
} 