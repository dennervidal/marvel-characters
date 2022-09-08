import React, { useContext } from 'react'
import Pagination from '@material-ui/lab/Pagination'
import { PaginationContext } from 'context'
import { MainDiv } from './styled'
import { useRouter } from 'next/router'

export const Navigation = () => {
  const router = useRouter()
  const isDetails = router.pathname.includes('/details')
  const { page, total, gotoPage } = useContext(PaginationContext)

  return (
    <MainDiv isDetails={isDetails}>
      <Pagination
        shape='rounded'
        showFirstButton={page > 1}
        showLastButton={page < total}
        count={total}
        page={page}
        onChange={(_, pageNumber) => gotoPage(pageNumber)}
        siblingCount={0}
        hideNextButton={page === total}
        hidePrevButton={page === 1}
      />
    </MainDiv>
  )
}

Navigation.propTypes = {}
