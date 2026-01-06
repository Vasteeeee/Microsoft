// Type declarations for optional dependencies
// These packages are only loaded at runtime based on DATABASE_TYPE configuration

declare module '@supabase/supabase-js' {
  export function createClient(url: string, key: string): any;
}

declare module 'firebase-admin' {
  export const apps: any[];
  export function initializeApp(config: any): any;
  export const credential: {
    cert(config: any): any;
  };
  export function firestore(): any;
}

declare module 'pg' {
  export class Pool {
    constructor(config: any);
    query(text: string, params?: any[]): Promise<any>;
    end(): Promise<void>;
  }
}

declare module 'mysql2' {
  export function createPool(config: any): any;
}
