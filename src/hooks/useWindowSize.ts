import { useEffect, useState } from 'react'

export const isAndroid = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()

  return userAgent.includes('android')
}

export function useWindowSize() {
  const [size, setSize] = useState([0, 0])

  useEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }

    // Avoid Android keyboard overflow
    if (!isAndroid()) {
      window.addEventListener('resize', updateSize)
    }
    window.addEventListener('orientationchange', updateSize)
    updateSize()

    return () => {
      if (!isAndroid()) {
        window.removeEventListener('resize', updateSize)
      }

      return window.removeEventListener('orientationchange', updateSize)
    }
  }, [])

  return size
}
