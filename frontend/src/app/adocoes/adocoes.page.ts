import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

interface Adocao {
  id?: number;
  titulo: string;
  descricao: string;
  descricaoCompleta?: string;
  idade?: string;
  raca?: string;
  genero?: string;
  foto?: string;
  fotosArray?: string[];
  fixado?: number;
  prioridade?: string;        // 'prioritario' | 'normal'
  prioridade_score?: number;
  animal?: string;
  cidade?: string;
  estado?: string;
  localizacao?: string;
}

@Component({
  selector: 'app-adocoes',
  templateUrl: './adocoes.page.html',
  styleUrls: ['./adocoes.page.scss'],
  standalone: false,
})
export class AdocoesPage implements OnInit {

  showSearch = false;
  showFiltros = false;
  termoBusca = '';

  filtros = {
    prioridade: '',
    animal: '',
    estado: '',
    cidade: '',
    idade: ''
  };

  adocoes: Adocao[] = [];
  adocoesFiltradas: Adocao[] = [];

  get petsFiltrados(): Adocao[] {
    return this.adocoesFiltradas;
  }

  constructor(
    private location: Location,
    private navCtrl: NavController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.carregarAdocoes();
  }

  carregarAdocoes() {
    this.http.get<any[]>('http://localhost:3000/api/postagens/tipo/adocao').subscribe({
      next: (res) => {
        const dadosReais = Array.isArray(res) ? res : [];

        this.adocoes = dadosReais.map((adocao: any) => {
          // Parse fotos
          if (adocao.foto) {
            try { adocao.fotosArray = JSON.parse(adocao.foto); }
            catch { adocao.fotosArray = [adocao.foto]; }
          } else {
            adocao.fotosArray = [];
          }

          if (!adocao.descricaoCompleta) {
            adocao.descricaoCompleta = adocao.descricao || '';
          }

          adocao.fixado = Number(adocao.fixado) || 0;
          adocao.prioridade = adocao.prioridade || 'normal';
          adocao.prioridade_score = Number(adocao.prioridade_score) || 0;

          return adocao;
        });

        // Ordenação: fixados no topo → prioritários → score desc → id desc
        // O backend já retorna ordenado, mas garantimos aqui também
        this.adocoes.sort((a, b) => {
          const aFixado = (a.fixado === 1 || a.fixado === 2) ? 1 : 0;
          const bFixado = (b.fixado === 1 || b.fixado === 2) ? 1 : 0;
          if (aFixado !== bFixado) return bFixado - aFixado;

          const prioridadeOrdem: Record<string, number> = { prioritario: 1, normal: 2 };
          const aPrio = prioridadeOrdem[a.prioridade || 'normal'] || 2;
          const bPrio = prioridadeOrdem[b.prioridade || 'normal'] || 2;
          if (aPrio !== bPrio) return aPrio - bPrio;

          return (b.id || 0) - (a.id || 0);
        });

        this.adocoesFiltradas = [...this.adocoes];
      },
      error: (err) => console.error('Erro ao buscar adoções', err)
    });
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.limparBusca();
  }

  toggleFiltros() {
    this.showFiltros = !this.showFiltros;
  }

  filtrar() {
    let resultado = [...this.adocoes];

    const termo = this.termoBusca.toLowerCase().trim();
    if (termo) {
      resultado = resultado.filter(a =>
        (a.titulo && a.titulo.toLowerCase().includes(termo)) ||
        (a.descricaoCompleta && a.descricaoCompleta.toLowerCase().includes(termo)) ||
        (a.raca && a.raca.toLowerCase().includes(termo))
      );
    }

    if (this.filtros.prioridade) {
      resultado = resultado.filter(a => a.prioridade === this.filtros.prioridade);
    }

    if (this.filtros.animal) {
      const animalAlvo = this.filtros.animal.toLowerCase();
      resultado = resultado.filter(a =>
        (a.animal && a.animal.toLowerCase() === animalAlvo) ||
        (a.raca && a.raca.toLowerCase().includes(animalAlvo)) ||
        (a.titulo && a.titulo.toLowerCase().includes(animalAlvo))
      );
    }

    if (this.filtros.estado) {
      const estadoAlvo = this.filtros.estado.toLowerCase();
      resultado = resultado.filter(a =>
        (a.estado && a.estado.toLowerCase() === estadoAlvo) ||
        (a.localizacao && a.localizacao.toLowerCase().includes(estadoAlvo))
      );
    }

    if (this.filtros.cidade) {
      const cidadeAlvo = this.filtros.cidade.toLowerCase();
      resultado = resultado.filter(a =>
        (a.cidade && a.cidade.toLowerCase() === cidadeAlvo) ||
        (a.localizacao && a.localizacao.toLowerCase().includes(cidadeAlvo))
      );
    }

    if (this.filtros.idade) {
      resultado = resultado.filter(a => {
        if (!a.idade) return false;
        const idadeStr = a.idade.toLowerCase();
        if (this.filtros.idade === 'menos1') {
          return idadeStr.includes('meses') || idadeStr.includes('0 ano');
        }
        const numeroBuscado = this.filtros.idade;
        return idadeStr.startsWith(numeroBuscado + ' ') || idadeStr.includes(' ' + numeroBuscado + ' ');
      });
    }

    this.adocoesFiltradas = resultado;
  }

  temFiltroAtivo(): boolean {
    return Object.values(this.filtros).some(v => v !== '');
  }

  limparCampo(campo: keyof typeof this.filtros) {
    this.filtros[campo] = '';
    this.filtrar();
  }

  limparTodosFiltros() {
    this.filtros = { prioridade: '', animal: '', estado: '', cidade: '', idade: '' };
    this.filtrar();
  }

  limparBusca() {
    this.termoBusca = '';
    this.filtrar();
  }

  abrirDetalhe(adocao: Adocao) {
    this.navCtrl.navigateForward('/adocoes-detalhes', { state: { pet: adocao } });
  }

  goBack() {
    this.location.back();
  }
}