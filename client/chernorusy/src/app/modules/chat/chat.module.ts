import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MainChatPageComponent} from "./components/main-chat-page/main-chat-page.component";
import {RouterModule, Routes} from "@angular/router";
import {TabsModule} from "ngx-bootstrap/tabs";
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import {NgLetDirective} from "../../shared/directives/ng-let.directive";
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TextareaResizeDirective} from "../../shared/directives/textarea-resize.directive";
import {GetChatTypePipe} from "./pipes/get-chat-type.pipe";
import { MessageComponent } from './components/message/message.component';
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatBadgeModule} from "@angular/material/badge";
import { ChatMembersComponent } from './components/chat-members/chat-members.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: MainChatPageComponent }
]

@NgModule({
  declarations: [
    MainChatPageComponent,
    MessagesListComponent,
    MessageDialogComponent,
    MessageComponent,
    ChatMembersComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TabsModule,
        NgLetDirective,
        FormsModule,
        TextareaResizeDirective,
        GetChatTypePipe,
        TooltipModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatBadgeModule,
        ReactiveFormsModule
    ]
})
export class ChatModule { }
