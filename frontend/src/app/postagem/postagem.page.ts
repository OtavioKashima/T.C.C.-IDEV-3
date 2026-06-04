import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-postagem',
  templateUrl: './postagem.page.html',
  styleUrls: ['./postagem.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PostagemPage implements OnInit {
  // Controle de exibição e permissão
  tipoSelecionado = '';
  isAdminOuOng = false;
  isAdmin = false; // 🛡️ Nova flag de controle exclusivo para Admin

  // Variáveis do formulário (Banco de Dados)
  tipo_postagem = '';
  titulo = '';
  descricao = '';
  localizacao = '';
  raca = '';
  genero = '';
  idade: number | null = null;
  unidadeIdade = 'meses';
  sub_tipo = 'normal'; // 🛡️ Define se o post é normal ou fixado

  // Variáveis para a imagem
  fotosSelecionadas: File[] = [];
  fotosPreviews: string[] = [];
  fotoSelecionada: File | null = null;
  fotoPreview: string | ArrayBuffer | null = null;

  ongs: any[] = [];
  ongDestino: string = ''; // Guarda o ID da ONG selecionada

  constructor(private http: HttpClient, private navCtrl: NavController) { }

  ngOnInit() {
    // 🟢 CORREÇÃO: Lê a nova chave 'admin' salva no Login (1 = Admin, 2 = ONG, 0 = Comum)
    const nivelAdmin = localStorage.getItem('admin');

    if (nivelAdmin === '1') {
      this.isAdmin = true;
      this.isAdminOuOng = true;
    } else if (nivelAdmin === '2') {
      this.isAdmin = false;
      this.isAdminOuOng = true;
    } else {
      // Se for usuário comum (0 ou não encontrado), bloqueia interações e força denúncia
      this.isAdmin = false;
      this.isAdminOuOng = false;
      this.tipoSelecionado = 'denuncia';
      this.tipo_postagem = 'denuncia';
    }
    this.carregarOngs();
  }

  carregarOngs() {
    // 🟢 Coloque aqui a URL da sua rota existente que chama o listarOngs do usuariosController
    this.http.get('http://localhost:3000/api/ongs').subscribe({
      next: (res: any) => {
        this.ongs = res; // O Angular vai pegar o id e o nome normalmente
      },
      error: (err: any) => {
        console.error('Erro ao carregar ONGs', err);
      }
    });
  }

  mudarTipo(event: any) {
    this.tipoSelecionado = event.detail.value;
    this.tipo_postagem = this.tipoSelecionado;
  }

  selecionarFoto(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.fotosSelecionadas.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.fotosPreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removerFoto(index: number) {
    this.fotosSelecionadas.splice(index, 1);
    this.fotosPreviews.splice(index, 1);
  }

  goBack(): void {
    this.navCtrl.navigateBack('/tabs');
  }

  enviarPostagem() {
    if (!this.tipo_postagem) {
      alert('Por favor, selecione o tipo de postagem!');
      return;
    }

    if (!this.titulo || !this.descricao) {
      alert('Título e Descrição são obrigatórios!');
      return;
    }

    if (this.tipo_postagem === 'denuncia' && !this.ongDestino) {
      alert('Selecione uma ONG para receber a denúncia!');
      return;
    }

    const formData = new FormData();
    formData.append('tipo_postagem', this.tipo_postagem);
    formData.append('titulo', this.titulo);
    formData.append('descricao', this.descricao);

    // 🛡️ Envia a classificação de destaque selecionada pelo administrador
    if (this.isAdminOuOng) {
      // Se o usuário selecionou "fixado", envia '1' para o backend. Se não, envia '0'.
      const valorFixado = this.sub_tipo === 'fixado' ? '1' : '0';
      formData.append('fixado', valorFixado);
    } else {
      // Se for usuário comum, garante que o banco receba 0 (não fixado)
      formData.append('fixado', '0');
    }

    if (this.localizacao) formData.append('localizacao', this.localizacao);
    if (this.tipo_postagem === 'denuncia' && this.ongDestino) {
      formData.append('ong_id', this.ongDestino);
    }

    if (this.tipo_postagem !== 'denuncia' && this.tipo_postagem !== 'comunicado') {
      if (this.raca) formData.append('raca', this.raca);
      if (this.genero) formData.append('genero', this.genero);

      // 🟢 ALTERAÇÃO AQUI: Junta o número com a unidade de tempo antes de salvar!
      if (this.idade) {
        const idadeFormatada = `${this.idade} ${this.unidadeIdade}`;
        formData.append('idade', idadeFormatada); // Vai enviar "3 meses" ou "2 anos"
      }
    }

    if (this.fotosSelecionadas.length > 0) {
      this.fotosSelecionadas.forEach((foto) => {
        formData.append('fotos', foto);
      });
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('http://localhost:3000/api/postagens', formData, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Postagem salva com sucesso!', res);
          window.dispatchEvent(new CustomEvent('postagemCriada'));
          this.navCtrl.navigateRoot('/tabs');
        },
        error: (err: any) => {
          console.error('Erro ao salvar', err.error);
          alert('Erro ao enviar postagem.');
        }
      });
  }
}