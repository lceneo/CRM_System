import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {authorizationGuard} from "./guards/authorizationGuard";

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./modules/login/login.module').then(f => f.LoginModule) },
  { path: 'registration', loadChildren: () => import('./modules/registration/registration.module').then(f => f.RegistrationModule),
    canActivate:  [authorizationGuard]},
  { path: 'main', loadChildren: () => import('./modules/chat/chat.module').then(f => f.ChatModule),
    canActivate:  [authorizationGuard] },
  { path: 'profile', loadChildren: () => import('./modules/profile/profile.module').then(f => f.ProfileModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
