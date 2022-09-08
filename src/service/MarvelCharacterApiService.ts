import { getCharactersList, ROOT_MARVEL_API_URL } from './functions'

export class MarvelCharactersApiService {
  static async getPaginated(
    nameStartsWith: string | undefined | null,
    page: number,
    limit: number
  ) {
    return await fetch(getCharactersList({ nameStartsWith, page, limit }))
      .then(async response => {
        if (response.status != 200) throw Error(String(response.status))
        return await response.json()
      })
      .then(responseJson => responseJson?.data)
  }

  static async getById(charId: string | number | undefined) {
    return await fetch(
      `${ROOT_MARVEL_API_URL}/characters/${charId}?apikey=${process.env.NEXT_PUBLIC_API_PUBLIC_KEY}`
    )
      .then(async response => {
        if (response.status != 200) throw Error(String(response.status))
        return await response.json()
      })
      .then(responseJson => responseJson?.data)
  }

  static async getByIdComics(charId: string | number | undefined) {
    return await fetch(
      `${ROOT_MARVEL_API_URL}/characters/${charId}/comics?apikey=${process.env.NEXT_PUBLIC_API_PUBLIC_KEY}`
    )
      .then(async response => {
        if (response.status != 200) throw Error(String(response.status))
        return await response.json()
      })
      .then(responseJson => responseJson?.data)
  }
}
