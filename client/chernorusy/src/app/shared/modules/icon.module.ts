import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatIcon, MatIconModule, MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";


const svgNames = ['smile'];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class IconModule {
  constructor(private domSanitizer: DomSanitizer,
              private matIconRegistry: MatIconRegistry) {
    svgNames.forEach(name => this.matIconRegistry
      .addSvgIcon(name, this.domSanitizer
        .bypassSecurityTrustResourceUrl(`/assets/img/vector/${name}.svg`)));
  }
}
