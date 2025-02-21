'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/Sidebar"

interface Agent {
  name: string
  role: string
  description: string
}

interface Topic {
  id: number
  text: string
  selected: boolean
}

interface Article {
  filename: string
  agent: string
  language: string
  path: string
  preview?: string
}

interface ProposalResponse {
  status: string
  message?: string
  data: {
    proposals: Array<{
      agent: string
      topics: Array<{
        id: number
        text: string
        selected: boolean
      }>
      completed: boolean
      isCurrentAgent: boolean
    }>
    currentAgent: string
    phase: string
  }
}

interface SelectionTopic {
  id: number
  text: string
}

const agents: Agent[] = [
  {
    name: "Editorial Writer",
    role: "Rédacteur en Chef",
    description: "Responsable de la direction éditoriale et de la cohérence des contenus"
  },
  {
    name: "Health & Wellness Writer",
    role: "Rédacteur Santé & Bien-être",
    description: "Spécialiste des sujets liés à la santé et au bien-être"
  },
  {
    name: "Fitness Equipment Writer",
    role: "Rédacteur Équipement Fitness",
    description: "Expert en équipements et innovations fitness"
  },
  {
    name: "Business Strategy Writer",
    role: "Rédacteur Stratégie Business",
    description: "Spécialiste des aspects business et stratégiques"
  },
  {
    name: "Trends & Lifestyle Writer",
    role: "Rédacteur Tendances",
    description: "Expert des tendances et du lifestyle fitness"
  },
  {
    name: "Nutrition & Wellness Writer",
    role: "Rédacteur Nutrition",
    description: "Expert en nutrition et bien-être"
  },
  {
    name: "Marketing & Digital Strategy Writer",
    role: "Rédacteur Marketing Digital",
    description: "Spécialiste du marketing et des stratégies digitales"
  }
]

export default function CreerMagazine() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)
  const [proposals, setProposals] = useState<Record<string, Topic[]>>({})
  const [selectedTopics, setSelectedTopics] = useState<Record<string, number[]>>({})
  const [articles, setArticles] = useState<any>({})
  const [completedAgents, setCompletedAgents] = useState<string[]>([])
  const [isPolling, setIsPolling] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const startProcess = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/magazine/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Server error:', errorData)
        throw new Error(errorData || 'Failed to generate topics')
      }

      const data: ProposalResponse = await response.json()
      if (data.status === 'success') {
        const formattedProposals: Record<string, Topic[]> = {}
        data.data.proposals.forEach((agentData) => {
          formattedProposals[agentData.agent] = agentData.topics.map((topic) => ({
            id: topic.id,
            text: topic.text,
              selected: false
          }))
        })
        
        setProposals(formattedProposals)
        setCurrentAgent(data.data.currentAgent)
        setStep(2)
      } else {
        throw new Error(data.message || 'Failed to generate topics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération des sujets")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAgentTopics = async () => {
    if (!currentAgent) return
    
    setLoading(true)
    setError(null)
    try {
      const selectedTopicIds = proposals[currentAgent]
        .filter(topic => topic.selected)
        .map(topic => topic.id)

      if (selectedTopicIds.length === 0) {
        throw new Error("Veuillez sélectionner au moins un sujet")
      }

      const response = await fetch('/api/magazine/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_name: currentAgent,
          selected_topics: selectedTopicIds
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Server error:', errorData)
        throw new Error(errorData || 'Failed to select topics')
      }

      const data = await response.json()
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Erreur lors de la sélection des sujets')
      }

      setCompletedAgents(prev => [...prev, currentAgent])
      
      if (data.data.selections) {
        setSelectedTopics(prev => ({
          ...prev,
          [currentAgent]: data.data.selections.selectedTopics
        }))
      }
      
      if (data.data.complete) {
        setStep(3)
        await generateContent()
      } else {
        setCurrentAgent(data.data.currentAgent)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la sélection des sujets"
      setError(errorMessage)
      console.error('Error in handleAgentTopics:', err)
    } finally {
      setLoading(false)
    }
  }

  const pollForArticles = useCallback(async () => {
    if (!isGenerating) return

    try {
        console.log('Polling for articles from Flask backend...')
        const response = await fetch('http://localhost:8000/api/magazine/articles', {
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store'  // Disable caching to get fresh results
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Received articles response:', data)
        
        if (data.status === 'success' && data.data) {
            if (data.data.articles && Object.keys(data.data.articles).length > 0) {
                console.log('Found articles:', data.data.articles)
                setArticles(data.data.articles)
                setIsGenerating(false)  // Stop polling once we have articles
                setError(null)
            } else {
                console.log('No articles found yet, continuing to poll...')
            }
        } else {
            console.error('Error in articles response:', data.message)
        }
    } catch (err) {
        console.error('Polling error:', err)
        setError('Failed to fetch articles. Please try again.')
    }
  }, [isGenerating])

  useEffect(() => {
    if (step === 3) {
      console.log('Starting article polling...')
      setIsGenerating(true)
      pollForArticles() // Initial poll

      const interval = setInterval(pollForArticles, 5000)
      return () => {
        console.log('Stopping article polling...')
        clearInterval(interval)
        setIsGenerating(false)
      }
    }
  }, [step, pollForArticles])

  const generateContent = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Selected topics:', selectedTopics)

      const response = await fetch('/api/magazine/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectedTopics })
      })

      if (response.ok) {
        setIsGenerating(true)  // Only set this when we get OK from the server
      }
      
      setStep(3)  // Move to step 3 regardless
    } catch (err) {
      console.log('Note: Content creation process continues in background')
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  const toggleTopicSelection = (agentName: string, topicId: number) => {
    setProposals(prev => ({
      ...prev,
      [agentName]: prev[agentName].map(topic => 
        topic.id === topicId 
          ? { ...topic, selected: !topic.selected }
          : topic
      )
    }))
  }

  const resetProcess = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/magazine/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Server error:', errorData)
        throw new Error(errorData || 'Failed to reset process')
      }

      setStep(1)
      setCurrentAgent(null)
      setProposals({})
      setSelectedTopics({})
      setArticles({})
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la réinitialisation")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadArticle = async (filename: string) => {
    try {
      const response = await fetch(`/api/magazine/download/${encodeURIComponent(filename)}`)
      
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

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
      console.error('Error downloading article:', error)
      setError('Failed to download article')
    }
  }

  const downloadAllArticles = async () => {
    try {
      const response = await fetch('/api/magazine/download')
      
      if (!response.ok) {
        throw new Error('Failed to download files')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'tous_les_articles.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading all articles:', error)
      setError('Failed to download all articles')
    }
  }

  const renderArticles = () => {
    if (!isGenerating && Object.keys(articles).length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Starting article generation...</p>
            </div>
        )
    }

    if (isGenerating && Object.keys(articles).length === 0) {
        return (
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">Writing articles... This may take a few minutes.</p>
            </div>
        )
    }

    return Object.entries(articles).map(([agent, languages]: [string, any]) => (
        <div key={agent} className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{agent}</h3>
            <div className="grid grid-cols-2 gap-4">
                {languages.EN && (
                    <Card className="p-4">
                        <h4 className="font-medium mb-2">English Version</h4>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{languages.EN.preview}</p>
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => downloadArticle(languages.EN.filename)}
                        >
                            Download
                        </Button>
                    </Card>
                )}
                {languages.FR && (
                    <Card className="p-4">
                        <h4 className="font-medium mb-2">French Version</h4>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{languages.FR.preview}</p>
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => downloadArticle(languages.FR.filename)}
                        >
                            Download
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    ))
  }

  // New component for article preview
  const ArticlePreview = ({ filename }: { filename: string }) => {
    const [preview, setPreview] = useState<string>("")
    const [error, setError] = useState<string>("")

    useEffect(() => {
      const fetchPreview = async () => {
        try {
          const response = await fetch(`/api/magazine/preview/${encodeURIComponent(filename)}`)
          if (!response.ok) throw new Error('Failed to load preview')
          const data = await response.json()
          if (data.status === 'success') {
            setPreview(data.preview)
          } else {
            throw new Error(data.message || 'Failed to load preview')
          }
        } catch (err) {
          setError('Impossible de charger l\'aperçu')
          console.error('Error loading preview:', err)
        }
      }

      fetchPreview()
    }, [filename])

    if (error) return (
      <div className="text-red-500 p-2 bg-red-50 rounded">
        {error}
      </div>
    )
    
    if (!preview) return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )

    return (
      <div className="bg-white p-4 rounded-lg shadow-inner">
        <p className="text-gray-700 leading-relaxed">
          {preview}
        </p>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Génération des Sujets</h2>
            <p className="text-gray-600">
              Cliquez pour générer des propositions de sujets. Notre équipe d'IA va rechercher et proposer des sujets pertinents pour chaque section du magazine.
            </p>
            <Button 
              onClick={startProcess}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Recherche des sujets en cours..." : "Générer les Propositions"}
            </Button>
            {error && (
              <div className="text-red-500 mt-2">
                {error}
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Sélection des Sujets</h2>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-2">Progression</h3>
              <div className="grid grid-cols-1 gap-2">
                {agents.map((agent) => (
                  <div 
                    key={agent.name}
                    className={`flex items-center p-2 rounded ${
                      completedAgents.includes(agent.name)
                        ? 'bg-green-100 text-green-800'
                        : agent.name === currentAgent
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{agent.role}</p>
                      <p className="text-sm">
                        {completedAgents.includes(agent.name)
                          ? '✓ Complété'
                          : agent.name === currentAgent
                          ? 'En cours'
                          : 'En attente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {currentAgent && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-800">
                    Agent actuel : {agents.find(a => a.name === currentAgent)?.role || currentAgent}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {agents.find(a => a.name === currentAgent)?.description}
                  </p>
            </div>
            <ScrollArea className="h-[400px] rounded-md border p-4">
                  {proposals[currentAgent]?.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => toggleTopicSelection(currentAgent, topic.id)}
                    >
                  <input
                    type="checkbox"
                    checked={topic.selected}
                        onChange={() => {}}
                    className="h-4 w-4"
                  />
                      <span className={topic.selected ? 'font-medium' : ''}>
                        {topic.text}
                      </span>
                </div>
              ))}
            </ScrollArea>
              <Button
                  onClick={handleAgentTopics}
                  disabled={loading}
                  className="w-full"
              >
                  {loading ? "Traitement en cours..." : `Valider la sélection pour ${agents.find(a => a.name === currentAgent)?.role}`}
              </Button>
                {error && (
                  <div className="text-red-500 mt-2">
                    {error}
            </div>
                )}
              </>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Articles Générés</h2>
              <Button
                onClick={downloadAllArticles}
                variant="ghost"
                size="sm"
              >
                Télécharger Tous les Articles
              </Button>
            </div>
            <ScrollArea className="h-[600px] rounded-md border p-4">
              {renderArticles()}
            </ScrollArea>
            <Button 
              onClick={resetProcess}
              disabled={loading}
              className="w-full"
            >
              Réinitialiser le processus
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6 ml-[250px]">
        {renderStep()}
            {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                {error}
              </div>
            )}
        </div>
    </div>
  )
}

