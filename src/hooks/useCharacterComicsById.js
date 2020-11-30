import { useEffect, useState } from "react";
import { MarvelCharactersApiService } from "service";

export function useCharacterComicsById({ id }) {
  const [result, setResult] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    MarvelCharactersApiService.getByIdComics(id)
      .then((response) => setResult(response?.results))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [id]);

  return {
    result,
    loading,
    error,
  };
}
