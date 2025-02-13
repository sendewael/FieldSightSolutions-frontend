import { Routes } from '@angular/router';
import { MapComponent } from './pages/map/map.component';
import { SchadeclaimComponent } from './pages/schadeclaim/schadeclaim.component';

import { AcountComponent } from './components/acount/acount.component';
import { SchadeclaimsComponent } from './components/schadeclaims/schadeclaims.component';
import { AuthComponent } from './Auth/inlogandregister/inlogandregister.component';
import { DashboardVerzekeraarComponent } from './pages/verzekeraar/dashboard-verzekeraar/dashboard/dashboard-verzekeraar.component';
import { DashboardOverheidComponent } from './pages/overheid/dashboard-overheid/dashboard-overheid.component';
import { SchadeclaimsUserComponent } from './pages/verzekeraar/schadeclaims-user/schadeclaims-user.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: MapComponent, canActivate: [AuthGuard], data: { role: [1,2] }  },
    { path: 'login', component: AuthComponent },
    { path: 'acount', component: AcountComponent },
    { path: 'schadeclaim', component: SchadeclaimComponent, canActivate: [AuthGuard], data: { role: [1] } },
    { path: 'schadeclaims', component: SchadeclaimsComponent, canActivate: [AuthGuard], data: { role: [1] } },
    { path: 'verzekeraar/dashboard', component: DashboardVerzekeraarComponent, canActivate: [AuthGuard], data: { role: [2] } },
    { path: 'verzekeraar/schadeclaims', component: SchadeclaimsUserComponent, canActivate: [AuthGuard], data: { role: [2] } },
    { path: 'overheid/dashboard', component: DashboardOverheidComponent, canActivate: [AuthGuard], data: { role: [3] } },
    { path: 'edit-schadeclaim/:id', component: SchadeclaimComponent, canActivate: [AuthGuard], data: { role: [1] } },

    { path: '**', component: UnauthorizedComponent }
];
