import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: false
})
export class EditarPerfilPage implements OnInit {
  usuario: any = { nome: '', telefone: '' };
  fotoSelecionada: File | null = null;

  // 🟢 Começa com o avatar padrão do Ionic
  previewFoto: string | ArrayBuffer | null = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.carregarDadosAtuais();
  }

  // 🟢 FUNÇÃO UNIFICADA: Puxa os dados e define a foto
  carregarDadosAtuais() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get('http://localhost:3000/api/perfil', { headers }).subscribe({
      next: (res: any) => {
        this.usuario = res;

        // Se ele tiver foto no banco, substitui o avatar do Ionic pela foto dele
        if (this.usuario && this.usuario.foto_perfil) {
          const timestamp = new Date().getTime(); // Quebra o cache da imagem
          this.previewFoto = `http://localhost:3000/uploads/${this.usuario.foto_perfil}?t=${timestamp}`;
        }
      },
      error: (err) => console.error('Erro ao buscar dados do perfil:', err)
    });
  }

  // 🟢 Seleciona uma nova foto e exibe na hora
  selecionarFoto(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.fotoSelecionada = event.target.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewFoto = e.target.result;
      };
      reader.readAsDataURL(this.fotoSelecionada!);
    }
  }

  // 🟢 Envia para o banco
  salvarPerfil() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.mostrarToast('Você precisa estar logado.', 'danger');
      return;
    }

    const formData = new FormData();
    formData.append('nome', this.usuario.nome || '');
    formData.append('telefone', this.usuario.telefone || '');

    // 🟢 Novos campos exclusivos da ONG adicionados ao FormData
    if (this.usuario.admin == 2) {
      formData.append('bio', this.usuario.bio || '');
      formData.append('cidade', this.usuario.cidade || '');
      formData.append('estado', this.usuario.estado || '');
      formData.append('chave_pix', this.usuario.chave_pix || '');
    }

    if (this.fotoSelecionada) {
      formData.append('foto', this.fotoSelecionada);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.put('http://localhost:3000/api/perfiledit', formData, { headers }).subscribe({
      next: (response: any) => {
        window.dispatchEvent(new CustomEvent('fotoAtualizada'));
        this.navCtrl.back();
      },
      error: (err) => {
        console.error('Erro ao salvar perfil:', err);
        this.mostrarToast('Erro ao salvar as alterações.', 'danger');
      }
    });
  }

  async mostrarToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2500,
      color: cor,
      position: 'top'
    });
    toast.present();
  }
}