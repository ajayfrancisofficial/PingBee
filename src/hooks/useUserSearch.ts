import { useState, useCallback } from 'react';
import { userApi } from '../api/RESTApi/userApi';
import type { UserSearchResponse } from '../types/ApiTypes/RestApiTypes/restApiTypes';

export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await userApi.searchUsers(query);
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('[useUserSearch] Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchQuery,
    users,
    isLoading,
    handleSearch,
  };
}
