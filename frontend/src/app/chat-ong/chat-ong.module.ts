import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatOngPageRoutingModule } from './chat-ong-routing.module';

import { ChatOngPage } from './chat-ong.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatOngPageRoutingModule
  ],
  declarations: [ChatOngPage]
})
export class ChatOngPageModule {}
