import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-doacoes',
  templateUrl: './doacoes.page.html',
  styleUrls: ['./doacoes.page.scss'],
  standalone: false
})
export class DoacoesPage implements OnInit {

  ong: any = null;
  valoresRapidos: number[] = [10, 20, 50, 100, 200, 500];
  valorSelecionado: number | null = null;
  valorDoacao: number | null = null;
  processando: boolean = false;
  doacaoRegistrada: boolean = false;

  cardsFiltrados = [
    { titulo: 'Ração e Suplementos', descricao: 'Alimentação de qualidade para a recuperação.', imagem: 'assets/racao.jpg' },
    { titulo: 'Medicamentos', descricao: 'Vacinas, vermífugos e tratamentos.', imagem: 'assets/vacina.jpg' }
  ];

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private location: Location,
    private http: HttpClient
  ) {
    // Tenta pegar a ONG pela navegação normal (navigateForward com state)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.ong = navigation.extras.state['ongSelecionada'];
    }
  }

  ngOnInit() {
    // Fallback: tenta recuperar do history.state (recarregamento de página)
    if (!this.ong) {
      const state = history.state;
      this.ong = state?.['ongSelecionada'] || state?.['ong'] || null;
    }

    if (!this.ong) {
      this.router.navigate(['/tabs/inicio']);
    }
  }

  setValor(v: number) {
    this.valorSelecionado = v;
    this.valorDoacao = v;
  }

  // ─────────────────────────────────────────────────────────
  // Copia a chave PIX da ONG para a área de transferência
  // ─────────────────────────────────────────────────────────
  async copiarPix() {
    if (!this.ong?.chave_pix) {
      await this.mostrarToast('Esta ONG não cadastrou uma chave PIX.', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.ong.chave_pix);
      await this.mostrarToast('✅ Chave PIX copiada! Abra o app do seu banco e cole.', 'success');
    } catch (err) {
      // Fallback para browsers que bloqueiam clipboard sem interação direta
      this.copiarPixFallback(this.ong.chave_pix);
    }
  }

  private copiarPixFallback(texto: string) {
    const el = document.createElement('textarea');
    el.value = texto;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.mostrarToast('✅ Chave PIX copiada! Abra o app do seu banco e cole.', 'success');
  }

  // ─────────────────────────────────────────────────────────
  // Registra a doação no banco.
  // Se valor >= R$500, o backend notifica a ONG automaticamente.
  // NÃO processa pagamento — o usuário paga via PIX no próprio banco.
  // ─────────────────────────────────────────────────────────
  async registrarDoacao() {
    if (!this.valorDoacao || this.valorDoacao <= 0) {
      await this.mostrarToast('Por favor, informe um valor.', 'warning');
      return;
    }

    if (!this.ong?.id) {
      await this.mostrarToast('ONG não identificada.', 'danger');
      return;
    }

    this.processando = true;

    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    const payload = {
      tipo_postagem: 'doacao',
      titulo: `Doação para ${this.ong.nome}`,
      descricao: `Doação de R$ ${this.valorDoacao.toFixed(2)} via PIX para ${this.ong.nome}.`,
      ong_id: this.ong.id,        // necessário para a notificação de doação relevante
      valor_doacao: this.valorDoacao,
    };

    this.http.post('http://localhost:3000/api/postagens', payload, { headers }).subscribe({
      next: async () => {
        this.processando = false;
        this.doacaoRegistrada = true;

        const isRelevante = this.valorDoacao! >= 500;
        const msg = isRelevante
          ? `🎉 Doação de R$ ${this.valorDoacao} registrada! A ONG foi notificada. Copie a chave PIX e transfira.`
          : `✅ Doação registrada! Copie a chave PIX acima e pague no seu banco.`;

        await this.mostrarToast(msg, 'success');

        // Copia o PIX automaticamente após registrar para facilitar o fluxo
        await this.copiarPix();
      },
      error: async (err) => {
        this.processando = false;
        console.error('Erro ao registrar doação:', err);
        await this.mostrarToast('Erro ao registrar doação. Tente novamente.', 'danger');
      }
    });
  }

  goBack() {
    this.location.back();
  }

  async mostrarToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'top'
    });
    await toast.present();
  }
}