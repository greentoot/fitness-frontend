"use client"

import { useEffect, useState } from 'react'

export function IntroAnimation() {
  const [shouldShow, setShouldShow] = useState(true)

  useEffect(() => {
    // Hide animation after it completes
    const timer = setTimeout(() => {
      setShouldShow(false)
    }, 4500) // Match this with your CSS animation duration

    return () => clearTimeout(timer)
  }, [])

  if (!shouldShow) return null

  return (
    <div className="intro-animation">
      <div className="animation-container">
        <div className="fitness-challenges">
          <span className="letter F">F</span>
          <span className="rest-text">ITNESS CHALLENGES</span>
        </div>
        <span className="ai-text">AI</span>
      </div>
    </div>
  )
} 