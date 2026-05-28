import { useEffect, useState } from 'react'

interface VisualViewportState {
  height: number
  offsetTop: number
  keyboardInset: number
}

function getInitialState(): VisualViewportState {
  if (typeof window === 'undefined') {
    return { height: 0, offsetTop: 0, keyboardInset: 0 }
  }
  const vv = window.visualViewport
  if (!vv) {
    return { height: window.innerHeight, offsetTop: 0, keyboardInset: 0 }
  }
  return {
    height: vv.height,
    offsetTop: vv.offsetTop,
    keyboardInset: Math.max(0, window.innerHeight - vv.height - vv.offsetTop),
  }
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(getInitialState)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      setState({
        height: vv.height,
        offsetTop: vv.offsetTop,
        keyboardInset: Math.max(0, window.innerHeight - vv.height - vv.offsetTop),
      })
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return state
}
