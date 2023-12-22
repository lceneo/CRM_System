import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VidjetsListComponent } from './components/vidjets-list/vidjets-list.component';
import {RouterModule, Routes} from "@angular/router";
import {NgLetDirective} from "../../shared/directives/ng-let.directive";
import { VidjetItemComponent } from './components/vidjet-item/vidjet-item.component';
import {ModalModule} from "ngx-bootstrap/modal";
import {ReactiveFormsModule} from "@angular/forms";
import { VidjetCreateComponent } from './components/vidjet-create/vidjet-create.component';
import {AccordionModule} from "ngx-bootstrap/accordion";
import {MatCardModule} from "@angular/material/card";
import {MatTooltipModule} from "@angular/material/tooltip";
import {TooltipModule} from "ngx-bootstrap/tooltip";


const routes: Routes = [
  { path: '', pathMatch: 'full', component: VidjetsListComponent}
]

@NgModule({
  declarations: [
    VidjetsListComponent,
    VidjetItemComponent,
    VidjetCreateComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ModalModule.forChild(),
    NgLetDirective,
    ReactiveFormsModule,
    AccordionModule,
    MatCardModule,
    MatTooltipModule,
    TooltipModule
  ]
})
export class VidjetModule { }
