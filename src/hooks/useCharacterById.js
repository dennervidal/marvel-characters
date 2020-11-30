import { useEffect, useState } from "react";
import { MarvelCharactersApiService } from "service";

export function useCharacterById({ id }) {
  const [result, setResult] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    MarvelCharactersApiService.getById(id)
      .then((response) => setResult(response?.results[0]))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [id]);

  return {
    result,
    loading,
    error,
  };
}
