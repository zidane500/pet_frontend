import { createContext, useContext, useState, useCallback } from 'react';

export type PageId =
  | 'home' | 'feed' | 'dashboard' | 'messages' | 'create-listing'
  | 'pet-detail' | 'search' | 'profile' | 'notifications' | 'login'
  | 'register' | 'forgot-password' | 'reset-password' | 'profile-setup'
  | 'favorites' | 'premium' | 'settings' | 'vets' | 'stores'
  | 'vet-profile' | 'shop-profile' | 'shelter-profile'
  | 'faq' | 'contact' | 'not-found';

export interface NavState {
  page: PageId;
  params?: Record<string, string>;
}

interface NavigationContextValue {
  nav: NavState;
  navigate: (page: PageId, params?: Record<string, string>) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<NavState[]>([{ page: 'home' }]);
  const nav = history[history.length - 1];

  const navigate = useCallback((page: PageId, params?: Record<string, string>) => {
    setHistory(prev => [...prev, { page, params }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavigationContext.Provider value={{ nav, navigate, goBack, canGoBack: history.length > 1 }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNav must be used inside NavigationProvider');
  return ctx;
}
