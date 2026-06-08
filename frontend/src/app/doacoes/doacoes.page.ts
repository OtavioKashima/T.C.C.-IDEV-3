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
  valoresRapidos: number[] = [10, 25, 50, 100];
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
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.ong = navigation.extras.state['ongSelecionada'];
    }
  }

  ngOnInit() {
    if (!this.ong) {
      const state = history.state;
      this.ong = state?.['ongSelecionada'] || state?.['ong'] || null;
    }

    if (!this.ong) {
      this.router.navigate(['/tabs/inicio']);
      return;
    }

    // ✅ Sempre busca os dados atualizados da ONG (incluindo chave_pix)
    // usando o mesmo endpoint que já existe e retorna todos os campos
    if (this.ong.id) {
      this.buscarDadosOng();
    }
  }

  // ✅ Busca pelo endpoint /api/usuarios/:id que já retorna chave_pix
  buscarDadosOng() {
    this.http.get<any>(`http://localhost:3000/api/usuarios/${this.ong.id}`).subscribe({
      next: (res) => {
        // Atualiza a chave PIX (e outros campos) sem perder os dados que já tínhamos
        this.ong = {
          ...this.ong,
          chave_pix: res.chave_pix || '',
          nome: res.nome || this.ong.nome,
          descricao: res.bio || this.ong.descricao,
        };
      },
      error: (err) => console.error('Erro ao buscar dados da ONG:', err)
    });
  }

  setValor(v: number) {
    this.valorSelecionado = v;
    this.valorDoacao = v;
  }

  async copiarPix() {
    if (!this.ong?.chave_pix) {
      await this.mostrarToast('Esta ONG não cadastrou uma chave PIX.', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.ong.chave_pix);
      await this.mostrarToast('✅ Chave PIX copiada! Abra o app do seu banco e cole.', 'success');
    } catch (err) {
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
      ong_id: this.ong.id,
      valor: this.valorDoacao,
    };

    this.http.post<any>('http://localhost:3000/api/doacoes/registrar', payload, { headers }).subscribe({
      next: async (res) => {
        this.processando = false;
        this.doacaoRegistrada = true;

        // Se o backend devolver chave_pix no response, atualiza também
        if (res.chave_pix) {
          this.ong = { ...this.ong, chave_pix: res.chave_pix };
        }

        await this.mostrarToast(res.mensagem || '✅ Doação registrada!', 'success');
        await this.copiarPix();

        setTimeout(() => {
          this.doacaoRegistrada = false;
          this.valorDoacao = null;
          this.valorSelecionado = null;
        }, 3000);
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