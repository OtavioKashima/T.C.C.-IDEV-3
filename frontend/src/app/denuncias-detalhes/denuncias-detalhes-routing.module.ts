import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DenunciasDetalhesPage } from './denuncias-detalhes.page';

const routes: Routes = [
  {
    path: '',
    component: DenunciasDetalhesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DenunciasDetalhesPageRoutingModule {}
