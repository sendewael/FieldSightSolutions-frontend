import { Routes } from '@angular/router';
import { MapComponent } from './pages/map/map.component';
import { SchadeclaimComponent } from './pages/schadeclaim/schadeclaim.component';

import { AcountComponent } from './components/acount/acount.component';
import { SchadeclaimsComponent } from './components/schadeclaims/schadeclaims.component';
import { AuthComponent } from './Auth0/inlogandregister/inlogandregister.component';
import { DashboardVerzekeraarComponent } from './pages/verzekeraar/dashboard-verzekeraar/dashboard/dashboard-verzekeraar.component';
import { SchadeclaimsUserComponent } from './pages/verzekeraar/schadeclaims-user/schadeclaims-user.component';

export const routes: Routes = [
    { path: '', component: MapComponent },
    { path: 'login', component: AuthComponent },
    { path: 'acount', component: AcountComponent },
    { path: 'schadeclaim', component: SchadeclaimComponent },
    { path: 'schadeclaims', component: SchadeclaimsComponent },
    { path: 'verzekeraar/dashboard', component: DashboardVerzekeraarComponent},
    { path: 'verzekeraar/schadeclaims', component: SchadeclaimsUserComponent}





];
