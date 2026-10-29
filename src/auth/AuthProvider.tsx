/**
 * HANDSON AUTH - Mock implementation without Firebase
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isFirebaseConfigured } from "../lib/firebase";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface AuthResult {
  user: AuthUser;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(name: string, email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  restore(): Promise<AuthUser | null>;
  requestPasswordReset(email: string): Promise<void>;
  subscribe(listener: (user: AuthUser | null) => void): () => void;
  readonly isSecureBackend: boolean;
}

export function friendlyAuthError(err: unknown): string {
  return "Auth not available.";
}

export class FirebaseAuthService implements AuthService {
  readonly isSecureBackend = false;

  async signIn(email: string, password: string): Promise<AuthResult> {
    throw new Error("Auth not available.");
  }

  async signUp(name: string, email: string, password: string): Promise<AuthResult> {
    throw new Error("Auth not available.");
  }

  async signOut(): Promise<void> {
    return;
  }

  async restore(): Promise<AuthUser | null> {
    return null;
  }

  async requestPasswordReset(email: string): Promise<void> {
    return;
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    listener(null);
    return () => {};
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  service: AuthService;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  service,
}: {
  children: ReactNode;
  service?: AuthService;
}) {
  const [fallbackService] = useState(() => new FirebaseAuthService());
  const activeService = service ?? fallbackService;

  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const configured = isFirebaseConfigured();

  useEffect(() => {
    setStatus("loading");
    const unsubscribe = activeService.subscribe((u) => {
      setUser(u);
      setStatus(u ? "authenticated" : "unauthenticated");
    });
    return unsubscribe;
  }, [activeService]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await activeService.signIn(email, password);
    },
    [activeService]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      await activeService.signUp(name, email, password);
    },
    [activeService]
  );

  const signOut = useCallback(async () => {
    await activeService.signOut();
  }, [activeService]);

  const requestPasswordReset = useCallback(
    async (email: string) => activeService.requestPasswordReset(email),
    [activeService]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, service: activeService, configured, signIn, signUp, signOut, requestPasswordReset }),
    [user, status, activeService, configured, signIn, signUp, signOut, requestPasswordReset]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
}
