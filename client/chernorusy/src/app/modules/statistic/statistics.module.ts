import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {StatisticComponent} from "./components/statistic/statistic.component";
import {MatTabsModule} from "@angular/material/tabs";
import {ManagersStatisticPanelComponent} from "./components/managers/managers-statistic-panel.component";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {MatTableModule} from "@angular/material/table";
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {MatTooltipModule} from "@angular/material/tooltip";
import {OverallStatisticPanelComponent} from "./components/overall/overall-statistic-panel.component";

const routes: Routes = [
  { path: '', pathMatch: 'full', component: StatisticComponent }
]

@NgModule({
  declarations: [
    StatisticComponent,
    ManagersStatisticPanelComponent,
    OverallStatisticPanelComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTabsModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    MatTooltipModule,
  ]
})
export class StatisticsModule { }
