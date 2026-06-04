import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 🔴 CORRIGIDO: Importado do lugar certo!
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  // Variável para os dados do usuário logado
  postagens: any[] = [];
  usuario: any = {
    nome: 'Carregando...',
    telefone: '',
    foto: null
  };

  // Listas para controle de dados e filtros
  minhasPostagens: any[] = [];
  postagensFiltradas: any[] = [];
  postagensExibidas: any[] = [];

  // Controle de Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 3;
  totalPaginas: number = 1;

  // Estados dos Filtros
  termoBusca: string = '';
  filtroSegmento: string = 'todas';

  totalPostagens: number = 0;

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
          if (this.usuario && this.usuario.foto_perfil) {
            const imgTimestamp = new Date().getTime();
            this.usuario.fotoUrl = `http://localhost:3000/uploads/${this.usuario.foto_perfil}?t=${imgTimestamp}`;
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Erro ao buscar usuário:', err) // 🔴 CORRIGIDO: Tipado explicitamente como any
      });
  }


  carregarMinhasPostagens() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get('http://localhost:3000/api/postperfil', { headers })
      .subscribe({
        next: (res: any) => {

          // 🟢 CORREÇÃO 1: Salvar na variável 'minhasPostagens' que é a base dos filtros
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

          // 🟢 CORREÇÃO 2: Chamar a função de filtro para renderizar a tela e a contagem
          this.aplicarFiltrosEPaginacao();

        },
        error: (err) => console.error('Erro ao buscar postagens do perfil', err)
      });
  }

  aplicarFiltrosEPaginacao() {
    // 1. Filtro de Aba (Recentes vs Todas)
    let listaBase = this.minhasPostagens;

    if (this.filtroSegmento === 'recentes') {
      // 🟢 CORREÇÃO 3: Lógica de 1 semana (7 dias) usando a data_criacao
      const umaSemanaAtras = new Date();
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

      listaBase = listaBase.filter(post => {
        if (!post.data_criacao) return false; // Prevenção caso o post não tenha data
        const dataPost = new Date(post.data_criacao);
        return dataPost >= umaSemanaAtras;
      });
    }

    // 2. Filtro de Busca
    let resultado = listaBase.filter(post => {
      const termo = this.termoBusca.toLowerCase().trim();
      if (!termo) return true; // Se não tem busca, passa tudo

      const tituloMatch = post.titulo?.toLowerCase().includes(termo);
      const descMatch = post.descricao?.toLowerCase().includes(termo);
      return tituloMatch || descMatch;
    });

    // 3. Contagem e Paginação
    this.postagensFiltradas = resultado;
    this.totalPaginas = Math.ceil(this.postagensFiltradas.length / this.itensPorPagina) || 1;

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas; // Garante que não fique numa página fantasma
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

  filtrarCategoria(event: any) {
    this.filtroSegmento = event.detail.value;
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
    // Aqui você direciona o usuário para a tela de edição, passando o ID da postagem.
    // Atenção: Ajuste a rota '/editar-postagem' para o nome da tela que você usa no seu app.
    this.navCtrl.navigateForward(`/editar-postagem/${post.id}`);
  }

  async mostrarAviso(mensagem: string, cor: string = 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2500, // Fica na tela por 2.5 segundos
      color: cor,     // Cores do Ionic: 'success', 'danger', 'warning'
      position: 'top' // Aparece no topo sem atrapalhar as abas (tabs)
    });
    toast.present();
  }

  // 2. Função para Excluir
  async excluirDenuncia(post: any) {
    const alert = await this.alertController.create({
      header: 'Excluir Postagem',
      message: 'Tem certeza que deseja apagar esta postagem? Essa ação não pode ser desfeita.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
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
                  // 1. Remove da tela
                  this.minhasPostagens = this.minhasPostagens.filter(p => p.id !== post.id);
                  if (typeof this.aplicarFiltrosEPaginacao === 'function') {
                    this.aplicarFiltrosEPaginacao();
                  }

                  // 🌟 2. MOSTRA O AVISO ELEGANTE DE SUCESSO
                  this.mostrarAviso('Postagem excluída com sucesso!', 'success');
                },
                error: (err: any) => {
                  console.error('Erro ao excluir:', err);

                  // 🌟 MOSTRA O AVISO ELEGANTE DE ERRO
                  this.mostrarAviso('Erro ao tentar excluir a postagem.', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }
  async copiarPix(chave: string) {
    if (!chave) return;
  
    // Copia para a área de transferência do celular/PC
    navigator.clipboard.writeText(chave).then(async () => {
      // Exibe um toast de sucesso (certifique-se de ter o ToastController importado no construtor)
      const toast = await this.toastController.create({
        message: 'Chave PIX copiada com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle'
      });
      toast.present();
    }).catch(err => {
      console.error('Erro ao copiar', err);
    });
  }
}
