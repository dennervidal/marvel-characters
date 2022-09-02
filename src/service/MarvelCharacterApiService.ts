const ROOT_MARVEL_API_URL = "https://gateway.marvel.com/v1/public";

const getCharactersList = ({
  nameStartsWith,
  page = 0,
  limit = 20,
}: {
  nameStartsWith: string | undefined | null;
  page: number;
  limit: number;
}) => {
  let nameParam = "";

  if (nameStartsWith) {
    nameParam = `nameStartsWith=${nameStartsWith}&`;
  }

  return `${ROOT_MARVEL_API_URL}/characters?limit=${limit}&offset=${
    page * limit
  }&${nameParam}apikey=${process.env.REACT_APP_API_PUBLIC_KEY}`;
};

export class MarvelCharactersApiService {
  static getPaginated(
    nameStartsWith: string | undefined | null,
    page: number,
    limit: number
  ) {
    return fetch(getCharactersList({ nameStartsWith, page, limit }))
      .then((response) => response.json())
      .then((responseJson) => responseJson?.data);
  }
  static getById(charId: string | number | undefined) {
    return fetch(
      `${ROOT_MARVEL_API_URL}/characters/${charId}?apikey=${process.env.REACT_APP_API_PUBLIC_KEY}`
    )
      .then((response) => response.json())
      .then((responseJson) => responseJson?.data);
  }
  static getByIdComics(charId: string | number | undefined) {
    return fetch(
      `${ROOT_MARVEL_API_URL}/characters/${charId}/comics?apikey=${process.env.REACT_APP_API_PUBLIC_KEY}`
    )
      .then((response) => response.json())
      .then((responseJson) => responseJson?.data);
  }
}
