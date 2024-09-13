// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      auth: string?;
    }
    interface PageData {
      auth: string?;
    }
    // interface PageState {}
    interface Platform {
      context: {
        waitUntil(promise: Promise<any>): void;
      };
    }
  }
}

export {};
