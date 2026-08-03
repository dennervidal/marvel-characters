export type Powerstats = {
  intelligence?: string
  strength?: string
  speed?: string
  durability?: string
  power?: string
  combat?: string
}
export type Biography = {
  'full-name'?: string
  'alter-egos'?: string
  aliases?: string[]
  'place-of-birth'?: string
  'first-appearance'?: string
  publisher?: string
  alignment?: string
}
export type Appearance = {
  gender?: string
  race?: string
  height?: string[]
  weight?: string[]
  'eye-color'?: string
  'hair-color'?: string
}
export type Work = {
  occupation?: string
  base?: string
}
export type Connections = {
  'group-affiliation'?: string
  relatives?: string
}
export type Hero = {
  id?: string
  name?: string
  powerstats?: Powerstats
  biography?: Biography
  appearance?: Appearance
  work?: Work
  connections?: Connections
  image?: { url?: string }
}
export type CharacterFilter =
  'all' | 'heroes' | 'villains' | 'marvel' | 'dc' | 'others'
export type CharacterCounts = {
  heroes: number
  villains: number
  marvel: number
  dc: number
  others: number
}
