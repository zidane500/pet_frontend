import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { listingsApi } from "../api/listings";
import type { ListingFilters } from "../api/listings";

export interface ActiveFilters {
  species: string[];
  type: string[];
  minPrice: string;
  maxPrice: string;
  city: string;
  vaccinated: boolean;
  adoptable: boolean;
}

export const DEFAULT_FILTERS: ActiveFilters = {
  species: [],
  type: [],
  minPrice: "",
  maxPrice: "",
  city: "",
  vaccinated: false,
  adoptable: false,
};

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebounced] = useState(initialQuery);
  const [activeFilters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "priceAsc" | "priceDesc"
  >("newest");
  const [page, setPage] = useState(1);

  // Debounce 400ms — évite d'appeler l'API à chaque frappe
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset page quand les critères changent
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeFilters, sortBy]);

  const apiFilters: ListingFilters = {
    search: debouncedQuery || undefined,
    species: activeFilters.species[0] || undefined,
    type: activeFilters.type[0] || undefined,
    city: activeFilters.city || undefined,
    min_price: activeFilters.minPrice
      ? Number(activeFilters.minPrice)
      : undefined,
    max_price: activeFilters.maxPrice
      ? Number(activeFilters.maxPrice)
      : undefined,
    page,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", apiFilters],
    queryFn: () => listingsApi.getAll(apiFilters),
    staleTime: 30_000,
  });

  const results = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setQuery("");
    setPage(1);
  }, []);

  return {
    query,
    setQuery,
    activeFilters,
    setFilters,
    sortBy,
    setSortBy,
    page,
    setPage,
    results,
    total,
    totalPages,
    isLoading,
    isFetching,
    clearFilters,
  };
}
