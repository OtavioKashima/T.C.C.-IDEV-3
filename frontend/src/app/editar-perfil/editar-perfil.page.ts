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

  usuario: any = { nome: '', bio: '', cidade: '', estado: '', chave_pix: '', admin: 0 };
  fotoSelecionada: File | null = null;
  previewFoto: string | ArrayBuffer | null = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  readonly apiUrl = 'http://localhost:3000/api';
  readonly urlUploads = 'http://localhost:3000/uploads/';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.carregarDadosAtuais();
  }

  carregarDadosAtuais() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get(`${this.apiUrl}/perfil`, { headers }).subscribe({
      next: (res: any) => {
        this.usuario = res;

        if (this.usuario?.foto_perfil) {
          const timestamp = new Date().getTime();
          this.previewFoto = `${this.urlUploads}${this.usuario.foto_perfil}?t=${timestamp}`;
        }
      },
      error: (err) => console.error('Erro ao buscar dados do perfil:', err)
    });
  }

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

  salvarPerfil() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.mostrarToast('Você precisa estar logado.', 'danger');
      return;
    }

    const formData = new FormData();
    formData.append('nome', this.usuario.nome || '');

    if (this.usuario.admin == 2) {
      formData.append('bio', this.usuario.bio || '');
      formData.append('cidade', this.usuario.cidade || '');
      formData.append('estado', this.usuario.estado || '');
      formData.append('chave_pix', this.usuario.chave_pix || '');
    }

    if (this.fotoSelecionada) {
      formData.append('foto', this.fotoSelecionada);
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put(`${this.apiUrl}/perfiledit`, formData, { headers }).subscribe({
      next: async () => {
        window.dispatchEvent(new CustomEvent('fotoAtualizada'));
        await this.mostrarToast('Perfil atualizado!', 'success');
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