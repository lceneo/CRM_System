import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./components/login/login.component";
import {RegistrationComponent} from "./components/registration/registration.component";
import {authorizationGuard} from "../../guards/authorizationGuard";
import {ReactiveFormsModule} from "@angular/forms";
import {unauthorizationGuard} from "../../guards/unauthorizationGuard";
import {adminGuard} from "../../guards/adminGuard";
import {ErrorValidationComponent} from "../../shared/components/error-validation/error-validation.component";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {NgLetDirective} from "../../shared/directives/ng-let.directive";
import {MatInputModule} from "@angular/material/input";


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', pathMatch: 'full', component: LoginComponent, canActivate: [unauthorizationGuard] },
  { path: 'registration', pathMatch: 'full', component: RegistrationComponent, canActivate:  [authorizationGuard, adminGuard]},
]

@NgModule({
  declarations: [
    RegistrationComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    ErrorValidationComponent,
    MatButtonModule,
    MatIconModule,
    NgLetDirective,
    MatInputModule
  ]
})
export class AuthenticationModule { }
