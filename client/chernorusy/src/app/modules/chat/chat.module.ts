import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MainChatPageComponent} from "./components/main-chat-page/main-chat-page.component";
import {RouterModule, Routes} from "@angular/router";
import {TabsModule} from "ngx-bootstrap/tabs";
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import {NgLetDirective} from "../../shared/directives/ng-let.directive";
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import {FormsModule} from "@angular/forms";

const routes: Routes = [
  { path: '', pathMatch: 'full', component: MainChatPageComponent }
]

@NgModule({
  declarations: [
    MainChatPageComponent,
    MessagesListComponent,
    MessageDialogComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TabsModule,
        NgLetDirective,
        FormsModule
    ]
})
export class ChatModule { }
