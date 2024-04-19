import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DiagramsComponent} from "./components/diagrams/diagrams.component";
import {GridsterComponent, GridsterItemComponent, GridsterModule} from "angular-gridster2";

const routes: Routes = [
  { path: '', pathMatch: 'full', component: DiagramsComponent }
]

@NgModule({
  declarations: [
    DiagramsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GridsterModule,
  ]
})
export class DiagramsModule { }
