import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);

  return authService.getAccessTokenSilently().pipe(
          switchMap(token => {
            const newRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });

            return next(newRequest);
          })
  );
};
