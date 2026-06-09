import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  ong_destino_id?: number;
  ong_nome?: string;
  ong_avatar?: string;

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
    private toastCtrl: ToastController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const state = history.state;
    const dadosDenuncia = state?.['postagemSelecionada'] || state?.['denuncia'];

    if (dadosDenuncia) {
      this.denuncia = { ...dadosDenuncia };

      // 1. Descrição
      if (!this.denuncia.descricaoCompleta && this.denuncia.descricao) {
        this.denuncia.descricaoCompleta = this.denuncia.descricao;
      }

      // 2. Data
      if (dadosDenuncia.data_criacao && !this.denuncia.created_at) {
        this.denuncia.created_at = dadosDenuncia.data_criacao;
      }

      // 3. Fotos
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

      // 4. Usuário
      if (!this.denuncia.usuario) {
        this.denuncia.usuario = {
          id: dadosDenuncia.usuarios_id || dadosDenuncia.usuario_id,
          nome: dadosDenuncia.usuario_nome || dadosDenuncia.nome_usuario || 'Usuário Desconhecido',
          avatar: dadosDenuncia.usuario_foto || dadosDenuncia.foto_usuario || dadosDenuncia.avatar || '',
          localizacao: dadosDenuncia.localizacao_usuario || dadosDenuncia.localizacao || ''
        };
      }

      // 5. ONG — tenta montar do que já veio na postagem
      const ongId = dadosDenuncia.ong_destino_id;
      const ongNome = dadosDenuncia.ong_nome || dadosDenuncia.nome_ong || dadosDenuncia.ong_destino_nome || null;
      const ongAvatar = dadosDenuncia.ong_avatar || dadosDenuncia.foto_ong || dadosDenuncia.ong_destino_foto || null;

      if (ongNome) {
        // API já trouxe os dados da ONG no JOIN
        this.denuncia.ong = {
          id: ongId,
          nome: ongNome,
          avatar: this.tratarAvatar(ongAvatar)
        };
      } else if (ongId) {
        // API só trouxe o ID — busca separado
        this.buscarOng(ongId);
      }
    }

    this.aplicarCriadorSeguranca();
    this.tratarAvatarUsuario();
  }

  buscarOng(ongId: number) {
    this.http.get<any>(`http://localhost:3000/api/usuarios/${ongId}`).subscribe({
      next: (ong) => {
        if (ong) {
          this.denuncia.ong = {
            id: ong.id,
            nome: ong.nome || 'ONG',
            avatar: this.tratarAvatar(ong.foto_perfil || ong.avatar || '')
          };
        }
      },
      error: () => {
        // Se não conseguir buscar, não exibe o card da ONG
      }
    });
  }

  tratarAvatar(avatar: string): string {
    const av = String(avatar || '').trim();
    if (!av || av === 'null' || av === 'undefined' || av === '') {
      return 'assets/images/default-avatar.png';
    }
    if (!av.startsWith('http') && !av.startsWith('assets')) {
      return 'http://localhost:3000/uploads/' + av;
    }
    return av;
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
    if (!criadorId) return;
    this.navCtrl.navigateForward('/perfil-publico', {
      state: { usuario_id: criadorId }
    });
  }

  verPerfilOng() {
    const ongId = this.denuncia.ong?.id;
    if (!ongId) return;
    this.navCtrl.navigateForward('/perfil-publico', {
      state: { usuario_id: ongId }
    });
  }
}