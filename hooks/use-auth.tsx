'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface UserProfile {
  company_name?: string;
  industry?: string;
  base_currency?: string;
  reporting_currency?: string;
  name: string;
  email: string;
  role?: string;
  id?: number;
}

export interface UploadedFileMeta {
  fileName: string;
  fileId: number;
}

export interface UploadedFiles {
  coa: UploadedFileMeta | null;
  dim_products: UploadedFileMeta | null;
  bsv_tax: UploadedFileMeta | null;
  subledger: UploadedFileMeta | null;
  asset_value: UploadedFileMeta | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  uploadedFiles: UploadedFiles;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (profile: UserProfile, password: string) => Promise<boolean>;
  logout: () => void;
  uploadFile: (key: keyof UploadedFiles, fileName: string, fileId: number) => void;
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
        const storedToken = localStorage.getItem('auth_token');

        if (storedUser && storedIsAuth === 'true' && storedToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }

        if (storedFiles) {
          try {
            const parsed = JSON.parse(storedFiles);
            // Validate that if a file exists, it has a fileId, otherwise clear it to prevent bugs
            const isValid = Object.values(parsed).every((val: any) => val === null || (val && typeof val.fileId === 'number'));
            if (isValid) {
              setUploadedFiles(parsed);
            } else {
              localStorage.removeItem('uploaded_files');
            }
          } catch (e) {
            localStorage.removeItem('uploaded_files');
          }
        }
      } catch (e) {
        console.error('Error parsing stored auth data', e);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.access_token && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_is_authenticated', 'true');

        // Automatically fetch and set the latest batch for analysts
        if (data.user.role === 'analyst') {
          try {
            const histRes = await fetch('https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/get-reporting-history/history', {
              headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            if (histRes.ok) {
              const histData = await histRes.json();
              if (histData && histData.data) {
                const doneBatches = histData.data.filter((b: any) => b.status === 'done');
                if (doneBatches.length > 0) {
                  // Find the batch with the highest ID (latest)
                  const latestBatch = doneBatches.reduce((prev: any, current: any) => (prev.batch_id > current.batch_id) ? prev : current);
                  localStorage.setItem('upload_batch_id', String(latestBatch.batch_id));
                }
              }
            }
          } catch (err) {
            console.error('Failed to fetch history for analyst on login:', err);
          }
        }

        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const signup = async (profile: UserProfile, password: string): Promise<boolean> => {
    try {
      const response = await fetch('https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, password }),
      });

      if (!response.ok) {
        console.error('Signup failed', await response.text());
        return false;
      }

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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_is_authenticated');
    localStorage.removeItem('upload_batch_id');
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

  const uploadFile = (key: keyof UploadedFiles, fileName: string, fileId: number) => {
    setUploadedFiles((prev) => {
      const updated = { ...prev, [key]: { fileName, fileId } };
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

    const publicPaths = ['/login', '/signup', '/accept-invitation'];
    const pathIsPublic = publicPaths.includes(pathname);

    if (!isAuthenticated && !pathIsPublic) {
      router.push('/login');
    } else if (isAuthenticated) {
      if (pathIsPublic) {
        if (user?.role === 'admin') {
          router.push('/upload');
        } else {
          router.push('/');
        }
      }
      // Note: Analysts are allowed on /upload now so they can view batch history to load a dashboard
    }
  }, [isAuthenticated, pathname, loading, router, user]);

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
