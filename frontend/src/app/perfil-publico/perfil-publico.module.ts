import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilPublicoPageRoutingModule } from './perfil-publico-routing.module';

import { PerfilPublicoPage } from './perfil-publico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPublicoPageRoutingModule
  ],
  declarations: [PerfilPublicoPage]
})
export class PerfilPublicoPageModule {}
