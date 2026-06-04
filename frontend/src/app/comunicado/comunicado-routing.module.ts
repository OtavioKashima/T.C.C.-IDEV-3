import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComunicadoPage } from './comunicado.page';

const routes: Routes = [
  {
    path: '',
    component: ComunicadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComunicadoPageRoutingModule {}
