export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FLYO_LIVE_EDIT: boolean;
      FLYO_API_TOKEN: string;
      FLYO_API_BASE_PATH: string;
      FLYO_LIVE_EDIT_ORIGIN: string;
    }
  }
}