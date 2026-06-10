import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

interface Denuncia {
  titulo: string;
  descricao: string;
  descricaoCompleta?: string;
  localizacao?: string;
  local?: string;
  fotosArray?: string[];
  dataFormatada?: string;
  created_at?: string;
  data_criacao?: string;

  usuario?: {
    id?: number;
    nome: string;
    avatar: string;
    localizacao?: string;
  };

  ong?: {
    id?: number;
    nome: string;
    avatar: string;
    tipo?: string;
  };
}

@Component({
  selector: 'app-denuncias-detalhes',
  templateUrl: './denuncias-detalhes.page.html',
  styleUrls: ['./denuncias-detalhes.page.scss'],
  standalone: false
})
export class DenunciasDetalhesPage implements OnInit {

  denuncia: Denuncia = {
    titulo: 'Carregando...',
    descricao: '',
    fotosArray: [],
    usuario: {
      nome: 'Carregando...',
      avatar: 'assets/images/default-avatar.png'
    }
  };

  constructor(
    private location: Location,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const state = history.state;
    const dadosDenuncia = state?.['postagemSelecionada'] || state?.['denuncia'];

    if (dadosDenuncia) {
      this.denuncia = { ...dadosDenuncia };

      // 1. Ajuste da Descrição
      if (!this.denuncia.descricaoCompleta && this.denuncia.descricao) {
        this.denuncia.descricaoCompleta = this.denuncia.descricao;
      }

      // 2. Ajuste da Data
      if (dadosDenuncia.data_criacao && !this.denuncia.created_at) {
        this.denuncia.created_at = dadosDenuncia.data_criacao;
      }

      // 3. Ajuste de Fotos
      if (!this.denuncia.fotosArray) {
        if (dadosDenuncia.foto) {
          try {
            this.denuncia.fotosArray = JSON.parse(dadosDenuncia.foto);
          } catch (e) {
            this.denuncia.fotosArray = [dadosDenuncia.foto];
          }
        } else if (dadosDenuncia.imagem) {
          this.denuncia.fotosArray = [dadosDenuncia.imagem];
        } else {
          this.denuncia.fotosArray = [];
        }
      }

      // 4. Ajuste do Usuário
      if (!this.denuncia.usuario) {
        this.denuncia.usuario = {
          id: dadosDenuncia.usuarios_id || dadosDenuncia.usuario_id,
          nome: dadosDenuncia.usuario_nome || dadosDenuncia.nome_usuario || dadosDenuncia.nome_ong || 'Usuário Desconhecido',
          avatar: dadosDenuncia.usuario_foto || dadosDenuncia.foto_usuario || dadosDenuncia.avatar_ong || dadosDenuncia.avatar || '',
          localizacao: dadosDenuncia.localizacao_usuario || dadosDenuncia.localizacao || ''
        };
      }

    // 5. Ajuste da ONG vinculada
const nomeOng   = dadosDenuncia.ong_nome;
const avatarOng = dadosDenuncia.ong_foto || '';
const idOng     = dadosDenuncia.ong_id;

if (nomeOng) {
  this.denuncia.ong = {
    id:     idOng,
    nome:   nomeOng,
    avatar: avatarOng,
    tipo:   'ong'
  };
}
    }

    this.aplicarCriadorSeguranca();
    this.tratarAvatarUsuario();
  }

  aplicarCriadorSeguranca() {
    const ongSalva = localStorage.getItem('ong_perfil_atual');

    if (ongSalva && this.denuncia.usuario) {
      const ongData = JSON.parse(ongSalva);

      if (this.denuncia.usuario.id && ongData.id && this.denuncia.usuario.id === ongData.id) {
        this.denuncia.usuario.nome = ongData.nome;
        this.denuncia.usuario.avatar = ongData.avatar;
      }
    }
  }

  tratarAvatarUsuario() {
    if (this.denuncia.usuario) {
      let avatar = String(this.denuncia.usuario.avatar).trim();

      if (!avatar || avatar === 'null' || avatar === 'undefined' || avatar === '[object Object]' || avatar === '') {
        this.denuncia.usuario.avatar = 'assets/images/default-avatar.png';
      } else if (!avatar.startsWith('http') && !avatar.startsWith('assets')) {
        this.denuncia.usuario.avatar = 'http://localhost:3000/uploads/' + avatar;
      }
    }
  }

  async compartilhar() {
    if (navigator.share) {
      try {
        const localShare = this.denuncia.localizacao || this.denuncia.local || 'Local não informado';
        await navigator.share({
          title: `Denúncia: ${this.denuncia.titulo}`,
          text: `Ajude neste caso: ${this.denuncia.titulo}. Local: ${localShare}`
        });
      } catch (err) {
        console.error('Erro ao compartilhar', err);
      }
    }
  }

  goBack() {
    this.location.back();
  }

  verPerfilUsuario() {
    const criadorId = this.denuncia.usuario?.id;

    if (!criadorId) {
      console.error('ID do usuário não encontrado.');
      return;
    }

    this.navCtrl.navigateForward('/perfil-publico', {
      state: { usuario_id: criadorId }
    });
  }

  irParaPerfilOng() {
    const ongId = this.denuncia.ong?.id;

    if (!ongId) {
      console.error('ID da ONG não encontrado.');
      return;
    }

    this.navCtrl.navigateForward('/perfil-publico', {
      state: { usuario_id: ongId }
    });
  }
}
