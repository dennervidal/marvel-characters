import { useEffect, useState } from "react";
import { MarvelCharactersApiService } from "service";
import { Character } from "../types";

type UseCharacterByIdParams = {
  id: string | number | undefined;
};
type UseCharacterByIdReturn = {
  result: Character | undefined;
  loading: boolean;
  error: any;
};

export function useCharacterById({
  id,
}: UseCharacterByIdParams): UseCharacterByIdReturn {
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
