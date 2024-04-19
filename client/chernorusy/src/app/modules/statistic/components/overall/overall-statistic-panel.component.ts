import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {ProfileService} from "../../../../shared/services/profile.service";
import {FormControl, FormGroup} from "@angular/forms";
import {AccountRole} from "../../../profile/enums/AccountRole";
import {IProfileResponseDTO} from "../../../profile/DTO/response/ProfileResponseDTO";
import {
  BehaviorSubject,
  combineLatest, debounceTime,
  fromEvent,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
  shareReplay,
  takeUntil,
  tap, throttleTime
} from "rxjs";
import {AllRatings, RatingService} from "../../../../shared/services/rating.service";
import {MatTableDataSource} from "@angular/material/table";
import {ColumnMode, DatatableComponent, TableColumn} from "@swimlane/ngx-datatable";
import {ChatSearchService} from "../../../../shared/services/chat-search.service";
import {ChatStatus} from "../../../chat/helpers/enums/ChatStatus";
import {StatisticComponent} from "../statistic/statistic.component";
import {StatisticsService} from "../../../../shared/services/statistics.service";

@Component({
  selector: 'app-overall-statistic-panel',
  templateUrl: 'overall-statistic-panel.component.html',
  styleUrls: ['overall-statistic-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverallStatisticPanelComponent {
  avgAnsTime = 0;
}

