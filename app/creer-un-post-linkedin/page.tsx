'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Loader2, History } from "lucide-react"
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Post {
  filename: string
  topic: string
  content: {
    english: string
    french: string
  }
  created: string
}

export default function CreateLinkedInPost() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [topic, setTopic] = useState('')
  const [error, setError] = useState('')
  const [generatedContent, setGeneratedContent] = useState<{
    english: string;
    french: string;
  } | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Load post history
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoadingHistory(true)
      try {
        const response = await fetch('/api/linkedin/list')
        const data = await response.json()
        if (data.status === 'success' && data.data.posts) {
          setPosts(data.data.posts)
        }
      } catch (error) {
        console.error('Error loading posts:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadPosts()
  }, [generatedContent]) // Reload when new content is generated

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setGeneratedContent(null)

    try {
      const response = await fetch('/api/linkedin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      })

      const result = await response.json()
      console.log('API Response:', result)  // Debug log

      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to generate content')
      }

      // Verify the content structure
      const content = result.data.content
      if (!content || typeof content.english !== 'string' || typeof content.french !== 'string') {
        console.error('Invalid content structure:', content)
        throw new Error('Invalid content structure received from server')
      }

      // Set the content
      setGeneratedContent({
        english: content.english,
        french: content.french
      })
    } catch (error) {
      console.error('Error generating content:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
        >
          ← Retour
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center"
        >
          <History className="mr-2 h-4 w-4" />
          {showHistory ? 'Masquer l\'historique' : 'Voir l\'historique'}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Créer un Post LinkedIn</h1>

        <div className="grid grid-cols-1 gap-8">
          <div className={showHistory ? "col-span-1" : ""}>
            <Card className="p-6 mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="topic">Sujet du post</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Les dernières tendances du fitness en 2024"
                    className="mt-2"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Notre IA va générer un post professionnel en anglais et en français
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading || !topic}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    'Générer le post'
                  )}
                </Button>
              </form>
            </Card>

            {generatedContent && (
              <div className="space-y-8">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Version Anglaise</h2>
                  <div className="prose max-w-none whitespace-pre-wrap">
                    {generatedContent.english}
                  </div>
                  <Button 
                    onClick={() => navigator.clipboard.writeText(generatedContent.english)}
                    variant="outline"
                    className="mt-4"
                  >
                    Copier le texte
                  </Button>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Version Française</h2>
                  <div className="prose max-w-none whitespace-pre-wrap">
                    {generatedContent.french}
                  </div>
                  <Button 
                    onClick={() => navigator.clipboard.writeText(generatedContent.french)}
                    variant="outline"
                    className="mt-4"
                  >
                    Copier le texte
                  </Button>
                </Card>
              </div>
            )}
          </div>

          {showHistory && (
            <div className="col-span-1">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Historique des posts</h2>
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <Card key={post.filename} className="p-4 hover:bg-gray-50">
                        <div className="mb-2">
                          <h3 className="font-medium">{post.topic}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(post.created), 'PPP à HH:mm', { locale: fr })}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(post.content.english)}
                          >
                            Copier (EN)
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(post.content.french)}
                          >
                            Copier (FR)
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <a 
                            href={`http://localhost:8002/api/linkedin/download/${post.filename.replace('.json', '.md')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                            >
                              Télécharger MD
                            </Button>
                          </a>
                          <a 
                            href={`http://localhost:8002/api/linkedin/download/${post.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                            >
                              Télécharger JSON
                            </Button>
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Aucun post dans l'historique
                  </p>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 