import type { ReactNode } from 'react'
import { Spinner } from './Spinner'

export const LoadingPlaceholder = ({
  loading,
  children
}: {
  loading: boolean
  children: ReactNode
}) => <>{loading ? <Spinner /> : children}</>
