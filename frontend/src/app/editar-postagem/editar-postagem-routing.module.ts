import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarPostagemPage } from './editar-postagem.page';

const routes: Routes = [
  {
    path: '',
    component: EditarPostagemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarPostagemPageRoutingModule {}
