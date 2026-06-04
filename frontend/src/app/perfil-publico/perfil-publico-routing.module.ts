import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilPublicoPage } from './perfil-publico.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilPublicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilPublicoPageRoutingModule {}
