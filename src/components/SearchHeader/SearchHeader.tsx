import React from 'react'
import { InputAdornment } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { IconButton, Input, SearchDiv, Typography } from './styled'
import { useSearchHeader } from './hooks'

export const SearchHeader = ({
  query
}: {
  query: string | null | undefined
}) => {
  const { onKeyDown, redirectToSearch, mobile, inputRef } =
    useSearchHeader(query)

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
        inputRef={inputRef}
        variant='outlined'
        placeholder='Search'
        size='small'
        onKeyDown={onKeyDown}
        defaultValue={query}
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
