import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CodigoVerificacaoPage } from './codigo-verificacao.page';

const routes: Routes = [
  {
    path: '',
    component: CodigoVerificacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodigoVerificacaoPageRoutingModule {}