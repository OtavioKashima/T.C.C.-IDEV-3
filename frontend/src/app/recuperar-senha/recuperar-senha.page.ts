import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.page.html',
  styleUrls: ['./recuperar-senha.page.scss'],
  standalone: false
})
export class RecuperarSenhaPage {

  email: string = '';
  emailInvalido: boolean = false;

  mensagemErro: string = '';
  mensagemSucesso: string = '';

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  validarEmail() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailInvalido = !regex.test(this.email);
  }

  recuperarSenha() {

    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.email) {

      this.mensagemErro = 'Digite seu email!';

      setTimeout(() => {
        this.mensagemErro = '';
      }, 3000);

      return;
    }

    if (this.emailInvalido) {

      this.mensagemErro = 'Informe um email válido!';

      setTimeout(() => {
        this.mensagemErro = '';
      }, 3000);

      return;
    }

    this.mensagemSucesso = 'Código enviado para seu email!';

    setTimeout(() => {
      this.mensagemSucesso = '';
      this.router.navigate(['/codigo-verificacao']);
    }, 2000);

  }

}