import {ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
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
import {registerLocaleData} from "@angular/common";
import localeRu from '@angular/common/locales/ru';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";


registerLocaleData(localeRu);
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
        IconModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule
    ],
  providers: [
    checkResponseInterceptor,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'} },
    { provide: ErrorHandler, useClass: CustomErrorHandlerService },
    {provide: LOCALE_ID, useValue: 'ru-RU'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
