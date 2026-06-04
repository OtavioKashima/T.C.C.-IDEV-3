import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

// 1. Atualizamos a interface para aceitar um array de imagens
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

  // 🌟 NOVOS CAMPOS ADICIONADOS PARA RESOLVER O ERRO
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

  // Variável para controlar qual bolinha do carrossel está ativa
  imagemAtiva: number = 0;
  postagem: any;

  pet: Pet = {
    titulo: 'Carregando...',
    idade: '',
    imagem: '', // Fallback
    imagens: [], // Array vazio inicial
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
    // 🟢 SOLUÇÃO: Usamos o history.state que garante o recebimento no ngOnInit
    const estadoNavegacao = history.state;

    if (estadoNavegacao) {

      // Tenta pegar os dados tanto se vier como 'pet' ou como 'postagemSelecionada' (Evita quebrar em outras telas)
      const dadosRecebidos = estadoNavegacao.pet || estadoNavegacao.postagemSelecionada;

      if (dadosRecebidos) {
        // 1. Alinha os dados para a estrutura que o resto do seu código e HTML esperam (this.pet)
        this.pet = { ...dadosRecebidos };
        this.postagem = dadosRecebidos; // Se o seu HTML usar 'postagem', já fica preenchido também

        // Endereço padrão da API onde ficam as fotos
        const urlDoServidor = 'http://localhost:3000/uploads/';

        // Pega o 'fotosArray' criado na listagem (ou tenta ler o 'foto' bruto se der F5)
        let listaDeFotos: string[] = [];

        if ((this.pet as any).fotosArray && (this.pet as any).fotosArray.length > 0) {
          listaDeFotos = (this.pet as any).fotosArray;
        } else if ((this.pet as any).foto) {
          // Fallback de segurança idêntico à sua função do feed
          try {
            listaDeFotos = JSON.parse((this.pet as any).foto);
          } catch (e) {
            listaDeFotos = [(this.pet as any).foto];
          }
        }

        // Agora mapeamos aplicando a URL do servidor antes de cada nome de imagem
        if (listaDeFotos && listaDeFotos.length > 0) {
          this.pet.imagens = listaDeFotos.map(nomeDaImagem => {
            if (nomeDaImagem.startsWith('http')) {
              return nomeDaImagem;
            }
            return `${urlDoServidor}${nomeDaImagem}`;
          });
        } else {
          // Se realmente não tiver fotos na galeria, usa a imagem principal de capa
          if (this.pet.imagem) {
            const imagemCapa = this.pet.imagem.startsWith('http')
              ? this.pet.imagem
              : `${urlDoServidor}${this.pet.imagem}`;
            this.pet.imagens = [imagemCapa];
          } else {
            this.pet.imagens = [];
          }
        }

        // 💡 SE A SUA TELA TIVER UMA VARIÁVEL "loading", DESLIGUE-A AQUI:
        // this.carregando = false; 

        console.log('Dados processados com sucesso no Detalhes:', this.pet);

      } else {
        console.warn('Nenhum dado de pet ou postagem encontrado no history.state.');
      }
    }
    this.aplicarCriadorSeguranca();
  }

  // 🌟 NOVA FUNÇÃO: Atualiza a bolinha ativa ao deslizar o carrossel
  onScroll(event: any) {
    const scrollLeft = event.target.scrollLeft;
    const width = event.target.clientWidth;
    // Calcula em qual índice o scroll está focado
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
          text: `Conheça ${this.pet.titulo}! ${this.pet.descricaoCompleta}`
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
    // Pegamos o ID do criador da postagem que veio do banco de dados (usuarios_id)
    const criadorId = (this.pet as any).usuarios_id;

    if (!criadorId) {
      console.error('Não foi possível encontrar o ID do criador desta postagem.');
      return;
    }

    // Navega para a tela de perfil público passando o ID do criador
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

    this.router.navigate(['/chat-ong'], {
      state: {
        // 🟢 Crie um objeto "ong" puxando os dados de dentro da sua postagem
        // Obs: Troque 'this.postagem' para o nome correto da sua variável (ex: this.pet)
        ong: {
          nome: this.postagem.nome_ong || 'ONG', // Adapte para o campo real do seu banco
          avatar: this.postagem.avatar_ong       // Adapte para o campo real do seu banco
        },
        pet: this.postagem
      }
    });
  }

  aplicarCriadorSeguranca() {
    // 1. Descobre o tipo real da postagem e o ID do criador
    const tipoReal = this.pet?.tipo_usuario || (this.postagem as any)?.tipo_usuario;
    const criadorId = this.pet?.usuario_id || (this.pet as any)?.usuarios_id;

    // 2. Unifica os nomes de variáveis que podem vir do banco (evita que a foto venha vazia)
    if (this.pet) {
      this.pet.usuario_nome = this.pet.usuario_nome || (this.pet as any).nome_usuario || (this.pet as any).nome_ong || 'Usuário Desconhecido';
      // Procura a foto em todas as variáveis possíveis que sua API pode estar retornando
      this.pet.usuario_foto = this.pet.usuario_foto || (this.pet as any).foto_usuario || (this.pet as any).avatar_ong || (this.pet as any).avatar || '';
      this.pet.tipo_usuario = tipoReal || 'usuario';
    }

    if (this.postagem) {
      this.postagem.usuario_nome = this.postagem.usuario_nome || this.postagem.nome_usuario || this.postagem.nome_ong || 'Usuário Desconhecido';
      this.postagem.usuario_foto = this.postagem.usuario_foto || this.postagem.foto_usuario || this.postagem.avatar_ong || this.postagem.avatar || '';
      this.postagem.tipo_usuario = tipoReal || 'usuario';
    }

    // 3. SE FOR ADMIN: Força os dados de administrador visualmente e encerra
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

    // 4. CHECAGEM DO LOCALSTORAGE CORRETA:
    // Só usa a foto salva no celular SE a postagem REALMENTE pertencer à pessoa logada!
    const ongSalva = localStorage.getItem('ong_perfil_atual');
    if (ongSalva) {
      const ongData = JSON.parse(ongSalva);
      
      // Verifica se o ID de quem postou bate com o seu ID
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