import React, { ReactNode, useState } from 'react'
import PropTypes from 'prop-types'
import { PaginationContext } from './PaginationContextType'

const PaginationContextProvider = ({ children }: { children: ReactNode }) => {
  const [page, _setPage] = useState<number>(1)
  const [total, _setTotal] = useState<number>(0)

  const gotoPage = (pageNumber: number) => {
    _setPage(pageNumber)
  }

  const setTotal = (totalNumber: number) => {
    _setTotal(totalNumber)
  }

  return (
    <PaginationContext.Provider
      value={{
        page,
        gotoPage,
        total,
        setTotal
      }}
    >
      {children}
    </PaginationContext.Provider>
  )
}

PaginationContextProvider.propTypes = {
  children: PropTypes.element.isRequired
}

export { PaginationContextProvider }
