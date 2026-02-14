/**
 * Authentication utilities for token management
 */

const AUTH_TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';
const USERNAME_KEY = 'username';
const USER_TYPE_KEY = 'user_type';

export const authUtils = {
  /**
   * Store authentication token
   */
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  },

  /**
   * Get authentication token
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Remove authentication token
   */
  clearToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(USERNAME_KEY);
      localStorage.removeItem(USER_TYPE_KEY);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    }
    return false;
  },

  /**
   * Get user ID
   */
  getUserId: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(USER_ID_KEY);
    }
    return null;
  },

  /**
   * Get username
   */
  getUsername: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(USERNAME_KEY);
    }
    return null;
  },

  /**
   * Get user type
   */
  getUserType: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(USER_TYPE_KEY);
    }
    return null;
  },

  /**
   * Get full user info
   */
  getUserInfo: () => {
    if (typeof window !== 'undefined') {
      return {
        id: localStorage.getItem(USER_ID_KEY),
        username: localStorage.getItem(USERNAME_KEY),
        type: localStorage.getItem(USER_TYPE_KEY),
        token: localStorage.getItem(AUTH_TOKEN_KEY),
      };
    }
    return {
      id: null,
      username: null,
      type: null,
      token: null,
    };
  },

  /**
   * Get authorization header for API calls
   */
  getAuthHeader: () => {
    const token = authUtils.getToken();
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  },
};

export default authUtils;
