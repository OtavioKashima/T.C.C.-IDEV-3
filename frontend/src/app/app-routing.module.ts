// app-routing.module.ts CORRIGIDO

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

const routes: Routes = [
  // Rotas que NÃO TÊM a barra de tabs
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then(m => m.HomePageModule)
  },

  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },

  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage)
  },  

  // ROTA PRINCIPAL QUE CARREGA O LAYOUT DE TABS
  // Todas as páginas com tabs (adocoes, perfil, etc.) virão DESTE módulo
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },

  // Redirecionamento padrão do app
  {
    path: '',
    redirectTo: 'home', // Ou 'login', dependendo da sua lógica de app
    pathMatch: 'full'
  },

  {
    path: 'recuperar-senha',
    loadChildren: () => import('./recuperar-senha/recuperar-senha.module').then( m => m.RecuperarSenhaPageModule)
  },
  {
    path: 'postagem',
    loadChildren: () => import('./postagem/postagem.module').then( m => m.PostagemPageModule)
  },
  {
    path: 'adocoes-detalhes',
    loadChildren: () => import('./adocoes-detalhes/adocoes-detalhes.module').then( m => m.AdocoesDetalhesPageModule)
  },
  {
    path: 'editar-perfil',
    loadChildren: () => import('./editar-perfil/editar-perfil.module').then( m => m.EditarPerfilPageModule)
  },
  {
    path: 'codigo-verificacao',
    loadChildren: () => import('./codigo-verificacao/codigo-verificacao.module').then( m => m.CodigoVerificacaoPageModule)
  },
  {
    path: 'nova-senha',
    loadChildren: () => import('./nova-senha/nova-senha.module').then( m => m.NovaSenhaPageModule)
  },
  {
    path: 'comentario',
    loadChildren: () => import('./comentario/comentario.module').then( m => m.ComentarioPageModule)
  },
  {
    path: 'denuncias-detalhes',
    loadChildren: () => import('./denuncias-detalhes/denuncias-detalhes.module').then( m => m.DenunciasDetalhesPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'editar-postagem/:id', 
    loadChildren: () => import('./editar-postagem/editar-postagem.module').then(m => m.EditarPostagemPageModule)
  },
  {
    path: 'perfil-publico',
    loadChildren: () => import('./perfil-publico/perfil-publico.module').then( m => m.PerfilPublicoPageModule)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'doacoes',
    loadChildren: () => import('./doacoes/doacoes.module').then( m => m.DoacoesPageModule)
  },  {
    path: 'comunicado',
    loadChildren: () => import('./comunicado/comunicado.module').then( m => m.ComunicadoPageModule)
  },
  {
    path: 'chat-ong',
    loadChildren: () => import('./chat-ong/chat-ong.module').then( m => m.ChatOngPageModule)
  }

  



  // As rotas 'adocoes', 'doacoes', 'denuncias' FORAM REMOVIDAS DAQUI
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}