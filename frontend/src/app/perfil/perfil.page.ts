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

  mudarTab(novaTab: string) {
    this.tabAtiva = novaTab;
    this.paginaAtual = 1;
    this.aplicarFiltrosEPaginacao();
  }

  aplicarFiltrosEPaginacao() {
    let listaBase = this.minhasPostagens;

    // Filtros por Abas
    if (this.usuario?.admin === 2) {
      if (this.tabAtiva === 'adocoes') {
        listaBase = listaBase.filter(post => post.tipo_postagem === 'adocao');
      } else if (this.tabAtiva === 'denuncias') {
        listaBase = listaBase.filter(post => post.tipo_postagem === 'denuncia');
      } else if (this.tabAtiva === 'doacoes') {
        listaBase = listaBase.filter(post => post.tipo_postagem === 'doacao' || post.tipo === 'doacao');
      } else if (this.tabAtiva === 'comunicados') {
        listaBase = listaBase.filter(post => post.tipo_postagem === 'comunicado');
      }
    }

    // Filtro de Busca Textual
    let resultado = listaBase.filter(post => {
      const termo = this.termoBusca.toLowerCase().trim();
      if (!termo) return true;

      const tituloMatch = post.titulo?.toLowerCase().includes(termo);
      const descMatch = post.descricao?.toLowerCase().includes(termo);
      const textoMatch = post.texto?.toLowerCase().includes(termo);
      return tituloMatch || descMatch || textoMatch;
    });

    this.postagensFiltradas = resultado;
    this.totalPaginas = Math.ceil(this.postagensFiltradas.length / this.itensPorPagina) || 1;

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }

    const indexInicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const indexFim = indexInicio + this.itensPorPagina;
    this.postagensExibidas = this.postagensFiltradas.slice(indexInicio, indexFim);

    this.cdr.detectChanges();
  }

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