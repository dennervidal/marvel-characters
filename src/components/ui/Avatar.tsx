export const Avatar = ({
  src,
  alt,
  width,
  height,
  className = ''
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={`object-cover ${className}`}
  />
)
