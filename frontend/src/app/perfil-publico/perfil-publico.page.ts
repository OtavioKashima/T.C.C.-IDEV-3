import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-perfil-publico',
  templateUrl: './perfil-publico.page.html',
  styleUrls: ['./perfil-publico.page.scss'],
  standalone: false
})
export class PerfilPublicoPage implements OnInit {

  tabAtiva: string = 'adocoes';
  adocoes: any[] = [];

  ong: any = {
    nome: '',
    cidade: '',
    estado: '',
    descricao: '',
    avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
    admin: null
  };

  postagens: any[] = [];
  denuncias: any[] = [];
  comunicados: any[] = [];

  usuarioId: number = 0;

  readonly urlUploads = 'http://localhost:3000/uploads/';
  readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private location: Location,
    private router: Router,
    private navCtrl: NavController,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['usuario_id']) {
      this.usuarioId = nav.extras.state['usuario_id'];
      this.carregarPerfil();
    } else {
      this.goBack();
    }
  }

  carregarPerfil() {
    this.http.get(`${this.apiUrl}/usuarios/${this.usuarioId}`).subscribe({
      next: (res: any) => {
        this.ong = {
          id: this.usuarioId,
          nome: res.nome,
          cidade: res.cidade || 'Local não informado',
          estado: res.estado || '',
          descricao: res.bio || '',
          avatar: res.foto_perfil
            ? `${this.urlUploads}${res.foto_perfil}`
            : 'https://ionicframework.com/docs/img/demos/avatar.svg',
          foto_perfil: res.foto_perfil,
          admin: res.admin !== undefined ? Number(res.admin) : 0
        };

        if (this.ong.admin === 0) {
          this.tabAtiva = 'denuncias';
        }

        this.carregarPostagensUsuario();
      },
      error: (err) => {
        console.error('Erro ao buscar perfil:', err);
        this.mostrarToast('Erro ao carregar perfil.');
      }
    });
  }

  carregarPostagensUsuario() {
    this.http.get(`${this.apiUrl}/postagens/usuario/${this.usuarioId}`).subscribe({
      next: (res: any) => {
        this.postagens = [];
        this.denuncias = [];
        this.comunicados = [];

        res.forEach((post: any) => {
          let fotosArray: string[] = [];
          let imagemUrl = 'assets/img/placeholder.png';

          if (post.foto) {
            try {
              const fotosParsed = JSON.parse(post.foto);
              fotosArray = Array.isArray(fotosParsed) ? fotosParsed : [post.foto];
              if (fotosArray.length > 0) imagemUrl = `${this.urlUploads}${fotosArray[0]}`;
            } catch (e) {
              fotosArray = [post.foto];
              imagemUrl = `${this.urlUploads}${post.foto}`;
            }
          }

          const postFormatado = {
            ...post,
            id: post.id || post.id_postagem || post._id,
            imagem: imagemUrl,
            fotosArray: fotosArray,
            saved: false,
            autor: this.ong.nome,
            // Dados do criador para usar no comunicado
            usuario_nome: this.ong.nome,
            usuario_foto: this.ong.foto_perfil,
            usuario: {
              id: this.ong.id,
              nome: this.ong.nome,
              foto_perfil: this.ong.foto_perfil,
              avatar: this.ong.avatar
            }
          };

          if (post.tipo_postagem === 'adocao') {
            this.postagens.push(postFormatado);
          } else if (post.tipo_postagem === 'denuncia') {
            this.denuncias.push(postFormatado);
          } else if (post.tipo_postagem === 'comunicado') {
            this.comunicados.push(postFormatado);
          }
        });

        if (this.ong.admin === 2) {
          this.carregarDenunciasDirecionadas();
        }
      },
      error: (err) => {
        console.error('Erro ao buscar postagens:', err);
      }
    });
  }

  carregarDenunciasDirecionadas() {
    this.http.get(`${this.apiUrl}/postagens/direcionadas/${this.usuarioId}`).subscribe({
      next: (res: any) => {
        res.forEach((post: any) => {
          let fotosArray: string[] = [];
          let imagemUrl = 'assets/img/placeholder.png';

          if (post.foto) {
            try {
              const fotosParsed = JSON.parse(post.foto);
              fotosArray = Array.isArray(fotosParsed) ? fotosParsed : [post.foto];
              if (fotosArray.length > 0) imagemUrl = `${this.urlUploads}${fotosArray[0]}`;
            } catch (e) {
              fotosArray = [post.foto];
              imagemUrl = `${this.urlUploads}${post.foto}`;
            }
          }

          const avatarAutor = post.foto_autor
            ? `${this.urlUploads}${post.foto_autor}`
            : 'https://ionicframework.com/docs/img/demos/avatar.svg';

          const postFormatado = {
            ...post,
            id: post.id,
            imagem: imagemUrl,
            fotosArray: fotosArray,
            saved: false,
            autor: post.nome_autor,
            usuario: {
              id: post.usuarios_id,
              nome: post.nome_autor,
              foto_perfil: post.foto_autor,
              avatar: avatarAutor
            }
          };

          const jaExiste = this.denuncias.some(d => d.id === postFormatado.id);
          if (!jaExiste) {
            this.denuncias.push(postFormatado);
          }
        });

        this.denuncias.sort((a, b) =>
          new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
        );
      },
      error: (err) => console.error('Erro ao buscar denúncias direcionadas:', err)
    });
  }

  // ==========================================
  // NAVEGAÇÃO E AÇÕES
  // ==========================================

  goBack() {
    this.location.back();
  }

  compartilharOng() {
    this.mostrarToast(`Link para doar a ${this.ong.nome} copiado!`);
  }

  compartilhar(post: any) {
    this.mostrarToast('Link de adoção copiado!');
  }

  compartilharDenuncia(post: any) {
    this.mostrarToast('Link de denúncia copiado!');
  }

  salvar(post: any) {
    post.saved = !post.saved;
    const msg = post.saved ? 'Postagem salva.' : 'Removido dos salvos.';
    this.mostrarToast(msg);
  }

  abrirDetalhe(post: any) {
    localStorage.setItem('ong_perfil_atual', JSON.stringify(this.ong));
    this.router.navigate(['/adocoes-detalhes'], {
      state: { pet: post, postagemSelecionada: post }
    });
  }

  abrirDenuncia(d: any) {
    localStorage.setItem('ong_perfil_atual', JSON.stringify(this.ong));
    this.router.navigate(['/denuncias-detalhes'], {
      state: { pet: d, postagemSelecionada: d }
    });
  }

  abrirComunicado(aviso: any) {
    // Salva no localStorage como fallback
    localStorage.setItem('ong_perfil_atual', JSON.stringify(this.ong));

    // Passa a ONG diretamente no state para garantir foto/nome corretos
    this.router.navigate(['/comunicado'], {
      state: {
        comunicado: aviso,
        ong: this.ong  // ← CORREÇÃO: passa a ONG junto
      }
    });
  }

  irParaDoacao() {
    this.navCtrl.navigateForward('/doacoes', {
      state: { ongSelecionada: this.ong }
    });
  }

  abrirDetalhes(post: any) {
    this.router.navigate(['/comunicado'], {
      state: { postagemSelecionada: post }
    });
  }

  abrirChat() {
    this.router.navigate(['/chat-ong'], {
      state: {
        ong: this.ong,
        pet: null
      }
    });
  }

  async mostrarToast(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }
}