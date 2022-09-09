import React from 'react'
import Pagination from '@material-ui/lab/Pagination'
import { MainDiv } from './styled'
import { useNavigation } from './hooks'

export const Navigation = () => {
  const { isDetails, page, total, handlePageChange } = useNavigation()

  return (
    <MainDiv isDetails={isDetails}>
      <Pagination
        shape='rounded'
        showFirstButton={page > 1}
        showLastButton={page < total}
        count={total}
        page={page}
        onChange={handlePageChange}
        siblingCount={0}
        hideNextButton={page === total}
        hidePrevButton={page === 1}
      />
    </MainDiv>
  )
}

Navigation.propTypes = {}
