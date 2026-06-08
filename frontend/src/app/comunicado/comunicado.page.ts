import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

interface Comunicado {
  id?: number;
  titulo: string;
  texto: string;
  data?: string;
  imagem?: string;
  imagens?: string[];
  fotosArray?: string[];
  prioridade?: 'normal' | 'alta' | 'urgente';
  usuarios_id?: number;
  usuario_nome?: string;
  usuario_foto?: string;
  tipo_usuario?: string;
}

@Component({
  selector: 'app-comunicado',
  templateUrl: './comunicado.page.html',
  styleUrls: ['./comunicado.page.scss'],
  standalone: false
})
export class ComunicadoPage implements OnInit {

  imagemAtiva: number = 0;
  readonly urlUploads = 'http://localhost:3000/uploads/';

  comunicado: Comunicado = {
    titulo: 'Carregando...',
    texto: '',
    imagens: [],
    prioridade: 'normal'
  };

  // Dados da ONG para o owner-card
  ongAvatar: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  ongNome: string = '';
  ongId: number = 0;
  ongTipoUsuario: string = 'ong';

  constructor(
    private location: Location,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const state = history.state;
    const dadosBrutos = state?.['postagemSelecionada'] || state?.['comunicado'];

    // ONG passada diretamente na navegação (mais confiável)
    const ongState = state?.['ong'];

    // Fallback: localStorage salvo pelo perfil-publico
    const ongLocalStorage = localStorage.getItem('ong_perfil_atual');
    const ongSalva = ongState || (ongLocalStorage ? JSON.parse(ongLocalStorage) : null);

    if (dadosBrutos) {
      const dados = dadosBrutos;

      this.comunicado = {
        id: dados.id,
        titulo: dados.titulo,
        texto: dados.descricao || dados.texto || '',
        data: dados.data_criacao,
        prioridade: dados.prioridade || 'normal',
        usuarios_id: dados.usuarios_id,
        usuario_nome: dados.usuario_nome,
        usuario_foto: dados.usuario_foto,
        tipo_usuario: dados.tipo_usuario || 'ong'
      };

      // Monta array de imagens
      let listaDeFotos: string[] = [];
      if (dados.fotosArray && dados.fotosArray.length > 0) {
        listaDeFotos = dados.fotosArray;
      } else if (dados.foto) {
        try {
          listaDeFotos = JSON.parse(dados.foto);
        } catch (e) {
          listaDeFotos = [dados.foto];
        }
      }

      this.comunicado.imagens = listaDeFotos.map((nomeDaImagem: string) => {
        if (nomeDaImagem.startsWith('http')) return nomeDaImagem;
        return `${this.urlUploads}${nomeDaImagem}`;
      });
    }

    // Resolve nome/avatar/id da ONG
    this.resolverDadosOng(ongSalva);
  }

  resolverDadosOng(ongSalva: any) {
    const c = this.comunicado as any;

    // Nome
    this.ongNome = c.usuario_nome
      || c.nome_usuario
      || c.autor
      || ongSalva?.nome
      || 'ONG';

    // ID para navegação
    this.ongId = c.usuarios_id || ongSalva?.id || 0;

    // Tipo
    this.ongTipoUsuario = c.tipo_usuario || 'ong';

    // Avatar — evita dupla concatenação de URL
    const fotoRaw = c.usuario_foto || c.foto_usuario;

    if (fotoRaw && fotoRaw !== 'null') {
      this.ongAvatar = fotoRaw.startsWith('http')
        ? fotoRaw
        : `${this.urlUploads}${fotoRaw}`;
    } else if (ongSalva?.avatar) {
      // ongSalva.avatar já é URL completa
      this.ongAvatar = ongSalva.avatar;
    } else if (ongSalva?.foto_perfil) {
      this.ongAvatar = ongSalva.foto_perfil.startsWith('http')
        ? ongSalva.foto_perfil
        : `${this.urlUploads}${ongSalva.foto_perfil}`;
    } else {
      this.ongAvatar = 'https://ionicframework.com/docs/img/demos/avatar.svg';
    }
  }

  onScroll(event: any) {
    const scrollLeft = event.target.scrollLeft;
    const width = event.target.clientWidth;
    this.imagemAtiva = Math.round(scrollLeft / width);
  }

  async compartilhar() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Comunicado: ${this.comunicado.titulo}`,
          text: `Leia o comunicado: ${this.comunicado.titulo}\n\n${this.comunicado.texto}`
        });
      } catch (err) {
        console.error('Erro ao compartilhar', err);
      }
    }
  }

  goBack() {
    this.location.back();
  }

  irParaPerfilOng() {
    if (!this.ongId) {
      console.error('ID da ONG não encontrado.');
      return;
    }
    this.navCtrl.navigateForward('/perfil-publico', {
      state: { usuario_id: this.ongId }
    });
  }
}