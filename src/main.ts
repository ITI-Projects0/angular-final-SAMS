import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { ThemeService } from './app/core/services/theme.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideToastr(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => () => inject(ThemeService).init()
    }
  ]
};

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
