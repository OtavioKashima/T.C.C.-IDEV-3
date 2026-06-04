import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatOngPage } from './chat-ong.page';

const routes: Routes = [
  {
    path: '',
    component: ChatOngPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatOngPageRoutingModule {}
