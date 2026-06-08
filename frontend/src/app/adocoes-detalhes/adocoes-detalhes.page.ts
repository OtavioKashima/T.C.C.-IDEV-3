import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

interface Pet {
  titulo: string;
  idade: string;
  imagem: string;
  imagens?: string[];
  fotos?: string[];
  descricao: string;
  descricaoCompleta: string;
  raca?: string;
  genero?: string;
  usuario_id?: number;
  usuario_nome?: string;
  usuario_foto?: string;
  usuario_capa?: string;
  usuario_bio?: string;
  usuario_pix?: string;
  tipo_usuario?: 'ong' | 'usuario' | 'admin';
  cidade?: string;
  estado?: string;
}

@Component({
  selector: 'app-adocao-detalhe',
  templateUrl: './adocoes-detalhes.page.html',
  styleUrls: ['./adocoes-detalhes.page.scss'],
  standalone: false
})
export class AdocoesDetalhesPage implements OnInit {

  imagemAtiva: number = 0;
  postagem: any;

  pet: Pet = {
    titulo: 'Carregando...',
    idade: '',
    imagem: '',
    imagens: [],
    descricao: '',
    descricaoCompleta: '',
    raca: 'Não informada',
    genero: 'Não informado'
  };

  constructor(
    private location: Location,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const estadoNavegacao = history.state;

    if (estadoNavegacao) {
      const dadosRecebidos = estadoNavegacao.pet || estadoNavegacao.postagemSelecionada;

      if (dadosRecebidos) {
        this.pet = { ...dadosRecebidos };
        this.postagem = dadosRecebidos;

        const urlDoServidor = 'http://localhost:3000/uploads/';
        let listaDeFotos: string[] = [];

        if ((this.pet as any).fotosArray && (this.pet as any).fotosArray.length > 0) {
          listaDeFotos = (this.pet as any).fotosArray;
        } else if ((this.pet as any).foto) {
          try {
            listaDeFotos = JSON.parse((this.pet as any).foto);
          } catch (e) {
            listaDeFotos = [(this.pet as any).foto];
          }
        }

        if (listaDeFotos && listaDeFotos.length > 0) {
          this.pet.imagens = listaDeFotos.map(nomeDaImagem => {
            if (nomeDaImagem.startsWith('http')) {
              return nomeDaImagem;
            }
            return `${urlDoServidor}${nomeDaImagem}`;
          });
        } else {
          if (this.pet.imagem) {
            const imagemCapa = this.pet.imagem.startsWith('http')
              ? this.pet.imagem
              : `${urlDoServidor}${this.pet.imagem}`;
            this.pet.imagens = [imagemCapa];
          } else {
            this.pet.imagens = [];
          }
        }
      }
    }
    this.aplicarCriadorSeguranca();
  }

  onScroll(event: any) {
    const scrollLeft = event.target.scrollLeft;
    const width = event.target.clientWidth;
    this.imagemAtiva = Math.round(scrollLeft / width);
  }

  irParaComentarios() {
    this.navCtrl.navigateForward('/comentario', {
      state: { pet: this.pet }
    });
  }

  async compartilhar() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Adoção: ${this.pet.titulo}`,
          text: `Conheça ${this.pet.titulo}! ${this.pet.descricaoCompleta || this.pet.descricao}`
        });
      } catch (err) {
        console.error('Erro ao compartilhar', err);
      }
    }
  }

  showFiltros = false;

filtros = {
  estado: '',
  cidade: ''
};

toggleFiltros() {
  this.showFiltros = !this.showFiltros;
}

temFiltroAtivo(): boolean {
  return !!(this.filtros.estado || this.filtros.cidade);
}

limparTodosFiltros() {
  this.filtros = { estado: '', cidade: '' };
  this.aplicarFiltros();
}

limparCampo(campo: 'estado' | 'cidade') {
  this.filtros[campo] = '';
  this.aplicarFiltros();
}

aplicarFiltros() {
  // Implemente aqui a lógica de filtro específica desta tela
  // Ex: filtrar lista de pets por estado/cidade se houver
}

  goBack() {
    this.location.back();
  }

  irParaPerfilOng() {
    const criadorId = (this.pet as any).usuarios_id || this.pet.usuario_id;

    if (!criadorId) {
      console.error('Não foi possível encontrar o ID do criador desta postagem.');
      return;
    }

    this.navCtrl.navigateForward('/perfil-publico', {
      state: { usuario_id: criadorId }
    });
  }

  async queroAdotar() {
    const toast = await this.toastCtrl.create({
      message: 'Abrindo o chat com a ONG...',
      duration: 2000,
      color: 'success',
      icon: 'chatbubbles-outline'
    });
    await toast.present();

    const urlDoServidor = 'http://localhost:3000/uploads/';
    const fotoOng = this.pet.usuario_foto
      ? (this.pet.usuario_foto.startsWith('http')
          ? this.pet.usuario_foto
          : `${urlDoServidor}${this.pet.usuario_foto}`)
      : 'https://ionicframework.com/docs/img/demos/avatar.svg';

    this.router.navigate(['/chat-ong'], {
      state: {
        ong: {
          nome: this.pet.usuario_nome || 'ONG',
          avatar: fotoOng
        },
        pet: this.pet
      }
    });
  }

  aplicarCriadorSeguranca() {
    const tipoReal = this.pet?.tipo_usuario || (this.postagem as any)?.tipo_usuario;
    const criadorId = this.pet?.usuario_id || (this.pet as any)?.usuarios_id;

    if (this.pet) {
      this.pet.usuario_nome = this.pet.usuario_nome || (this.pet as any).nome_usuario || (this.pet as any).nome_ong || 'Usuário Desconhecido';
      this.pet.usuario_foto = this.pet.usuario_foto || (this.pet as any).foto_usuario || (this.pet as any).avatar_ong || (this.pet as any).avatar || '';
      this.pet.tipo_usuario = tipoReal || 'usuario';
    }

    if (this.postagem) {
      this.postagem.usuario_nome = this.postagem.usuario_nome || this.postagem.nome_usuario || this.postagem.nome_ong || 'Usuário Desconhecido';
      this.postagem.usuario_foto = this.postagem.usuario_foto || this.postagem.foto_usuario || this.postagem.avatar_ong || this.postagem.avatar || '';
      this.postagem.tipo_usuario = tipoReal || 'usuario';
    }

    if (tipoReal === 'admin') {
      if (this.pet) {
        this.pet.usuario_nome = 'Administrador do Sistema';
        this.pet.usuario_foto = '';
      }
      if (this.postagem) {
        this.postagem.usuario_nome = 'Administrador do Sistema';
        this.postagem.usuario_foto = '';
      }
      return;
    }

    const ongSalva = localStorage.getItem('ong_perfil_atual');
    if (ongSalva) {
      const ongData = JSON.parse(ongSalva);

      if (criadorId && ongData.id && criadorId === ongData.id) {
        if (this.pet) {
          this.pet.usuario_nome = ongData.nome;
          this.pet.usuario_foto = ongData.avatar;
          this.pet.tipo_usuario = 'ong';
        }
        if (this.postagem) {
          this.postagem.usuario_nome = ongData.nome;
          this.postagem.usuario_foto = ongData.avatar;
          this.postagem.tipo_usuario = 'ong';
        }
      }
    }
  }
}