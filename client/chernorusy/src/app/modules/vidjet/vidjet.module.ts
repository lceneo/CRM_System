import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VidjetsListComponent } from './components/vidjets-list/vidjets-list.component';
import {RouterModule, Routes} from "@angular/router";
import {NgLetDirective} from "../../shared/directives/ng-let.directive";
import { VidjetItemComponent } from './components/vidjet-item/vidjet-item.component';
import {ModalModule} from "ngx-bootstrap/modal";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { VidjetCreateComponent } from './components/vidjet-create/vidjet-create.component';
import {AccordionModule} from "ngx-bootstrap/accordion";
import {MatCardModule} from "@angular/material/card";
import {MatTooltipModule} from "@angular/material/tooltip";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {CdkDrag, CdkDragHandle} from "@angular/cdk/drag-drop";
import {NgxModalDraggableDirective} from "../../shared/directives/ngx-modal-draggable";
import {WidgetService} from "../../shared/services/widget.service";
import {MatSelectModule} from "@angular/material/select";
import {MatRadioModule} from "@angular/material/radio";
import {MatSliderModule} from "@angular/material/slider";


const routes: Routes = [
  { path: '', pathMatch: 'full', component: VidjetsListComponent}
]

@NgModule({
  providers: [
    WidgetService,
  ],
  declarations: [
    VidjetsListComponent,
    VidjetItemComponent,
    VidjetCreateComponent,
    NgxModalDraggableDirective
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
    TooltipModule,
    CdkDrag,
    CdkDragHandle,
    MatSelectModule,
    MatRadioModule,
    FormsModule,
    MatSliderModule,
  ]
})
export class VidjetModule { }
