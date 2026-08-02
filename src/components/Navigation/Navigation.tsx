import { Pagination } from '@/components/ui'

export const Navigation = ({
  page,
  total,
  onChange
}: {
  page: number
  total: number
  onChange: (page: number) => void
}) => (
  <Pagination count={total} page={page} onChange={onChange} siblingCount={0} />
)
