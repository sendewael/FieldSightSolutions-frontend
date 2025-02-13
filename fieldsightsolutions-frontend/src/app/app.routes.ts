import { Routes } from '@angular/router';
import { MapComponent } from './pages/map/map.component';
import { SchadeclaimComponent } from './pages/schadeclaim/schadeclaim.component';

import { AcountComponent } from './components/acount/acount.component';
import { SchadeclaimsComponent } from './components/schadeclaims/schadeclaims.component';
import { AuthComponent } from './Auth/inlogandregister/inlogandregister.component';
import { DashboardVerzekeraarComponent } from './pages/verzekeraar/dashboard-verzekeraar/dashboard/dashboard-verzekeraar.component';
import { SchadeclaimsUserComponent } from './pages/verzekeraar/schadeclaims-user/schadeclaims-user.component';
import { DashboardAdminComponent } from './pages/admin/dashboard-admin/dashboard-admin.component';
import { BeheerUsersComponent } from './pages/admin/beheer-users/beheer-users.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardMapComponent } from './components/dashboard-map/dashboard-map.component';

export const routes: Routes = [
  { path: '', component: MapComponent },
  { path: 'login', component: AuthComponent },
  {
    path: 'acount',
    component: AcountComponent,
    canActivate: [AuthGuard],
    data: { role: [1, 2, 3, 4] },
  },
  {
    path: 'schadeclaim',
    component: SchadeclaimComponent,
    canActivate: [AuthGuard],
    data: { role: [1] },
  },
  {
    path: 'schadeclaims',
    component: SchadeclaimsComponent,
    canActivate: [AuthGuard],
    data: { role: [1] },
  },
  {
    path: 'verzekeraar/dashboard',
    component: DashboardVerzekeraarComponent,
    canActivate: [AuthGuard],
    data: { role: [2, 3, 4] },
  },
  {
    path: 'verzekeraar/schadeclaims',
    component: SchadeclaimsUserComponent,
    canActivate: [AuthGuard],
    data: { role: [2, 3, 4] },
  },
  {
    path: 'edit-schadeclaim/:id',
    component: SchadeclaimComponent,
    canActivate: [AuthGuard],
    data: { role: [1] },
  },
  {
    path: 'admin/GebruikersBeheer',
    component: BeheerUsersComponent,
    canActivate: [AuthGuard],
    data: { role: [2, 3, 4] },
  },
  { path: '**', component: UnauthorizedComponent },
];
