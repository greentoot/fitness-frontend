'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/Sidebar"
import { Copy, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LinkedInPost {
  filename: string
  topic: string
  content: {
    english: string
    french: string
  }
  created: string
}

export default function LinkedInArchives() {
  const router = useRouter()
  const [posts, setPosts] = useState<LinkedInPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/linkedin/list')
      if (!response.ok) throw new Error('Failed to fetch posts')
      const data = await response.json()
      if (data.status === 'success') {
        setPosts(data.data.posts)
      }
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts')
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

  const downloadPost = async (filename: string) => {
    try {
      const response = await fetch(`/api/linkedin/download/${filename}`)
      if (!response.ok) throw new Error('Failed to download post')

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
      console.error('Error downloading post:', error)
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
              onClick={() => router.push('/creer-un-post-linkedin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Archives LinkedIn</h1>
          </div>
        </div>

        {loading ? (
          <Card className="p-6">
            <div className="text-center">Chargement des posts...</div>
          </Card>
        ) : error ? (
          <Card className="p-6">
            <div className="text-red-500 text-center">{error}</div>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="p-6">
            <div className="text-center">Aucun post trouvé</div>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.filename} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{post.topic}</h2>
                      <p className="text-sm text-gray-500">
                        Créé le: {new Date(post.created).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(post.content.french, post.filename)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {copySuccess === post.filename ? 'Copié!' : 'Copier FR'}
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(post.content.english, post.filename)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {copySuccess === post.filename ? 'Copié!' : 'Copier EN'}
                      </Button>
                      <Button
                        onClick={() => downloadPost(post.filename)}
                        variant="outline"
                        size="sm"
                      >
                        Télécharger
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Version Française</h3>
                      <p className="text-gray-700">{post.content.french}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Version Anglaise</h3>
                      <p className="text-gray-700">{post.content.english}</p>
                    </div>
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