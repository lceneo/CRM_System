import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import { ManageProfileComponent } from './components/manage-profile/manage-profile.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TabsModule} from "ngx-bootstrap/tabs";
import { CreateProfileComponent } from './components/create-profile/create-profile.component';
import {NgLetDirective} from "../../shared/directives/ng-let.directive";
import {SetPasswordComponent} from "./components/set-password/set-password.component";
import {BsDropdownModule} from "ngx-bootstrap/dropdown";
import {redirectToMyProfileGuard} from "../../guards/redirectToMyProfileGuard";
import {authorizationGuard} from "../../guards/authorizationGuard";
import {unauthorizationGuard} from "../../guards/unauthorizationGuard";
import {profileGuard} from "../../guards/profileGuard";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ErrorValidationComponent} from "../../shared/components/error-validation/error-validation.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [redirectToMyProfileGuard],
    loadComponent: () => import('./../../shared/components/not-found/not-found.component').then(f => f.NotFoundComponent)},
  { path: 'create/:id', component: CreateProfileComponent, canActivate: [unauthorizationGuard]},
  { path: 'changePassword', component: SetPasswordComponent, canActivate: [authorizationGuard]},
  { path: ':id', component: ManageProfileComponent, pathMatch: "full", canActivate: [authorizationGuard, profileGuard]}
]

@NgModule({
  declarations: [
    ManageProfileComponent,
    SetPasswordComponent,
    CreateProfileComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TabsModule,
    FormsModule,
    NgLetDirective,
    BsDropdownModule,
    MatTooltipModule,
    ErrorValidationComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ProfileModule { }
