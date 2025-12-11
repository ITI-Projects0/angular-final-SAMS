import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';

// URLs that should not trigger the loader
const EXCLUDED_URLS = [
  '/notifications',
  '/health',
  '/ping',
  '/sanctum/csrf-cookie',
  '/broadcasting/auth',
  '/unread-count'
];

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  // Check if URL should be excluded
  const shouldSkip = EXCLUDED_URLS.some(url => req.url.includes(url));

  if (shouldSkip) {
    return next(req);
  }

  loaderService.show();

  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    })
  );
};

