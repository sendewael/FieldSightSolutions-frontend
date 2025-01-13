import { Routes } from '@angular/router';
import { MapComponent } from './pages/map/map.component';
import { SchadeclaimComponent } from './pages/schadeclaim/schadeclaim.component';

export const routes: Routes = [
    { path: '', component: MapComponent },
    { path: 'schadeclaims', component: SchadeclaimComponent },
];
