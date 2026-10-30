/**
 * HANDSON AUTH - Firebase Authentication
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
import {
  isFirebaseConfigured,
  getFirebaseAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from "../lib/firebase";

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
  if (err instanceof Error) {
    const code = (err as any).code;
    switch (code) {
      case "auth/wrong-password":
      case "auth/invalid-email":
      case "auth/user-not-found":
        return "Invalid email or password.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password is too weak.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Try again later.";
      case "auth/network-request-failed":
        return "Network error. Check your connection.";
      default:
        return err.message || "Auth error.";
    }
  }
  return "Auth not available.";
}

export class FirebaseAuthService implements AuthService {
  readonly isSecureBackend = true;
  private auth: Auth;

  constructor() {
    this.auth = getFirebaseAuth();
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const u = userCredential.user;
    return {
      user: {
        id: u.uid,
        name: u.displayName || u.email!.split("@")[0],
        email: u.email!,
        createdAt: u.metadata.creationTime
          ? new Date(u.metadata.creationTime).getTime()
          : Date.now(),
      },
    };
  }

  async signUp(name: string, email: string, password: string): Promise<AuthResult> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const u = userCredential.user;
    await u.updateProfile({ displayName: name });
    return {
      user: {
        id: u.uid,
        name,
        email: u.email!,
        createdAt: u.metadata.creationTime
          ? new Date(u.metadata.creationTime).getTime()
          : Date.now(),
      },
    };
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  async restore(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(this.auth, (u) => {
        unsub();
        if (u) {
          resolve({
            id: u.uid,
            name: u.displayName || u.email!.split("@")[0],
            email: u.email!,
            createdAt: u.metadata.creationTime
              ? new Date(u.metadata.creationTime).getTime()
              : Date.now(),
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    // Firebase: use sendPasswordResetEmail
    const { sendPasswordResetEmail } = await import("firebase/auth");
    await sendPasswordResetEmail(this.auth, email);
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (u) => {
      if (u) {
        listener({
          id: u.uid,
          name: u.displayName || u.email!.split("@")[0],
          email: u.email!,
          createdAt: u.metadata.creationTime
            ? new Date(u.metadata.creationTime).getTime()
            : Date.now(),
        });
      } else {
        listener(null);
      }
    });
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
