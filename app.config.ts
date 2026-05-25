import {
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * app.config.ts — Shopify / Apollo GraphQL completely removed.
 *
 * What changed:
 *  - Removed: provideApollo, HttpLink, InMemoryCache, apollo-angular imports
 *  - Added:   provideHttpClient(withFetch()) — Angular's built-in HTTP client
 *             which ProductService and CategoryService now use directly.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};
