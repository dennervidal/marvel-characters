import { Avatar, Typography } from '@/components/ui'
import type { Character } from '@/types'

export const CharactersTable = ({
  characters
}: {
  characters: Character[] | undefined
}) => {
  const redirectToDetails = (id?: number) => {
    if (id) window.location.assign(`/details/${id}`)
  }

  return (
    <table className='w-full border-collapse bg-surface'>
      <thead>
        <tr className='border-b border-line text-left'>
          <th scope='col' className='px-4 py-3'>
            Character
          </th>
          <th scope='col' className='hidden px-4 py-3 md:table-cell'>
            Series
          </th>
          <th scope='col' className='hidden px-4 py-3 md:table-cell'>
            Events
          </th>
        </tr>
      </thead>
      <tbody>
        {(characters ?? []).map(({ name, thumbnail, events, series, id }) => (
          <tr
            key={`${name}-${id}`}
            onClick={() => redirectToDetails(id)}
            className='cursor-pointer border-b border-line last:border-b-0 hover:bg-background'
          >
            <td className='px-4 py-3'>
              <div className='flex items-center gap-6'>
                {thumbnail?.path && (
                  <Avatar
                    width={48}
                    height={48}
                    src={`${thumbnail.path.replace(/^http:/, 'https:')}.${thumbnail.extension}`}
                    alt={name ?? 'character thumbnail'}
                  />
                )}
                <Typography variant='body' className='font-semibold'>
                  {name}
                </Typography>
              </div>
            </td>
            <td className='hidden px-4 py-3 md:table-cell'>
              {(series?.items?.slice(0, 3) ?? []).map(
                ({ name: seriesName }) => (
                  <Typography
                    key={seriesName}
                    variant='caption'
                    className='block'
                  >
                    {seriesName}
                  </Typography>
                )
              )}
            </td>
            <td className='hidden px-4 py-3 md:table-cell'>
              {(events?.items?.slice(0, 3) ?? []).map(({ name: eventName }) => (
                <Typography key={eventName} variant='caption' className='block'>
                  {eventName}
                </Typography>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
