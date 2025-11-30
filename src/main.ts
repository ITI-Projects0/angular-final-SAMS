import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { ThemeService } from './app/core/services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => () => inject(ThemeService).init()
    }
  ]
};

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
