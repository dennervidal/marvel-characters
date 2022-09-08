import React, { ReactNode } from 'react'
import { Loading } from 'components/Loading'

const LoadingPlaceholder = ({
  children,
  loading
}: {
  children: ReactNode
  loading: boolean
}) => (
  <>
    {loading ? (
      <Loading />
    ) : (
      React.Children.map(children, (child: any, index) =>
        React.cloneElement(child, { id: index })
      )
    )}
  </>
)

export { LoadingPlaceholder }
