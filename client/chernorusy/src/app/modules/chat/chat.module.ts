import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MainChatPageComponent} from "./components/main-chat-page/main-chat-page.component";
import {RouterModule, Routes} from "@angular/router";
import {TabsModule} from "ngx-bootstrap/tabs";
import { MessageComponent } from './components/message/message.component';
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import {NgLetDirective} from "../../shared/directives/ng-let.directive";
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: MainChatPageComponent }
]

@NgModule({
  declarations: [
    MainChatPageComponent,
    MessageComponent,
    MessagesListComponent,
    MessageDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TabsModule,
    NgLetDirective
  ]
})
export class ChatModule { }
