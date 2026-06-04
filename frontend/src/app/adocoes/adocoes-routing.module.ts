import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdocoesPage } from './adocoes.page';

const routes: Routes = [
  {
    path: '',
    component: AdocoesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdocoesPageRoutingModule {}
