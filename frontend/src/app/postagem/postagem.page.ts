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
  tipoSelecionado = '';
  isAdminOuOng = false;
  isAdmin = false;

  tipo_postagem = '';
  titulo = '';
  descricao = '';
  localizacao = '';
  raca = '';
  genero = '';
  idade: number | null = null;
  unidadeIdade = 'meses';
  sub_tipo = 'normal';

  // 🆕 Campo de valor para doações
  valor_doacao: number | null = null;

  fotosSelecionadas: File[] = [];
  fotosPreviews: string[] = [];
  fotoSelecionada: File | null = null;
  fotoPreview: string | ArrayBuffer | null = null;

  ongs: any[] = [];
  ongDestino: string = '';

  constructor(private http: HttpClient, private navCtrl: NavController) {}

  ngOnInit() {
    const nivelAdmin = localStorage.getItem('admin');

    if (nivelAdmin === '1') {
      this.isAdmin = true;
      this.isAdminOuOng = true;
    } else if (nivelAdmin === '2') {
      this.isAdmin = false;
      this.isAdminOuOng = true;
    } else {
      this.isAdmin = false;
      this.isAdminOuOng = false;
      this.tipoSelecionado = 'denuncia';
      this.tipo_postagem = 'denuncia';
    }
    this.carregarOngs();
  }

  carregarOngs() {
    this.http.get('http://localhost:3000/api/ongs').subscribe({
      next: (res: any) => { this.ongs = res; },
      error: (err: any) => console.error('Erro ao carregar ONGs', err)
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
        reader.onload = (e: any) => { this.fotosPreviews.push(e.target.result); };
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

    // 🆕 Validação básica de doação
    if (this.tipo_postagem === 'doacao' && this.valor_doacao !== null && this.valor_doacao <= 0) {
      alert('Informe um valor válido para a doação.');
      return;
    }

    const formData = new FormData();
    formData.append('tipo_postagem', this.tipo_postagem);
    formData.append('titulo', this.titulo);
    formData.append('descricao', this.descricao);

    if (this.isAdminOuOng) {
      formData.append('fixado', this.sub_tipo === 'fixado' ? '1' : '0');
    } else {
      formData.append('fixado', '0');
    }

    if (this.localizacao) formData.append('localizacao', this.localizacao);

    if (this.tipo_postagem === 'denuncia' && this.ongDestino) {
      formData.append('ong_id', this.ongDestino);
    }

    if (this.tipo_postagem !== 'denuncia' && this.tipo_postagem !== 'comunicado') {
      if (this.raca) formData.append('raca', this.raca);
      if (this.genero) formData.append('genero', this.genero);
      if (this.idade) {
        formData.append('idade', `${this.idade} ${this.unidadeIdade}`);
      }
    }

    // 🆕 Envia o valor da doação (o backend calcula se é relevante)
    if (this.tipo_postagem === 'doacao' && this.valor_doacao !== null) {
      formData.append('valor_doacao', String(this.valor_doacao));
    }

    if (this.fotosSelecionadas.length > 0) {
      this.fotosSelecionadas.forEach(foto => formData.append('fotos', foto));
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('http://localhost:3000/api/postagens', formData, { headers }).subscribe({
      next: (res: any) => {
        console.log('Postagem salva!', res);

        // 🆕 Avisa o usuário se a doação foi marcada como relevante
        if (res.prioridade === 'relevante') {
          alert('✅ Postagem criada! A ONG foi notificada sobre essa doação de alto valor.');
        } else if (res.prioridade === 'urgente' || res.prioridade === 'alta') {
          alert('🚨 Denúncia enviada e classificada como urgente! A ONG foi notificada.');
        }

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