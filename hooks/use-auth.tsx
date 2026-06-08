'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface UserProfile {
  company_name: string;
  industry: string;
  base_currency: string;
  reporting_currency: string;
  name: string;
  email: string;
}

export interface UploadedFiles {
  coa: string | null;
  dim_products: string | null;
  bsv_tax: string | null;
  subledger: string | null;
  asset_value: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  uploadedFiles: UploadedFiles;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (profile: UserProfile, password: string) => Promise<boolean>;
  logout: () => void;
  uploadFile: (key: keyof UploadedFiles, fileName: string) => void;
  removeFile: (key: keyof UploadedFiles) => void;
  isUploadComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    coa: null,
    dim_products: null,
    bsv_tax: null,
    subledger: null,
    asset_value: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  
  const router = useRouter();
  const pathname = usePathname();

  // Load state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('auth_user');
        const storedIsAuth = localStorage.getItem('auth_is_authenticated');
        const storedFiles = localStorage.getItem('uploaded_files');

        if (storedUser && storedIsAuth === 'true') {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }

        if (storedFiles) {
          setUploadedFiles(JSON.parse(storedFiles));
        }
      } catch (e) {
        console.error('Error parsing stored auth data', e);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check local accounts database (simulated via localStorage or config)
    try {
      const storedAccountsStr = localStorage.getItem('registered_accounts') || '[]';
      const accounts = JSON.parse(storedAccountsStr);
      
      const found = accounts.find((acc: any) => acc.email.toLowerCase() === email.toLowerCase());
      
      // If no account exists yet, let's register a default model user based on user request or allow dynamic
      if (!found) {
        // Fallback option to let any login pass for mock/easy testing if accounts is empty
        if (accounts.length === 0) {
          const mockUser: UserProfile = {
            company_name: 'FF Corp',
            industry: 'REIT - Retail',
            base_currency: 'AUD',
            reporting_currency: 'AUD',
            name: 'Arka Raha',
            email: email,
          };
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem('auth_user', JSON.stringify(mockUser));
          localStorage.setItem('auth_is_authenticated', 'true');
          return true;
        }
        return false;
      }

      if (found.password === password) {
        const profile: UserProfile = {
          company_name: found.company_name,
          industry: found.industry,
          base_currency: found.base_currency,
          reporting_currency: found.reporting_currency,
          name: found.name,
          email: found.email,
        };
        setUser(profile);
        setIsAuthenticated(true);
        localStorage.setItem('auth_user', JSON.stringify(profile));
        localStorage.setItem('auth_is_authenticated', 'true');
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const signup = async (profile: UserProfile, password: string): Promise<boolean> => {
    try {
      const storedAccountsStr = localStorage.getItem('registered_accounts') || '[]';
      const accounts = JSON.parse(storedAccountsStr);
      
      const exists = accounts.some((acc: any) => acc.email.toLowerCase() === profile.email.toLowerCase());
      if (exists) {
        return false; // Email already registered
      }

      const newAccount = {
        ...profile,
        password,
      };

      accounts.push(newAccount);
      localStorage.setItem('registered_accounts', JSON.stringify(accounts));
      
      // Also automatically set this user as signed up and direct to login
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_is_authenticated');
    // Clear files if they log out to permit re-uploading demo
    localStorage.removeItem('uploaded_files');
    setUploadedFiles({
      coa: null,
      dim_products: null,
      bsv_tax: null,
      subledger: null,
      asset_value: null,
    });
    router.push('/login');
  };

  const uploadFile = (key: keyof UploadedFiles, fileName: string) => {
    setUploadedFiles((prev) => {
      const updated = { ...prev, [key]: fileName };
      localStorage.setItem('uploaded_files', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFile = (key: keyof UploadedFiles) => {
    setUploadedFiles((prev) => {
      const updated = { ...prev, [key]: null };
      localStorage.setItem('uploaded_files', JSON.stringify(updated));
      return updated;
    });
  };

  const isUploadComplete = Object.values(uploadedFiles).every((val) => val !== null);

  // Client side router gate guard
  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/login', '/signup'];
    const pathIsPublic = publicPaths.includes(pathname);

    if (!isAuthenticated && !pathIsPublic) {
      router.push('/login');
    } else if (isAuthenticated && pathIsPublic) {
      // If we are authenticated but on login/signup, redirect based on uploaded files state
      router.push('/upload');
    }
  }, [isAuthenticated, pathname, loading, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        uploadedFiles,
        loading,
        login,
        signup,
        logout,
        uploadFile,
        removeFile,
        isUploadComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
