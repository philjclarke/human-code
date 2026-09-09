/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly RESEND_API_KEY?: string;
  readonly BOOKING_TO?: string;
  readonly BOOKING_FROM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
