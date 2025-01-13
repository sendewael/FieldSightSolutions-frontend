import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { withEnabledBlockingInitialNavigation } from '@angular/router';
import { routes } from './app.routes';
import { AuthHttpInterceptor } from '@auth0/auth0-angular';

import { provideAuth0 } from '@auth0/auth0-angular';
import { environment } from '../environments/environment.development'


const domain = environment.AUTH0_DOMAIN;
const clientId = environment.AUTH0_CLIENT_ID;

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideAuth0({
      domain: domain,
      clientId: clientId,
      authorizationParams: {
        audience: environment.AUTH0_AUDIENCE,
        redirect_uri: environment.redirectUri
      },
      httpInterceptor: {
        allowedList: [`${environment.api_url}/trip`,`${environment.api_url}/trip/*`]
      }
    }),
  ]
};
