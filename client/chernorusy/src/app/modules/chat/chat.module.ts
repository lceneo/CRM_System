import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MainChatPageComponent} from "./components/main-chat-page/main-chat-page.component";
import {RouterModule, Routes} from "@angular/router";
import {TabsModule} from "ngx-bootstrap/tabs";
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import {NgLetDirective} from "../../shared/directives/ng-let.directive";
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import {FormsModule} from "@angular/forms";
import {TextareaResizeDirective} from "../../shared/directives/textarea-resize.directive";
import {GetChatTypePipe} from "./pipes/get-chat-type.pipe";
import { MessageComponent } from './components/message/message.component';
import {TooltipModule} from "ngx-bootstrap/tooltip";

const routes: Routes = [
  { path: '', pathMatch: 'full', component: MainChatPageComponent }
]

@NgModule({
  declarations: [
    MainChatPageComponent,
    MessagesListComponent,
    MessageDialogComponent,
    MessageComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TabsModule,
        NgLetDirective,
        FormsModule,
        TextareaResizeDirective,
        GetChatTypePipe,
        TooltipModule
    ]
})
export class ChatModule { }
