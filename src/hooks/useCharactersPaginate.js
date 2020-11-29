import { useEffect, useState } from "react";
import { MarvelCharactersApiService } from "service";

const PAGE_LIMIT = 4;

export function useCharactersPaginate({
  nameStartsWith = undefined,
  setTotal,
  page: currentPage,
} = {}) {
  const [results, setResults] = useState(undefined);
  const [error, setErros] = useState(undefined);
  const [loading, setLoading] = useState(!!nameStartsWith);
  const page = currentPage - 1;

  useEffect(() => {
    setLoading(true);
    MarvelCharactersApiService.getPaginated(nameStartsWith, page, PAGE_LIMIT)
      .then((response) => {
        setTotal(Math.ceil(response?.total / PAGE_LIMIT));
        setResults(response?.results || []);
      })
      .catch((e) => setErros(e))
      .finally(() => setLoading(false));
  }, [nameStartsWith, page, setTotal]);

  return {
    results,
    loading,
    error,
  };
}
