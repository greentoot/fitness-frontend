'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/Sidebar"
import { Copy, History } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Newsletter {
  filename: string
  title: string
  content: string
  created: string
}

export default function CreerNewsletter() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [currentNewsletter, setCurrentNewsletter] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/newsletter/list', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok) throw new Error('Failed to fetch newsletters')
      const data = await response.json()
      if (data.status === 'success' && data.data.newsletters.length > 0) {
        setNewsletters(data.data.newsletters)
        // Set the most recent newsletter as current
        setCurrentNewsletter(data.data.latest.content)
      }
    } catch (err) {
      console.error('Error fetching newsletters:', err)
    }
  }

  const generateNewsletter = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/newsletter/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic })
      })

      const data = await response.json()
      if (data.status === 'success') {
        setCurrentNewsletter(data.data.content)
      } else {
        throw new Error(data.message || 'Failed to generate newsletter')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating newsletter")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
      setError('Failed to copy to clipboard')
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
      setError('Failed to download newsletter')
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6 ml-[250px]">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Créer une Newsletter</h1>
          <Button
            onClick={() => router.push('/archives-newsletter')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Archives
          </Button>
        </div>

        {/* Topic Search - Moved to top */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Entrez le sujet de la newsletter..."
                value={topic}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={generateNewsletter}
                disabled={loading}
              >
                {loading ? "Génération..." : "Générer"}
              </Button>
            </div>
            
            {error && (
              <div className="text-red-500 mt-2">
                {error}
              </div>
            )}
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-6">
            <div className="text-center">Génération de la newsletter en cours...</div>
          </Card>
        )}

        {/* Display the most recent newsletter if it exists */}
        {currentNewsletter && !loading && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Newsletter Générée</h2>
              <Button
                onClick={() => copyToClipboard(currentNewsletter)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copySuccess ? "Copié!" : "Copier"}
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {currentNewsletter}
            </div>
          </Card>
        )}

        {/* Previous Newsletters */}
        {newsletters.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Newsletters Précédentes</h2>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {newsletters.map((newsletter) => (
                  <Card key={newsletter.filename} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{newsletter.filename}</h3>
                        <p className="text-sm text-gray-500">
                          Créé le: {new Date(newsletter.created).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyToClipboard(newsletter.content)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copier
                        </Button>
                        <Button
                          onClick={() => downloadNewsletter(newsletter.filename)}
                          variant="ghost"
                          size="sm"
                        >
                          Télécharger
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {newsletter.title}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  )
} 