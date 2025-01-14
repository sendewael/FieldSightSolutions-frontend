import { Routes } from '@angular/router';
import { MapComponent } from './pages/map/map.component';
import { SchadeclaimComponent } from './pages/schadeclaim/schadeclaim.component';
import { LoginComponent } from './Auth0/login/login.component';
import { RegisterComponent } from './Auth0/register/register.component';
import { AcountComponent } from './components/acount/acount.component';
import { SchadeclaimsComponent } from './components/schadeclaims/schadeclaims.component';

export const routes: Routes = [
    { path: '', component: MapComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'acount', component: AcountComponent },
    { path: 'schadeclaim', component: SchadeclaimComponent },
    { path: 'schadeclaims', component: SchadeclaimsComponent },




];
