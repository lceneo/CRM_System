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

const routes: Routes = [

  { path: '', component: ManageProfileComponent, pathMatch: "full"},
  { path: 'changePassword', component: SetPasswordComponent},
  { path: ':id', component: CreateProfileComponent}
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
    BsDropdownModule
  ]
})
export class ProfileModule { }
