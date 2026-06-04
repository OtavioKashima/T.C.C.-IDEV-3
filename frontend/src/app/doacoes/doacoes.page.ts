import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-doacoes',
  templateUrl: './doacoes.page.html',
  styleUrls: ['./doacoes.page.scss'],
  standalone: false
})
export class DoacoesPage implements OnInit {
  ong: any = null;
  valoresRapidos: number[] = [10, 20, 50, 100];
  valorSelecionado: number | null = null;
  valorDoacao: number | null = null;
  processando: boolean = false;

  // Exemplos simulados para preencher a sua lista de cardsFiltrados no final da tela
  cardsFiltrados = [
    { titulo: 'Ração e Suplementos', descricao: 'Alimentação de qualidade para a recuperação.', imagem: 'assets/racao.jpg' },
    { titulo: 'Medicamentos', descricao: 'Vacinas, vermífugos e tratamentos.', imagem: 'assets/vacina.jpg' }
  ];

  constructor(private router: Router, private toastCtrl: ToastController, private location: Location) {
    // 🟢 Recupera os dados da ONG passados pela tela Início
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.ong = navigation.extras.state['ongSelecionada'];
    }
  }

  ngOnInit() {
    if (!this.ong) {
      // Se acessar direto sem clicar na ONG, volta pro inicio
      this.router.navigate(['/tabs/inicio']);
    }
  }

  setValor(v: number) {
    this.valorSelecionado = v;
    this.valorDoacao = v;
  }

  async copiarPix() {
    if (!this.ong?.chave_pix) {
      this.mostrarToast('Esta ONG não cadastrou uma chave PIX.', 'warning');
      return;
    }

    navigator.clipboard.writeText(this.ong.chave_pix).then(() => {
      this.mostrarToast('Chave PIX copiada! Abra o app do seu banco.', 'success');
    }).catch(err => console.error('Erro', err));
  }

  processarDoacao() {
    if (!this.valorDoacao) {
      this.mostrarToast('Por favor, informe um valor.', 'warning');
      return;
    }

    this.processando = true;

    // Simula um processamento (aqui você poderia registrar no banco de dados)
    setTimeout(() => {
      this.processando = false;
      this.mostrarToast('Tudo pronto! Copie a chave e faça a transferência.', 'success');
      this.copiarPix();
    }, 1000);
  }

  goBack() {
    this.location.back();
  }

  async mostrarToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem, duration: 2500, color: cor, position: 'top'
    });
    toast.present();
  }
}