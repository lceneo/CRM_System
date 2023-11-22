import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./components/login/login.component";
import {ChangePasswordComponent} from "./components/recover-password/change-password.component";
import {RegistrationComponent} from "./components/registration/registration.component";
import {authorizationGuard} from "../../guards/authorizationGuard";
import {ReactiveFormsModule} from "@angular/forms";


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', pathMatch: 'full', component: LoginComponent },
  { path: 'registration', pathMatch: 'full', component: RegistrationComponent, canActivate:  [authorizationGuard]},
  { path: 'passwordChange', component: ChangePasswordComponent}
]

@NgModule({
  declarations: [
    RegistrationComponent,
    LoginComponent,
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ]
})
export class AuthenticationModule { }
