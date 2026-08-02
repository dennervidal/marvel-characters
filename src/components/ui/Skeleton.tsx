export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div
    aria-hidden='true'
    className={`animate-pulse bg-gray-light ${className}`}
  />
)
