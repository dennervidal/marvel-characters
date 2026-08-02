import { Avatar, Typography } from '@/components/ui'
import { heroImageUrl } from '@/lib/heroes/hero-image'
import type { Hero } from '@/types'

export const CharactersTable = ({
  characters
}: {
  characters: Hero[] | undefined
}) => {
  const redirectToDetails = (id?: string) => {
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
            Publisher
          </th>
          <th scope='col' className='hidden px-4 py-3 md:table-cell'>
            Alignment
          </th>
        </tr>
      </thead>
      <tbody>
        {(characters ?? []).map(({ name, biography, id }) => {
          const avatarSrc = heroImageUrl(id, name)
          return (
            <tr
              key={`${name}-${id}`}
              onClick={() => redirectToDetails(id)}
              className='cursor-pointer border-b border-line last:border-b-0 hover:bg-background'
            >
              <td className='px-4 py-3'>
                <div className='flex items-center gap-6'>
                  {avatarSrc && (
                    <Avatar
                      width={48}
                      height={48}
                      src={avatarSrc}
                      alt={name ?? 'character thumbnail'}
                      onError={event => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <Typography variant='body' className='font-semibold'>
                    {name}
                  </Typography>
                </div>
              </td>
              <td className='hidden px-4 py-3 md:table-cell'>
                {biography?.publisher && biography.publisher !== '-' && (
                  <Typography variant='caption' className='block'>
                    {biography.publisher}
                  </Typography>
                )}
              </td>
              <td className='hidden px-4 py-3 md:table-cell'>
                {biography?.alignment && biography.alignment !== '-' && (
                  <Typography variant='caption' className='block'>
                    {biography.alignment}
                  </Typography>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
