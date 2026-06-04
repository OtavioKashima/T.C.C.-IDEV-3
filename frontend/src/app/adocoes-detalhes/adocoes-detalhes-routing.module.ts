import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdocoesDetalhesPage } from './adocoes-detalhes.page';

const routes: Routes = [
  {
    path: '',
    component: AdocoesDetalhesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdocoesDetalhesPageRoutingModule {}