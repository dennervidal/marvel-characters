import React, { ReactNode } from 'react'
import PropTypes from 'prop-types'
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

LoadingPlaceholder.propTypes = {
  children: PropTypes.node.isRequired,
  /** boolean that represents if parent component is loading  */
  loading: PropTypes.bool.isRequired
}

export { LoadingPlaceholder }
