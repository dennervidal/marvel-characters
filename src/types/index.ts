export type Url = {
  type?: string
  url?: string
}
export type Image = {
  path?: string
  extension?: string
}
export type ComicSummary = {
  resourceURI?: string
  name?: string
}
export type ComicList = {
  available?: number
  returned?: number
  collectionURI?: string
  items?: ComicSummary[]
}
export type StorySummary = {
  resourceURI?: string
  name?: string
  type?: string
}
export type StoryList = {
  available?: number
  returned?: number
  collectionURI?: string
  items?: StorySummary[]
}
export type EventSummary = {
  resourceURI?: string
  name?: string
}
export type EventList = {
  available?: number
  returned?: number
  collectionURI?: string
  items?: EventSummary[]
}

export type SeriesSummary = {
  resourceURI?: string
  name?: string
}
export type SeriesList = {
  available?: number
  returned?: number
  collectionURI?: string
  items?: SeriesSummary[]
}
export type Character = {
  id?: number
  name?: string
  description?: string
  modified?: Date
  resourceURI?: string
  urls?: Url[]
  thumbnail?: Image
  comics?: ComicList
  stories?: StoryList
  events?: EventList
  series?: SeriesList
}

export type Comic = {
  id?: number
  thumbnail?: Image
  title?: string
}
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
