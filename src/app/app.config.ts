import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

/**
 * Images live in public/images as <key>-<width>.webp/.avif (see scripts/optimize-images.mjs).
 * The <img> fallback uses WebP; <app-picture> adds the AVIF <source>. Absolute URLs pass through.
 */
const imageLoader = ({ src, width, loaderParams }: ImageLoaderConfig): string =>
  /^https?:\/\//.test(src) ? src : `images/${src}-${width ?? loaderParams?.['max']}.webp`;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideClientHydration(),
    { provide: IMAGE_LOADER, useValue: imageLoader },
  ],
};
