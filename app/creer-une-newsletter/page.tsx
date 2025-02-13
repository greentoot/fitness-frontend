'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/Sidebar"
import { Copy } from 'lucide-react'

interface Newsletter {
  filename: string
  preview: string
  content: string
  created: string
}

export default function CreerNewsletter() {
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
      const response = await fetch('/api/newsletter/list')
      if (!response.ok) throw new Error('Failed to fetch newsletters')
      const data = await response.json()
      if (data.status === 'success') {
        setNewsletters(data.data.newsletters)
        // If we just generated a newsletter, set it as current
        if (data.data.latest && !currentNewsletter) {
          setCurrentNewsletter(data.data.latest.content)
        }
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

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Failed to generate newsletter')
      }

      const data = await response.json()
      if (data.status === 'success') {
        setCurrentNewsletter(data.data.content)
        await fetchNewsletters()  // Refresh the list to include the new newsletter
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
      setTimeout(() => setCopySuccess(false), 2000)  // Reset after 2 seconds
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
        <h1 className="text-3xl font-bold">Créer une Newsletter</h1>
        
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

        {currentNewsletter && (
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
                        {newsletter.preview}
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