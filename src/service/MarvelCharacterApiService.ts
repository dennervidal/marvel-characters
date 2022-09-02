const ROOT_MARVEL_API_URL = 'https://gateway.marvel.com/v1/public'

const getCharactersList = ({
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
  }&${nameParam}apikey=${process.env.REACT_APP_API_PUBLIC_KEY}`
}

export class MarvelCharactersApiService {
  static async getPaginated(
    nameStartsWith: string | undefined | null,
    page: number,
    limit: number
  ) {
    return await fetch(getCharactersList({ nameStartsWith, page, limit }))
      .then(async response => await response.json())
      .then(responseJson => responseJson?.data)
  }

  static async getById(charId: string | number | undefined) {
    return await fetch(
      `${ROOT_MARVEL_API_URL}/characters/${charId}?apikey=${process.env.REACT_APP_API_PUBLIC_KEY}`
    )
      .then(async response => await response.json())
      .then(responseJson => responseJson?.data)
  }

  static async getByIdComics(charId: string | number | undefined) {
    return await fetch(
      `${ROOT_MARVEL_API_URL}/characters/${charId}/comics?apikey=${process.env.REACT_APP_API_PUBLIC_KEY}`
    )
      .then(async response => await response.json())
      .then(responseJson => responseJson?.data)
  }
}
