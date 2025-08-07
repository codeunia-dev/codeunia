import dynamic from 'next/dynamic'
import React from 'react'

// Dynamic imports for heavy components
export const DynamicGlobe = dynamic(() => import('@/components/ui/globe').then(mod => mod.default), {
  ssr: false,
  loading: () => React.createElement('div', { 
    className: "w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-100 animate-pulse rounded-lg" 
  })
})

export const DynamicVortex = dynamic(() => import('@/components/ui/vortex').then(mod => mod.default), {
  ssr: false,
  loading: () => React.createElement('div', { 
    className: "w-full h-64 bg-gradient-to-br from-purple-50 to-pink-100 animate-pulse rounded-lg" 
  })
})

export const DynamicParticles = dynamic(() => import('@/components/ui/particles').then(mod => mod.default), {
  ssr: false,
  loading: () => React.createElement('div', { 
    className: "w-full h-64 bg-gradient-to-br from-green-50 to-emerald-100 animate-pulse rounded-lg" 
  })
})

export const DynamicCertificateGenerator = dynamic(() => import('@/components/CertificateGenerator').then(mod => mod.default), {
  ssr: false,
  loading: () => React.createElement('div', { 
    className: "w-full h-96 bg-gradient-to-br from-yellow-50 to-orange-100 animate-pulse rounded-lg" 
  })
})

export const DynamicTestManager = dynamic(() => import('@/components/admin/TestManager').then(mod => mod.default), {
  ssr: false,
  loading: () => React.createElement('div', { 
    className: "w-full h-96 bg-gradient-to-br from-red-50 to-pink-100 animate-pulse rounded-lg" 
  })
})

// Utility function for lazy loading components
export function lazyLoad<T extends React.ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean
    loading?: () => React.ReactNode
  }
) {
  return dynamic(() => importFunc().then(mod => mod.default), {
    ssr: options?.ssr ?? false,
    loading: options?.loading,
  })
} 