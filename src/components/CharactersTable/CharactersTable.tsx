import React from 'react'
import { TableRow as MuiTRow, TableBody, TableHead } from '@material-ui/core'
import {
  Table,
  Typography,
  TableCell,
  TableRow,
  ColumnDiv,
  RowDiv,
  Avatar
} from './styled'
import { Character } from 'types'
import { useRouter } from 'next/router'

export const CharactersTable = ({
  characters,
  mobile
}: {
  characters: Character[] | undefined
  mobile: boolean
}) => {
  const router = useRouter()
  const redirectToDetails = (id?: string | number) => {
    router.push(`/details/${id}`).then()
  }

  return (
    <Table>
      <TableHead>
        <MuiTRow>
          <TableCell key='character' header>
            <Typography
              variant='subtitle2'
              fontSize={12}
              marginLeft={mobile && 68}
              header
            >
              Character
            </Typography>
          </TableCell>
          <TableCell key='series' header mobile={mobile}>
            <Typography variant='subtitle2' fontSize={12} header>
              Series
            </Typography>
          </TableCell>
          <TableCell key='events' header mobile={mobile}>
            <Typography variant='subtitle2' fontSize={12} header>
              Events
            </Typography>
          </TableCell>
        </MuiTRow>
      </TableHead>
      <TableBody>
        {(characters ?? []).map(
          ({ name, thumbnail, events, series, id }, idx) => (
            <TableRow
              key={`${name}-${idx}`}
              mobile={mobile}
              onClick={() => redirectToDetails(id)}
            >
              <TableCell>
                <RowDiv>
                  {thumbnail?.path && (
                    <Avatar
                      width={48}
                      height={48}
                      src={`${thumbnail?.path}.${thumbnail?.extension}`}
                    />
                  )}
                  <Typography
                    variant='subtitle2'
                    fontWeight={600}
                    fontSize={16}
                    marginLeft={24}
                  >
                    {name}
                  </Typography>
                </RowDiv>
              </TableCell>
              <TableCell mobile={mobile}>
                <ColumnDiv>
                  {(series?.items?.slice(0, 3) ?? []).map(({ name }, idx) => (
                    <Typography key={`${name}-${idx}`} variant='caption'>
                      {name}
                    </Typography>
                  ))}
                </ColumnDiv>
              </TableCell>
              <TableCell mobile={mobile}>
                <ColumnDiv>
                  {(events?.items?.slice(0, 3) ?? []).map(({ name }, idx) => (
                    <Typography key={`${name}-${idx}`} variant='caption'>
                      {name}
                    </Typography>
                  ))}
                </ColumnDiv>
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  )
}
