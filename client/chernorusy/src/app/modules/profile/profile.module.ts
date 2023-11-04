import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import { CreateProfileComponent } from './components/create-profile/create-profile.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TabsModule} from "ngx-bootstrap/tabs";
import { CreatePasswordComponent } from './components/create-password/create-password.component';
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { ProfileComponent } from './components/profile/profile.component';
import {NgLetDirective} from "../../shared/directives/ng-let.directive";

const routes: Routes = [
  { path: ':id', component: ProfileComponent}
]

@NgModule({
  declarations: [
    CreateProfileComponent,
    CreatePasswordComponent,
    ProfileInfoComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TabsModule,
    FormsModule,
    NgLetDirective
  ]
})
export class ProfileModule { }
