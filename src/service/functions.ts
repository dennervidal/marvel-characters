import { v4 as uuidv4 } from 'uuid'
import md5 from 'crypto-js/md5'

export const ROOT_MARVEL_API_URL = 'https://gateway.marvel.com/v1/public'
export const PAGE_LIMIT = 10

export const getCharactersList = ({
  nameStartsWith,
  page = 0,
  limit = 20
}: {
  nameStartsWith: string | undefined | null
  page: number
  limit: number
}) => {
  let nameParam = ''

  if (nameStartsWith) {
    nameParam = `nameStartsWith=${nameStartsWith}&`
  }

  return `${ROOT_MARVEL_API_URL}/characters?limit=${limit}&offset=${
    page * limit
  }&${nameParam}apikey=${process.env.NEXT_PUBLIC_API_PUBLIC_KEY}`
}

export const getInitialPropsUrl = () => {
  const uuid = uuidv4()
  const hash = md5(
    `${uuid}${process.env.MARVEL_PRIVATE_KEY}${process.env.NEXT_PUBLIC_API_PUBLIC_KEY}`
  ).toString()
  return `${ROOT_MARVEL_API_URL}/characters?limit=${PAGE_LIMIT}&offset=0&ts=${uuid}&hash=${hash}&apikey=${process.env.NEXT_PUBLIC_API_PUBLIC_KEY}`
}
