import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {
  termoBuscaOng: string = '';
  ongsFiltradas: any[] = [];
  ongs: any[] = [];
  comunicados: any[] = [];

  showSearch = false;
  showFiltros = false;

  filtros = {
    estado: '',
    cidade: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.carregarComunicados();
    this.carregarOngs();
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.limparBusca();
    }
  }

  toggleFiltros() {
    this.showFiltros = !this.showFiltros;
  }

  limparBusca() {
    this.termoBuscaOng = '';
    this.filtrarOngs();
  }

  temFiltroAtivo(): boolean {
    return !!(this.filtros.estado || this.filtros.cidade);
  }

  limparTodosFiltros() {
    this.filtros = { estado: '', cidade: '' };
    this.filtrarOngs();
  }

  limparCampo(campo: 'estado' | 'cidade') {
    this.filtros[campo] = '';
    this.filtrarOngs();
  }

  carregarComunicados() {
    this.http.get('http://localhost:3000/api/postagens/tipo/comunicado').subscribe({
      next: (res: any) => { this.comunicados = res; },
      error: (err) => console.error('Erro ao buscar Comunicados', err)
    });
  }

  carregarOngs() {
    this.http.get('http://localhost:3000/api/ongs').subscribe({
      next: (res: any) => {
        console.log('ONGs recebidas:', res.map((o: any) => ({ nome: o.nome, estado: o.estado, cidade: o.cidade })));
        const ongsUnicas = res.filter((ong: any, index: number, self: any[]) =>
          index === self.findIndex((o) => o.id === ong.id)
        );
        this.ongs = ongsUnicas;
        this.ongsFiltradas = [...this.ongs];
      },
      error: (err) => console.error('Erro ao buscar ONGs', err)
    });
  }

  filtrarOngs() {
    let resultado = [...this.ongs];

    const termo = this.termoBuscaOng.toLowerCase().trim();
    if (termo) {
      resultado = resultado.filter(ong =>
        (ong.nome && ong.nome.toLowerCase().includes(termo)) ||
        (ong.cidade && ong.cidade.toLowerCase().includes(termo)) ||
        (ong.estado && ong.estado.toLowerCase().includes(termo))
      );
    }

    if (this.filtros.estado) {
      resultado = resultado.filter(ong =>
        ong.estado && ong.estado.toUpperCase().trim() === this.filtros.estado.toUpperCase().trim()
      );
    }

    if (this.filtros.cidade) {
      resultado = resultado.filter(ong =>
        ong.cidade && ong.cidade.trim().toLowerCase() === this.filtros.cidade.trim().toLowerCase()
      );
    }

    this.ongsFiltradas = resultado;
  }

  getFotoUrl(foto_perfil: string) {
    if (!foto_perfil) return 'https://ionicframework.com/docs/img/demos/avatar.svg';
    return `http://localhost:3000/uploads/${foto_perfil}`;
  }

  abrirPerfilOng(ong: any) {
    this.navCtrl.navigateForward('/perfil-publico', {
      state: { usuario_id: ong.id }
    });
  }

  abrirComunicado(aviso: any) {
    this.router.navigate(['/comunicado'], {
      state: { postagemSelecionada: aviso }
    });
  }
}