import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

// Interface atualizada com suporte aos novos campos de localização/espécie
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
  animal?: string;      // 🟢 Opcional: Tipo do animal vindo do banco (Cachorro, Gato...)
  cidade?: string;      // 🟢 Opcional: Cidade cadastrada
  estado?: string;      // 🟢 Opcional: Estado cadastrado
  localizacao?: string; // 🟢 Opcional: String genérica de endereço
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

  // 🟢 Objeto que armazena os estados dos selects do HTML
  filtros = {
    animal: '',
    estado: '',
    cidade: '',
    idade: ''
  };

  adocoes: Adocao[] = [];
  adocoesFiltradas: Adocao[] = [];

  // 🟢 GETTER: Resolve o uso de "petsFiltrados.length" presente no seu HTML
  get petsFiltrados(): Adocao[] {
    return this.adocoesFiltradas;
  }

  constructor(
    private location: Location,
    private navCtrl: NavController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.carregarAdocoes();
  }

  carregarAdocoes() {
    this.http.get('http://localhost:3000/api/postagens/tipo/adocao').subscribe({
      next: (res: any) => {
        const dadosReais = Array.isArray(res) ? res : (res.data || res.postagens || []);

        this.adocoes = dadosReais.map((adocao: any) => {
          if (adocao.foto) {
            try { adocao.fotosArray = JSON.parse(adocao.foto); }
            catch (e) { adocao.fotosArray = [adocao.foto]; }
          } else { adocao.fotosArray = []; }

          if (!adocao.descricaoCompleta) { adocao.descricaoCompleta = adocao.descricao || ''; }

          // Garante que o fixado seja tratado como número
          adocao.fixado = Number(adocao.fixado) || 0;

          return adocao;
        });

        // Ordenação: Fixados (Admin=1 / ONG=2) no topo, depois ID decrescente
        this.adocoes.sort((a, b) => {
          const aFixado = (a.fixado === 1 || a.fixado === 2) ? 1 : 0;
          const bFixado = (b.fixado === 1 || b.fixado === 2) ? 1 : 0;

          if (aFixado !== bFixado) {
            return bFixado - aFixado;
          }
          return (b.id || 0) - (a.id || 0);
        });

        this.adocoesFiltradas = [...this.adocoes];
      },
      error: (err) => console.error('Erro ao buscar adoções', err)
    });
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

  // 🟢 LÓGICA DE FILTRAGEM MULTI-CRITÉRIO UNIFICADA
  filtrar() {
    let resultado = [...this.adocoes];

    // 1. Filtro por Texto (Barra de Pesquisa)
    const termo = this.termoBusca.toLowerCase().trim();
    if (termo) {
      resultado = resultado.filter(a =>
        (a.titulo && a.titulo.toLowerCase().includes(termo)) ||
        (a.descricaoCompleta && a.descricaoCompleta.toLowerCase().includes(termo)) ||
        (a.raca && a.raca.toLowerCase().includes(termo))
      );
    }

    // 2. Filtro por Tipo de Animal
    if (this.filtros.animal) {
      const animalAlvo = this.filtros.animal.toLowerCase();
      resultado = resultado.filter(a =>
        (a.animal && a.animal.toLowerCase() === animalAlvo) ||
        (a.raca && a.raca.toLowerCase().includes(animalAlvo)) ||
        (a.titulo && a.titulo.toLowerCase().includes(animalAlvo))
      );
    }

    // 3. Filtro por Estado
    if (this.filtros.estado) {
      const estadoAlvo = this.filtros.estado.toLowerCase();
      resultado = resultado.filter(a =>
        (a.estado && a.estado.toLowerCase() === estadoAlvo) ||
        (a.localizacao && a.localizacao.toLowerCase().includes(estadoAlvo))
      );
    }

    // 4. Filtro por Cidade
    if (this.filtros.cidade) {
      const cidadeAlvo = this.filtros.cidade.toLowerCase();
      resultado = resultado.filter(a =>
        (a.cidade && a.cidade.toLowerCase() === cidadeAlvo) ||
        (a.localizacao && a.localizacao.toLowerCase().includes(cidadeAlvo))
      );
    }

    // 5. Filtro Inteligente por Idade (Casando strings do tipo "3 meses" ou "2 anos")
    if (this.filtros.idade) {
      resultado = resultado.filter(a => {
        if (!a.idade) return false;
        const idadeStr = a.idade.toLowerCase();

        if (this.filtros.idade === 'menos1') {
          return idadeStr.includes('meses') || idadeStr.includes('0 ano');
        } else {
          // Busca o número exato correspondente isolado na frase (ex: "1 ano" ou "1 anos")
          const numeroBuscado = this.filtros.idade;
          return idadeStr.startsWith(numeroBuscado + ' ') || idadeStr.includes(' ' + numeroBuscado + ' ');
        }
      });
    }

    this.adocoesFiltradas = resultado;
  }

  // 🟢 Verifica se o usuário selecionou qualquer critério nos selects
  temFiltroAtivo(): boolean {
    return Object.values(this.filtros).some(valor => valor !== '');
  }

  // 🟢 Remove a seleção de um select específico ao clicar no "X" do chip/badge
  limparCampo(campo: 'animal' | 'estado' | 'cidade' | 'idade') {
    this.filtros[campo] = '';
    this.filtrar(); // Re-calcula a lista
  }

  // 🟢 Reseta completamente todos os selects de uma vez
  limparTodosFiltros() {
    this.filtros = {
      animal: '',
      estado: '',
      cidade: '',
      idade: ''
    };
    this.filtrar();
  }

  limparBusca() {
    this.termoBusca = '';
    this.filtrar();
  }

  abrirDetalhe(adocao: Adocao) {
    this.navCtrl.navigateForward('/adocoes-detalhes', {
      state: { pet: adocao }
    });
  }

  goBack() {
    this.location.back();
  }
}