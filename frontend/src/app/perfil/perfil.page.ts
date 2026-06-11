import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {

  usuario: any = {
    nome: 'Carregando...',
    telefone: '',
    foto: null,
    admin: 0
  };

  tabAtiva: string = 'adocoes';

  minhasPostagens: any[] = [];
  denunciasDirecionadas: any[] = [];
  postagensFiltradas: any[] = [];
  postagensExibidas: any[] = [];

  paginaAtual: number = 1;
  itensPorPagina: number = 3;
  totalPaginas: number = 1;

  termoBusca: string = '';

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    window.addEventListener('fotoAtualizada', () => {
      this.carregarDadosUsuario();
    });
  }

  ngOnInit() {
    this.carregarDadosUsuario();
    this.carregarMinhasPostagens();
  }

  ionViewWillEnter() {
    if (!this.usuario || this.usuario.nome === 'Carregando...') {
      this.carregarDadosUsuario();
    }
    this.carregarMinhasPostagens();
  }

  carregarDadosUsuario() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const apiTimestamp = new Date().getTime();

    this.http.get(`http://localhost:3000/api/perfil?t=${apiTimestamp}`, { headers })
      .subscribe({
        next: (res: any) => {
          this.usuario = res;
          this.usuario.admin = res.admin !== undefined ? Number(res.admin) : 0;

          if (this.usuario.foto_perfil) {
            const imgTimestamp = new Date().getTime();
            this.usuario.fotoUrl = `http://localhost:3000/uploads/${this.usuario.foto_perfil}?t=${imgTimestamp}`;
          }

          if (this.usuario.admin === 0) {
            this.tabAtiva = 'denuncias';
          }

          if (this.usuario.admin === 2) {
            this.carregarDenunciasDirecionadas();
          }

          this.aplicarFiltrosEPaginacao();
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Erro ao buscar usuário:', err)
      });
  }

  carregarMinhasPostagens() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get('http://localhost:3000/api/postperfil', { headers })
      .subscribe({
        next: (res: any) => {
          this.minhasPostagens = res.map((post: any) => {
            if (post.foto) {
              try {
                post.fotosArray = JSON.parse(post.foto);
              } catch (e) {
                post.fotosArray = [post.foto];
              }
            } else {
              post.fotosArray = [];
            }
            return post;
          });

          this.aplicarFiltrosEPaginacao();
        },
        error: (err) => console.error('Erro ao buscar postagens do perfil', err)
      });
  }

  carregarDenunciasDirecionadas() {
    const token = localStorage.getItem('token');
    if (!token || !this.usuario?.id) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get(`http://localhost:3000/api/postagens/direcionadas/${this.usuario.id}`, { headers })
      .subscribe({
        next: (res: any) => {
          this.denunciasDirecionadas = res.map((post: any) => {
            let fotosArray: string[] = [];
            if (post.foto) {
              try {
                const parsed = JSON.parse(post.foto);
                fotosArray = Array.isArray(parsed) ? parsed : [post.foto];
              } catch (e) {
                fotosArray = [post.foto];
              }
            }

            const avatarAutor = post.foto_autor
              ? `http://localhost:3000/uploads/${post.foto_autor}`
              : 'https://ionicframework.com/docs/img/demos/avatar.svg';

            return {
              ...post,
              fotosArray,
              tipo_postagem: 'denuncia',
              autor: post.nome_autor,
              avatarAutor,
              usuario: {
                id: post.usuarios_id,
                nome: post.nome_autor,
                foto_perfil: post.foto_autor,
                avatar: avatarAutor
              }
            };
          });

          this.aplicarFiltrosEPaginacao();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao buscar denúncias direcionadas:', err)
      });
  }

  mudarTab(novaTab: string) {
    this.tabAtiva = novaTab;
    this.paginaAtual = 1;
    this.aplicarFiltrosEPaginacao();
  }

  aplicarFiltrosEPaginacao() {
    let listaBase: any[] = [];

    if (this.usuario?.admin === 2) {
      if (this.tabAtiva === 'adocoes') {
        listaBase = this.minhasPostagens.filter(post => post.tipo_postagem === 'adocao');

        // Ordena adoções: urgente > alta > prioritario > demais (igual ao perfil público)
        const ordemPrioridade: Record<string, number> = { urgente: 0, alta: 1, prioritario: 2 };
        listaBase = listaBase.sort((a, b) => {
          const pa = ordemPrioridade[a.prioridade] ?? 3;
          const pb = ordemPrioridade[b.prioridade] ?? 3;
          return pa - pb;
        });

      } else if (this.tabAtiva === 'denuncias') {
        const proprias = this.minhasPostagens.filter(post => post.tipo_postagem === 'denuncia');
        const idsJaAdicionados = new Set(proprias.map((p: any) => p.id));
        const novas = this.denunciasDirecionadas.filter((d: any) => !idsJaAdicionados.has(d.id));
        const todas = [...proprias, ...novas];

        // Ordena denúncias: urgente > alta > demais, depois por data desc
        const ordemPrioridade: Record<string, number> = { urgente: 0, alta: 1 };
        listaBase = todas.sort((a, b) => {
          const pa = ordemPrioridade[a.prioridade] ?? 2;
          const pb = ordemPrioridade[b.prioridade] ?? 2;
          if (pa !== pb) return pa - pb;
          return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
        });

      } else if (this.tabAtiva === 'doacoes') {
        listaBase = this.minhasPostagens.filter(
          post => post.tipo_postagem === 'doacao' || post.tipo === 'doacao'
        );

        // Ordena doações do MAIOR valor para o menor
        listaBase = listaBase.sort((a, b) => {
          const valorA = parseFloat(a.valor || a.valor_doacao || 0);
          const valorB = parseFloat(b.valor || b.valor_doacao || 0);
          return valorB - valorA;
        });

      } else if (this.tabAtiva === 'comunicados') {
        listaBase = this.minhasPostagens.filter(post => post.tipo_postagem === 'comunicado');

        // Ordena comunicados: urgente > alta > demais, depois por data desc
        const ordemPrioridade: Record<string, number> = { urgente: 0, alta: 1 };
        listaBase = listaBase.sort((a, b) => {
          const pa = ordemPrioridade[a.prioridade] ?? 2;
          const pb = ordemPrioridade[b.prioridade] ?? 2;
          if (pa !== pb) return pa - pb;
          return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
        });
      }

    } else {
      // Usuário comum: mostra denúncias próprias com prioridade
      listaBase = this.minhasPostagens;
      const ordemPrioridade: Record<string, number> = { urgente: 0, alta: 1 };
      listaBase = listaBase.sort((a, b) => {
        const pa = ordemPrioridade[a.prioridade] ?? 2;
        const pb = ordemPrioridade[b.prioridade] ?? 2;
        if (pa !== pb) return pa - pb;
        return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
      });
    }

    const resultado = listaBase.filter(post => {
      const termo = this.termoBusca.toLowerCase().trim();
      if (!termo) return true;
      return (
        post.titulo?.toLowerCase().includes(termo) ||
        post.descricao?.toLowerCase().includes(termo) ||
        post.texto?.toLowerCase().includes(termo)
      );
    });

    this.postagensFiltradas = resultado;
    this.totalPaginas = Math.ceil(this.postagensFiltradas.length / this.itensPorPagina) || 1;

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }

    const indexInicio = (this.paginaAtual - 1) * this.itensPorPagina;
    this.postagensExibidas = this.postagensFiltradas.slice(indexInicio, indexInicio + this.itensPorPagina);

    this.cdr.detectChanges();
  }

  // =========================================================================
  // NAVEGAÇÃO
  // =========================================================================

  abrirAdocao(post: any) {
    this.router.navigate(['/adocoes-detalhes'], { state: { pet: post, postagemSelecionada: post } });
  }

  abrirDenuncia(post: any) {
    this.router.navigate(['/denuncias-detalhes'], { state: { denuncia: post, postagemSelecionada: post } });
  }

  abrirComunicado(post: any) {
    this.router.navigate(['/comunicado'], { state: { comunicado: post, postagemSelecionada: post } });
  }

  // =========================================================================

  pesquisarPost(event: any) {
    this.termoBusca = event.target.value || '';
    this.paginaAtual = 1;
    this.aplicarFiltrosEPaginacao();
  }

  paginaAnterior() {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.aplicarFiltrosEPaginacao();
    }
  }

  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.aplicarFiltrosEPaginacao();
    }
  }

  editPerfil() {
    this.navCtrl.navigateForward('/editar-perfil');
  }

  logout() {
    localStorage.removeItem('token');
    this.usuario = null;
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  editarDenuncia(post: any) {
    this.navCtrl.navigateForward(`/editar-postagem/${post.id}`);
  }

  async mostrarAviso(mensagem: string, cor: string = 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2500,
      color: cor,
      position: 'top'
    });
    toast.present();
  }

  async excluirDenuncia(post: any) {
    const alert = await this.alertController.create({
      header: 'Excluir Postagem',
      message: 'Tem certeza que deseja apagar esta postagem? Essa ação não pode ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

            this.http.delete(`http://localhost:3000/api/postagensDelete/${post.id}`, { headers })
              .subscribe({
                next: () => {
                  this.minhasPostagens = this.minhasPostagens.filter(p => p.id !== post.id);
                  this.denunciasDirecionadas = this.denunciasDirecionadas.filter(p => p.id !== post.id);
                  this.aplicarFiltrosEPaginacao();
                  this.mostrarAviso('Postagem excluída com sucesso!', 'success');
                },
                error: (err: any) => {
                  console.error(err);
                  this.mostrarAviso('Erro ao tentar excluir a postagem.', 'danger');
                }
              });
          }
        }
      ]
    });
    await alert.present();
  }
}