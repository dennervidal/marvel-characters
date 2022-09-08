import React, { useState } from 'react'
import { InputAdornment } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { IconButton, Input, SearchDiv, Typography } from './styled'
import { useRouter } from 'next/router'

export const SearchHeader = ({
  mobile,
  query,
  setPage
}: {
  mobile: boolean
  query: string | null | undefined
  setPage: (page: number) => void
}) => {
  const router = useRouter()
  const [search, setSearch] = useState<string>(query ?? '')

  const redirectToSearch = () => {
    setPage(1)
    router.push(`/?query=${search}`).then()
  }

  const onKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      redirectToSearch()
    }
  }

  return (
    <SearchDiv mobile={mobile}>
      <Typography variant='h5' fontSize={32} color='textPrimary'>
        Find a character
      </Typography>
      <Typography
        variant='subtitle2'
        color='textPrimary'
        marginMultiplier={mobile ? 3 : 2}
      >
        Character name
      </Typography>
      <Input
        variant='outlined'
        placeholder='Search'
        size='small'
        onKeyDown={onKeyDown}
        value={search}
        onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
          setSearch(e?.target?.value)
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton onClick={redirectToSearch}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
        mobile={mobile}
      />
    </SearchDiv>
  )
}
