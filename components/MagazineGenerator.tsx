'use client'

import { useState, useEffect } from 'react'
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"

interface TopicProposal {
  agent: string
  topic: string
  number: number
}

interface Article {
  content: string
  rtf_file: string
  language: string
}

export function MagazineGenerator() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proposals, setProposals] = useState<{[key: string]: TopicProposal[]}>({})
  const [selectedTopics, setSelectedTopics] = useState<TopicProposal[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0)

  useEffect(() => {
    if (step === 1) {
      generateTopicProposals()
    }
  }, [step])

  const generateTopicProposals = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/magazine?endpoint=generate-topics', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate topic proposals')
      }

      const data = await response.json()
      if (data.status === 'success') {
        setProposals(data.proposals)
        setStep(2)
      } else {
        throw new Error(data.message || 'Failed to generate proposals')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Erreur lors de la génération des propositions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopicSelection = (topic: TopicProposal) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic))
    } else {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  const generateArticles = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/magazine?endpoint=create-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected_topics: selectedTopics })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate articles: ${errorText}`)
      }

      const data = await response.json()
      if (data.status === 'success') {
        setArticles(data.articles)
        setStep(4)
      } else {
        throw new Error(data.message || 'Failed to generate articles')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Erreur lors de la génération des articles')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Responsable éditorial: Recherche de sujets d'articles</h2>
            {isLoading ? (
              <div className="text-center">
                <p>Génération des propositions de sujets...</p>
              </div>
            ) : (
              <Button
                onClick={generateTopicProposals}
                disabled={isLoading}
                className="w-full"
              >
                Générer les propositions de sujets
              </Button>
            )}
          </div>
        )

      case 2:
        const agents = Object.keys(proposals)
        const currentAgent = agents[currentAgentIndex]
        const currentTopics = proposals[currentAgent] || []

        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Sélection des sujets: {currentAgent}</h2>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {currentTopics.map((topic, index) => (
                <div key={index} className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={() => handleTopicSelection(topic)}
                    className="h-4 w-4"
                  />
                  <label className="flex-1">
                    {topic.topic}
                  </label>
                </div>
              ))}
            </ScrollArea>
            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentAgentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentAgentIndex === 0}
              >
                Agent précédent
              </Button>
              <Button
                onClick={() => {
                  if (currentAgentIndex < agents.length - 1) {
                    setCurrentAgentIndex(prev => prev + 1)
                  } else {
                    setStep(3)
                  }
                }}
              >
                {currentAgentIndex < agents.length - 1 ? 'Agent suivant' : 'Passer à la génération'}
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Génération des articles</h2>
            <div className="space-y-4">
              <p>Sujets sélectionnés: {selectedTopics.length}</p>
              <Button
                onClick={generateArticles}
                disabled={isLoading || selectedTopics.length === 0}
                className="w-full"
              >
                {isLoading ? 'Génération en cours...' : 'Générer les articles'}
              </Button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Articles générés</h2>
            <ScrollArea className="h-[600px] rounded-md border p-4">
              {articles.map((article, index) => (
                <Card key={index} className="p-4 mb-4">
                  <h3 className="font-medium mb-2">Article {index + 1} ({article.language})</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {article.content.slice(0, 200)}...
                  </p>
                  <a
                    href={`/articles/${article.rtf_file}`}
                    download
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Télécharger l'article
                  </a>
                </Card>
              ))}
            </ScrollArea>
            <Button
              onClick={() => {
                setStep(1)
                setProposals({})
                setSelectedTopics([])
                setArticles([])
                setCurrentAgentIndex(0)
              }}
              className="w-full"
            >
              Recommencer
            </Button>
          </div>
        )
    }
  }

  return (
    <Card className="p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      {renderStep()}
    </Card>
  )
} 