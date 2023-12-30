import {ErrorHandler, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {HttpClientModule} from "@angular/common/http";
import {NgLetDirective} from "./shared/directives/ng-let.directive";
import {checkResponseInterceptor} from "./interceptors/check-response-status.interceptor";
import {BsDropdownModule} from "ngx-bootstrap/dropdown";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";
import {CustomErrorHandlerService} from "./shared/services/custom-error-handler.service";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {IconModule} from "./shared/modules/icon.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TooltipModule.forRoot(),
    NgLetDirective,
    BsDropdownModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    IconModule
  ],
  providers: [
    checkResponseInterceptor,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'} },
    { provide: ErrorHandler, useClass: CustomErrorHandlerService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
