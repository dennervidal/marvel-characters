import type { ElementType, ReactNode } from 'react'

const variantClasses: Record<string, string> = {
  h1: 'font-display text-5xl font-normal uppercase',
  h2: 'font-display text-4xl font-normal uppercase',
  h3: 'font-display text-3xl font-normal uppercase',
  h4: 'text-2xl font-bold',
  h5: 'text-xl font-bold',
  h6: 'text-lg font-semibold',
  subtitle: 'font-body text-sm',
  body: 'font-body text-base',
  caption: 'text-xs',
  mono: 'font-mono text-xs uppercase tracking-wider'
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
  caption: 'span',
  mono: 'span'
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
