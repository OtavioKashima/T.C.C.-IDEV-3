import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarPostagemPageRoutingModule } from './editar-postagem-routing.module';

import { EditarPostagemPage } from './editar-postagem.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarPostagemPageRoutingModule
  ],
  declarations: [EditarPostagemPage]
})
export class EditarPostagemPageModule {}
