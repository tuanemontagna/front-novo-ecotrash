"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchMe, login as apiLogin } from "@/utils/axios";
import { Loader2 } from "lucide-react";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const userData = await fetchMe();
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed", error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/', '/login', '/criar-conta', '/recuperar-senha', '/artigos'];
    const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    
    if (!user) {
      if (!isPublic) {
        router.push('/login');
      }
    } else {
      // User is logged in
      if (isPublic) {
        // Redirect to dashboard if on public page
        redirectUser(user);
      } else {
        // Check role access
        if (pathname.startsWith('/admin') && user.tipoUsuario !== 'ADMIN') {
          redirectUser(user);
        } else if (pathname.startsWith('/empresa') && user.tipoUsuario !== 'EMPRESA') {
          redirectUser(user);
        } else if (pathname.startsWith('/usuario') && user.tipoUsuario !== 'PESSOA_FISICA') {
          redirectUser(user);
        }
      }
    }
  }, [user, loading, pathname, router]);

  function redirectUser(userData) {
    if (userData.tipoUsuario === 'ADMIN') router.push('/admin');
    else if (userData.tipoUsuario === 'EMPRESA') router.push('/empresa/home');
    else if (userData.tipoUsuario === 'PESSOA_FISICA') router.push('/usuario/home');
    else router.push('/');
  }

  async function login(email, senha) {
    const data = await apiLogin(email, senha);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    await checkAuth();
    return data;
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#2d5016]" size={48} />
          <p className="text-sm font-medium text-zinc-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
