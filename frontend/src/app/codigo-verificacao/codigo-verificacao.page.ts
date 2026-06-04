import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
selector: 'app-codigo-verificacao',
templateUrl: './codigo-verificacao.page.html',
styleUrls: ['./codigo-verificacao.page.scss'],
standalone: false
})
export class CodigoVerificacaoPage {

codigo: string = '';

mensagemErro: string = '';
mensagemSucesso: string = '';

constructor(private router: Router) {}

goToRecuperar(){
this.router.navigate(['/recuperar-senha']);
}

verificarCodigo(){

this.mensagemErro = '';
this.mensagemSucesso = '';

if(!this.codigo){

this.mensagemErro = 'Digite o código!';

setTimeout(()=>{
this.mensagemErro = '';
},3000);

return;
}

this.mensagemSucesso = 'Código confirmado!';

setTimeout(()=>{
this.mensagemSucesso = '';
this.router.navigate(['/nova-senha']);
},2000);

}

reenviarCodigo(){

this.mensagemErro = '';
this.mensagemSucesso = 'Código reenviado para seu email!';

setTimeout(()=>{
this.mensagemSucesso = '';
},3000);

}

}