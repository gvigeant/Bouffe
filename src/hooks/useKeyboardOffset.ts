import { useState, useEffect } from 'react'

export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const handler = () => {
      const kb = window.innerHeight - viewport.height
      setOffset(kb > 0 ? kb : 0)
    }

    viewport.addEventListener('resize', handler)
    return () => viewport.removeEventListener('resize', handler)
  }, [])

  return offset
}
