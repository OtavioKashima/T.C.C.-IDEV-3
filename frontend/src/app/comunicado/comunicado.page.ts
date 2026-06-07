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

  // Informações do criador
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

  comunicado: Comunicado = {
    titulo: 'Carregando...',
    texto: '',
    imagens: [],
    prioridade: 'normal'
  };

  constructor(
    private location: Location,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const state = history.state;
    const dadosBrutos = state?.['postagemSelecionada'] || state?.['comunicado'];

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
        tipo_usuario: dados.usuario_admin ? 'admin' : 'usuario'
      };

      const urlDoServidor = 'http://localhost:3000/uploads/';
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

      if (listaDeFotos && listaDeFotos.length > 0) {
        this.comunicado.imagens = listaDeFotos.map(nomeDaImagem => {
          if (nomeDaImagem.startsWith('http')) return nomeDaImagem;
          return `${urlDoServidor}${nomeDaImagem}`;
        });
      } else {
        this.comunicado.imagens = [];
      }
    }

    this.aplicarCriadorSeguranca();
  }

  aplicarCriadorSeguranca() {
    const ongSalva = localStorage.getItem('ong_perfil_atual');

    if (ongSalva && this.comunicado) {
      const ongData = JSON.parse(ongSalva);
      let temp: any = this.comunicado;

      temp.usuario_nome = temp.usuario_nome || temp.nome_usuario || temp.autor || ongData.nome;
      temp.usuario_foto = temp.usuario_foto || temp.foto_usuario || ongData.avatar;
      temp.tipo_usuario = 'ong';
      temp.usuarios_id = temp.usuarios_id || ongData.id;
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
    const criadorId = (this.comunicado as any).usuarios_id;

    if (!criadorId) {
      console.error('Não foi possível encontrar o ID do criador desta postagem.');
      return;
    }

    this.navCtrl.navigateForward('/perfil-publico', {
      state: { usuario_id: criadorId }
    });
  }
}