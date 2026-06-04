import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdocoesPageRoutingModule } from './adocoes-routing.module';
import { AdocoesPage } from './adocoes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdocoesPageRoutingModule
  ],
  declarations: [AdocoesPage]
})
export class AdocoesPageModule {}
