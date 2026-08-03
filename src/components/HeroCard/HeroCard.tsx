import { useState } from 'react'
import { motion } from 'motion/react'
import { Zap } from 'lucide-react'
import type { CharacterFilter, Hero } from '@/types'
import { heroImageUrl } from '@/lib/heroes/hero-image'

const FALLBACK_COLORS = [
  '#e8272a',
  '#ffe600',
  '#14b8a6',
  '#0a0a0a',
  '#4a6fa5',
  '#27ae60'
]

const fallbackColor = (name?: string) => {
  const hash = (name ?? '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]
}

const initialLetter = (name?: string) =>
  name ? name.charAt(0).toUpperCase() : '?'

export const HeroCard = ({
  hero,
  query,
  filter,
  page
}: {
  hero: Hero
  query?: string
  filter?: CharacterFilter
  page?: number
}) => {
  const [imageFailed, setImageFailed] = useState(false)
  const name = hero.name ?? 'Unknown'
  const alignment = hero.biography?.alignment
  const power = hero.powerstats?.power
  const powerValue = Number(power)
  const showPower =
    power !== undefined && power !== '-' && !Number.isNaN(powerValue)

  const href = (() => {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (filter && filter !== 'all') params.set('filter', filter)
    if (page && page > 1) params.set('page', String(page))
    const search = params.toString()
    return search ? `/details/${hero.id}?${search}` : `/details/${hero.id}`
  })()

  return (
    <motion.a
      href={href}
      whileHover={{ x: -4, y: -4, boxShadow: '8px 8px 0 #0a0a0a' }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className='block cursor-pointer border-4 border-border bg-white shadow-hard overflow-hidden'
    >
      <div className='relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b-4 border-border'>
        {imageFailed ? (
          <div
            className='halftone flex h-full w-full items-center justify-center'
            style={{ backgroundColor: fallbackColor(name) }}
          >
            <span
              className='font-display text-[5.5rem] uppercase leading-none text-white'
              style={{ opacity: 0.85 }}
            >
              {initialLetter(name)}
            </span>
          </div>
        ) : (
          <img
            src={heroImageUrl(hero.id, hero.name) ?? ''}
            alt={`${name} portrait`}
            onError={() => setImageFailed(true)}
            className='h-full w-full object-cover'
            loading='lazy'
          />
        )}
        <span className='absolute left-2 top-2 bg-foreground px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.05em] text-secondary'>
          {alignment === 'bad' ? (
            <span className='text-primary'>★ VILLAIN</span>
          ) : (
            '◆ HERO'
          )}
        </span>
        {showPower && (
          <span className='absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 font-mono text-[0.6rem] text-white'>
            <Zap size={9} aria-hidden /> {powerValue}
          </span>
        )}
      </div>
      <div className='border-t-0 p-4'>
        <h3 className='truncate font-display text-xl uppercase leading-tight'>
          {name}
        </h3>
        {hero.biography?.['full-name'] && (
          <p className='mt-0.5 truncate text-sm font-semibold text-muted-foreground'>
            {hero.biography['full-name']}
          </p>
        )}
        <div className='mt-3 flex flex-wrap gap-1.5'>
          {hero.biography?.publisher && hero.biography.publisher !== '-' && (
            <span className='border-2 border-border bg-background px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide'>
              {hero.biography.publisher}
            </span>
          )}
        </div>
        {showPower && (
          <div className='mt-4'>
            <div className='flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-wide text-muted-foreground'>
              <span>POWER LEVEL</span>
              <span>{Math.min(100, Math.max(0, powerValue))}/100</span>
            </div>
            <div className='mt-1 h-3 border-2 border-border bg-white'>
              <div
                className='h-full bg-primary'
                style={{ width: `${Math.min(100, Math.max(0, powerValue))}%` }}
              />
            </div>
          </div>
        )}
        <div className='mt-4 border-t-0'>
          <span className='block bg-foreground px-4 py-2 text-center font-mono text-[0.65rem] uppercase tracking-[0.05em] text-white shadow-hard-yellow'>
            VIEW DETAILS →
          </span>
        </div>
      </div>
    </motion.a>
  )
}
