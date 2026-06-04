// tabs.routing.module.ts CORRIGIDO

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '', // Vazio, pois o AppRoutingModule já definiu o path '/tabs'
    component: TabsPage,
    children: [
      {
        path: 'adocoes', // Rota completa: /tabs/adocoes
        loadChildren: () => import('../adocoes/adocoes.module').then(m => m.AdocoesPageModule)
      },
      {
        path: 'inicio', 
        loadChildren: () => import('../inicio/inicio.module').then(m => m.InicioPageModule)
      },
      {
        path: 'denuncias', // Rota completa: /tabs/denuncias
        loadChildren: () => import('../denuncias/denuncias.module').then( m => m.DenunciasPageModule)
      },
      {
        path: 'perfil', // Rota completa: /tabs/perfil
        loadChildren: () => import('../perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: 'post', // Rota completa: /tabs/perfil
        loadChildren: () => import('../postagem/postagem.module').then(m => m.PostagemPageModule)
      },
      {
        // Redirecionamento padrão DENTRO das tabs
        path: '',
        redirectTo: 'inicio', // Ao navegar para /tabs, redireciona para /tabs/incio
        pathMatch: 'full'
      }
    ]
  }
  // O redirecionamento { path: '', redirectTo: '/tabs/...', ... } foi removido daqui
  // O redirecionamento principal agora está no app-routing.module.ts
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}