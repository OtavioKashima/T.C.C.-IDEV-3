import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-nova-senha',
  templateUrl: './nova-senha.page.html',
  styleUrls: ['./nova-senha.page.scss'],
  standalone: false
})
export class NovaSenhaPage {

  novaSenha: string = '';
  confirmarSenha: string = '';

  mensagemErro: string = '';
  mensagemSucesso: string = '';

  showNovaSenha: boolean = false;
  showConfirmarSenha: boolean = false;

  constructor(private navCtrl: NavController) {}

  goToCodigo() {
    this.navCtrl.back();
  }

  redefinirSenha() {

    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.novaSenha || !this.confirmarSenha) {

      this.mensagemErro = 'Preencha todos os campos.';

      setTimeout(()=>{
        this.mensagemErro = '';
      },3000);

      return;
    }

    if (this.novaSenha.length < 8) {

      this.mensagemErro = 'A senha deve ter no mínimo 8 caracteres.';

      setTimeout(()=>{
        this.mensagemErro = '';
      },3000);

      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {

      this.mensagemErro = 'As senhas não coincidem.';

      setTimeout(()=>{
        this.mensagemErro = '';
      },3000);

      return;
    }

    this.mensagemSucesso = 'Senha redefinida com sucesso!';

    setTimeout(()=>{
      this.mensagemSucesso = '';
      this.navCtrl.navigateRoot('/login');
    },2000);

  }

}