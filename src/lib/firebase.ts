/**
 * Firebase disabled
 */
export function isFirebaseConfigured(): boolean {
  return false;
}

export function getFirebaseApp(): any {
  throw new Error("Firebase not configured");
}

export function getFirebaseAuth(): Promise<any> {
  return Promise.reject(new Error("Firebase not configured"));
}
