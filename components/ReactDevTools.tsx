'use client'


export function ReactDevTools() {
  // Temporarily disabled to fix DOM manipulation errors
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     // Load React DevTools
  //     const script = document.createElement('script')
  //     script.src = 'http://localhost:8097'
  //     script.async = true
  //     document.head.appendChild(script)

  //     return () => {
  //       document.head.removeChild(script)
  //     }
  //   }
  // }, [])

  return null
} 