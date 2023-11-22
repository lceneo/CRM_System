import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {authorizationGuard} from "./guards/authorizationGuard";

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'authentication', loadChildren: () => import('./modules/authentication/authentication.module').then(f => f.AuthenticationModule)},
  { path: 'main', loadChildren: () => import('./modules/chat/chat.module').then(f => f.ChatModule),
    canActivate:  [authorizationGuard] },
  { path: 'profile', loadChildren: () => import('./modules/profile/profile.module').then(f => f.ProfileModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
