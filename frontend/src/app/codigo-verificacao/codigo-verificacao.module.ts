import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CodigoVerificacaoPageRoutingModule } from './codigo-verificacao-routing.module';

import { CodigoVerificacaoPage } from './codigo-verificacao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CodigoVerificacaoPageRoutingModule
  ],
  declarations: [CodigoVerificacaoPage]
})
export class CodigoVerificacaoPageModule {}