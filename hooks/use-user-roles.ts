import { useState, useEffect } from 'react';

interface Role {
  id: number;
  roleName: string;
}

export function useUserRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get the current user
        const userResponse = await fetch('/api/users/me');
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const user = await userResponse.json();
        
        // Then get the user's roles
        const rolesResponse = await fetch(`/api/users/${user.id}/roles`);
        if (!rolesResponse.ok) {
          throw new Error('Failed to fetch user roles');
        }
        
        const userRoles = await rolesResponse.json();
        setRoles(userRoles);
      } catch (err) {
        console.error('Error fetching user roles:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user roles');
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, []);

  const hasRole = (roleName: string): boolean => {
    return roles.some(role => role.roleName.toLowerCase() === roleName.toLowerCase());
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  };

  const hasAllRoles = (roleNames: string[]): boolean => {
    return roleNames.every(roleName => hasRole(roleName));
  };

  return {
    roles,
    loading,
    error,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
} 