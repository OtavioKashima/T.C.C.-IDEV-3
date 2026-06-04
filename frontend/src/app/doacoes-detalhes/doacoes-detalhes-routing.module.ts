import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DoacoesDetalhesPage } from './doacoes-detalhes.page';

const routes: Routes = [
  {
    path: '',
    component: DoacoesDetalhesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoacoesDetalhesPageRoutingModule {}