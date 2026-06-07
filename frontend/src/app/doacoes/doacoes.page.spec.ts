import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-doacoes',
  templateUrl: './doacoes.page.html',
  styleUrls: ['./doacoes.page.scss'],
  standalone: false
})
export class DoacoesPage implements OnInit, OnDestroy {

  ong: any = null;

  valoresRapidos: number[] = [10, 20, 50, 100];
  valorSelecionado: number | null = null;
  valorDoacao: number | null = null;

  processando = false;
  pixGerado = false;
  pagamentoConfirmado = false;
  doacaoRelevante = false;

  // Dados retornados pelo backend
  mpPaymentId: string = '';
  qrCode: string = '';           // código copia e cola
  qrCodeBase64: string = '';     // imagem base64 para exibir
  pixExpiracao: string = '';

  // Polling
  pollingAtivo = false;
  private pollingInterval: any = null;
  private readonly POLLING_MS = 5000; // verifica a cada 5 segundos

  readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private location: Location
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.ong = navigation.extras.state['ongSelecionada'];
    }
  }

  ngOnInit() {
    if (!this.ong) {
      this.router.navigate(['/tabs/inicio']);
    }
  }

  ngOnDestroy() {
    this.pararPolling();
  }

  setValor(v: number) {
    this.valorSelecionado = v;
    this.valorDoacao = v;
    this.pixGerado = false;
    this.pagamentoConfirmado = false;
  }

  // ── Gera o PIX real no Mercado Pago ───────────────────────
  async gerarPix() {
    if (!this.valorDoacao || this.valorDoacao <= 0) {
      this.mostrarToast('Informe um valor válido.', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.mostrarToast('Você precisa estar logado para doar.', 'danger');
      return;
    }

    const usuarioEmail = localStorage.getItem('usuario_email') || '';
    if (!usuarioEmail) {
      this.mostrarToast('E-mail do usuário não encontrado. Faça login novamente.', 'danger');
      return;
    }

    this.processando = true;
    this.pixGerado = false;
    this.pagamentoConfirmado = false;
    this.doacaoRelevante = false;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const body = {
      ong_id: this.ong.id,
      valor: this.valorDoacao,
      descricao: `Doação para ${this.ong.nome}`,
      usuario_email: usuarioEmail
    };

    this.http.post<any>(`${this.apiUrl}/doacoes/criar-pix`, body, { headers }).subscribe({
      next: (res) => {
        this.processando = false;
        this.pixGerado = true;
        this.mpPaymentId = res.mp_payment_id;
        this.qrCode = res.qr_code;
        this.qrCodeBase64 = res.qr_code_base64 || '';
        this.pixExpiracao = res.expiracao || '';

        // Verifica se a doação é relevante (>= R$500) para mostrar badge
        this.doacaoRelevante = (this.valorDoacao || 0) >= 500;

        // Inicia polling para detectar pagamento confirmado
        this.iniciarPolling();
      },
      error: (err) => {
        this.processando = false;
        console.error('Erro ao gerar PIX:', err);
        this.mostrarToast('Erro ao gerar PIX. Tente novamente.', 'danger');
      }
    });
  }

  // ── Polling: consulta status a cada 5s ────────────────────
  iniciarPolling() {
    this.pollingAtivo = true;
    this.pollingInterval = setInterval(() => {
      this.verificarStatusPagamento();
    }, this.POLLING_MS);
  }

  pararPolling() {
    this.pollingAtivo = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  verificarStatusPagamento() {
    if (!this.mpPaymentId) return;

    this.http.get<any>(`${this.apiUrl}/doacoes/status/${this.mpPaymentId}`).subscribe({
      next: (res) => {
        if (res.status === 'aprovado') {
          this.pararPolling();
          this.pagamentoConfirmado = true;
          this.mostrarToast('✅ Pagamento confirmado! Obrigado pela doação!', 'success');
        }
      },
      error: (err) => console.error('Erro ao verificar status PIX:', err)
    });
  }

  // ── Copia o código PIX para o clipboard ──────────────────
  async copiarCodigoPix() {
    if (!this.qrCode) {
      this.mostrarToast('Código PIX não disponível.', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(this.qrCode);
      this.mostrarToast('Código PIX copiado! Cole no app do seu banco.', 'success');
    } catch {
      this.mostrarToast('Erro ao copiar. Copie o código manualmente.', 'danger');
    }
  }

  // ── Reset para gerar novo QR Code ─────────────────────────
  resetarPix() {
    this.pararPolling();
    this.pixGerado = false;
    this.pagamentoConfirmado = false;
    this.doacaoRelevante = false;
    this.qrCode = '';
    this.qrCodeBase64 = '';
    this.mpPaymentId = '';
    this.pixExpiracao = '';
  }

  goBack() {
    this.pararPolling();
    this.location.back();
  }

  async mostrarToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'top'
    });
    toast.present();
  }
}