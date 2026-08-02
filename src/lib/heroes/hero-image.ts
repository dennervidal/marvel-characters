const AKABAB_IMAGE_URL =
  'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg'

const SLUG_EXCEPTIONS: Record<string, string> = {
  '114': 'bling!',
  '353': 'james-t.-kirk',
  '538': 'ras-al-ghul'
}

export const heroImageUrl = (
  id: string | undefined,
  name: string | undefined
): string | undefined => {
  if (!id || !name) return undefined
  const slug =
    SLUG_EXCEPTIONS[id] ??
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  return `${AKABAB_IMAGE_URL}/${id}-${slug}.jpg`
}
