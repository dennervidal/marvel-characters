import type { SyntheticEvent } from 'react'

export const Avatar = ({
  src,
  alt,
  width,
  height,
  className = '',
  onError
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void
}) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={`object-cover ${className}`}
    onError={onError}
  />
)
