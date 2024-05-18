import {Component} from "@angular/core";
import {GridsterConfig, GridsterItem, GridType} from "angular-gridster2";

@Component({
  selector: 'app-diagrams',
  templateUrl: 'diagrams.component.html',
  styleUrls: ['diagrams.component.scss']
})
export class DiagramsComponent {
  options: GridsterConfig = {
    gridType: GridType.Fit,
    allowMultiLayer: true,
    defaultLayerIndex: 1,
    baseLayerIndex: 2,
    maxLayerIndex: 2,
    disableAutoPositionOnConflict: true,
    resizable: {
      enabled: true,
    },
    disableScrollHorizontal: true,
    disableScrollVertical: true,
    compactType: 'none',
    displayGrid: 'none',
    minCols: 100,
    minRows: 100,
    maxCols: 100,
    maxRows: 100,
    defaultItemCols: 33,
    defaultItemRows: 33,
    maxItemCols: 100,
    maxItemRows: 100,
    maxItemArea: 10000,
    minItemRows: 10,
    minItemCols: 10,
    margin: 5,
    draggable: {
      enabled: true,
      dragHandleClass: 'itemGridster__header_drag',
      ignoreContent: true,
    },
  };

  dashboard: GridsterItem[] = [ {cols: 2, rows: 1, y: 0, x: 0},
    {cols: 2, rows: 2, y: 0, x: 2}];

}
