import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DoacoesDetalhesPageRoutingModule } from './doacoes-detalhes-routing.module';

import { DoacoesDetalhesPage } from './doacoes-detalhes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DoacoesDetalhesPageRoutingModule
  ],
  declarations: [DoacoesDetalhesPage]
})
export class DoacoesDetalhesPageModule { }