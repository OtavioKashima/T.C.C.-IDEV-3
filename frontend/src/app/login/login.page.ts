import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, NavController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {

  usuario: string = '';
  senha: string = '';
  showPassword = false;

  private API_URL = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private navCtrl: NavController
  ) { }

  goToHome() {
    this.navCtrl.navigateRoot('/home');
  }

  goToCadastroPage() {
    this.navCtrl.navigateRoot('/registro');
  }

  goToTabsPage() {
    this.navCtrl.navigateRoot('/tabs');
  }

  goToRecuperarSenha() {
    this.navCtrl.navigateRoot('/recuperar-senha');
  }

  somenteNumeros(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  maskCPF() {
    this.usuario = this.usuario
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  async login() {
    if (!this.usuario || !this.senha) {
      this.mostrarToast('Preencha todos os campos.');
      return;
    }

    const identificadorLimpo = this.usuario.replace(/\D/g, '');

    this.http.post<any>(`${this.API_URL}/login`, {
      identificador: identificadorLimpo,
      senha: this.senha
    }).subscribe({
      next: async (res) => {
        console.log('Dados recebidos no login:', res);

        localStorage.setItem('token', res.token);
        localStorage.setItem('admin', String(res.admin));
        localStorage.setItem('usuario_email', res.email || '');  // ← salva o email
        localStorage.setItem('usuario_id', String(res.id || '')); // ← salva o id

        await this.mostrarToast('Login realizado com sucesso!');
        this.navCtrl.navigateRoot('/tabs');
      },
      error: async (err) => {
        if (err.status === 401) {
          this.mostrarToast('Credenciais inválidas.');
        } else {
          this.mostrarToast('Erro ao conectar com servidor.');
        }
      }
    });
  }

  async mostrarToast(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      color: 'primary'
    });
    toast.present();
  }
}