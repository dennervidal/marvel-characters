import type { ElementType, ReactNode } from 'react'

const variantClasses: Record<string, string> = {
  h1: 'text-5xl font-bold',
  h2: 'text-4xl font-bold',
  h3: 'text-3xl font-bold',
  h4: 'text-2xl font-bold',
  h5: 'text-xl font-bold',
  h6: 'text-lg font-semibold',
  subtitle: 'text-sm',
  body: 'text-base',
  caption: 'text-xs'
}

export const Typography = ({
  variant = 'body',
  component,
  className = '',
  children
}: {
  variant?: keyof typeof variantClasses
  component?: ElementType
  className?: string
  children: ReactNode
}) => {
  const Tag = component ?? variant
  return (
    <Tag className={`${variantClasses[variant]} ${className}`}>{children}</Tag>
  )
}
