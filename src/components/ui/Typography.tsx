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

const variantTags: Record<string, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle: 'span',
  body: 'p',
  caption: 'span'
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
  const Tag = component ?? variantTags[variant]
  return (
    <Tag className={`${variantClasses[variant]} ${className}`}>{children}</Tag>
  )
}
