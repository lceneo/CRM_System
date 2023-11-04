import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainChatPageComponent } from './modules/chat/components/main-chat-page/main-chat-page.component';
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {HttpClientModule} from "@angular/common/http";
import {NgLetDirective} from "./shared/directives/ng-let.directive";
import {checkResponseInterceptor} from "./interceptors/check-response-status.interceptor";

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        TooltipModule.forRoot(),
        NgLetDirective
    ],
  providers: [
    checkResponseInterceptor
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
