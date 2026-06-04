import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdocoesDetalhesPageRoutingModule } from './adocoes-detalhes-routing.module';

import { AdocoesDetalhesPage } from './adocoes-detalhes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdocoesDetalhesPageRoutingModule
  ],
  declarations: [AdocoesDetalhesPage]
})
export class AdocoesDetalhesPageModule { }