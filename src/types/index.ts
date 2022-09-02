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
