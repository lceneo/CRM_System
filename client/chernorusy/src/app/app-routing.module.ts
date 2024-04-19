import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {authorizationGuard} from "./guards/authorizationGuard";

const routes: Routes = [
  { path: '', redirectTo: 'crm', pathMatch: 'full' },
  { path: 'authentication', loadChildren: () => import('./modules/authentication/authentication.module').then(f => f.AuthenticationModule)},
  { path: 'main', loadChildren: () => import('./modules/chat/chat.module').then(f => f.ChatModule),
    canActivate:  [authorizationGuard] },
  { path: 'profile', loadChildren: () => import('./modules/profile/profile.module').then(f => f.ProfileModule)},
  { path: 'vidjets', loadChildren: () => import('./modules/vidjet/vidjet.module').then(f => f.VidjetModule), canActivate: [authorizationGuard]},
  { path: 'crm', loadChildren: () => import('./modules/crm/crm.module').then(f => f.CrmModule), canActivate: [authorizationGuard]},
  { path: 'diagrams', loadChildren: () => import('./modules/diagrams/diagrams.module').then(f => f.DiagramsModule), canActivate: [authorizationGuard]},
  { path: 'statistic', loadChildren: () => import('./modules/statistic/statistics.module').then(f => f.StatisticsModule), canActivate: [authorizationGuard]},
  { path: 'success', loadComponent: () => import('./shared/components/success/success.component').then(f => f.SuccessComponent)},
  { path: '**', loadComponent: () => import('./shared/components/not-found/not-found.component').then(f => f.NotFoundComponent) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
