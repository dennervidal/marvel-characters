import { AlertTriangle, Zap } from 'lucide-react'

const SUGGESTIONS = ['HULK', 'IRON MAN', 'THOR', 'WONDER WOMAN']

export const EmptyState = ({
  query,
  onClear,
  onSuggestion
}: {
  query: string
  onClear: () => void
  onSuggestion: (query: string) => void
}) => (
  <div className='mx-auto w-full max-w-xl border-4 border-border bg-white shadow-hard-8'>
    <div className='stripes-yellow h-3 border-b-4 border-border' />
    <div className='flex flex-col items-center gap-3 px-6 py-10 text-center'>
      <AlertTriangle size={28} className='text-primary' aria-hidden />
      <span className='font-display text-[5rem] leading-none'>0</span>
      <h2 className='font-display text-2xl uppercase'>NO HEROES FOUND</h2>
      <div className='border-2 border-border bg-background px-4 py-3 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground'>
        {query ? (
          <>
            YOUR SEARCH FOR{' '}
            <span className='mx-1 border border-border bg-secondary px-1 py-0.5 text-foreground'>
              {query}
            </span>{' '}
            RETURNED 0 RESULTS
          </>
        ) : (
          <>SEARCH THE HERO BASE TO DISCOVER SUPERHUMANS</>
        )}
      </div>
      <button
        type='button'
        onClick={onClear}
        className='mt-2 flex items-center gap-2 border-4 border-border bg-primary px-6 py-2.5 font-mono text-[0.65rem] uppercase tracking-wide text-white shadow-hard transition-colors hover:bg-[#c0392b]'
      >
        <Zap size={12} aria-hidden /> CLEAR FILTERS
      </button>
      {!query && (
        <div className='mt-4'>
          <p className='font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground'>
            TRY ONE OF THESE
          </p>
          <div className='mt-2 flex flex-wrap justify-center gap-2'>
            {SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                type='button'
                onClick={() => onSuggestion(suggestion)}
                className='border-2 border-border bg-background px-2.5 py-1 text-sm font-semibold uppercase shadow-hard-3 hover:bg-secondary'
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    <div className='stripes-red h-3 border-t-4 border-border' />
  </div>
)
