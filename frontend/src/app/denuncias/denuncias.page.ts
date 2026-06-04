import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

interface Denuncia {
  id?: number;
  titulo: string;
  descricao: string;
  descricaoCompleta?: string;
  foto?: string;
  fotosArray?: string[];
  localizacao?: string;
  local?: string;
  cidade?: string;
  estado?: string;
  fixado?: number; // 🟢 Controla o destaque no topo
}

@Component({
  selector: 'app-denuncias',
  templateUrl: './denuncias.page.html',
  styleUrls: ['./denuncias.page.scss'],
  standalone: false,
})
export class DenunciasPage implements OnInit {

  showSearch = false;
  showFiltros = false; // 🟢 Ativa/Desativa o painel
  termoBusca = '';

  // 🟢 Objeto unificado de filtros idêntico ao de adoção
  filtros = {
    data: '',
    tipoAnimal: '',
    cidade: '',
    estado: ''
  };

  denuncias: Denuncia[] = [];
  denunciasFiltradas: Denuncia[] = [];

  // 🟢 Listas alimentadas dinamicamente pelo Banco de Dados
  cidadesDisponiveis: string[] = [];
  estadosDisponiveis: string[] = [];

  constructor(
    private location: Location,
    private navCtrl: NavController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.carregarDenuncias();
  }

  carregarDenuncias() {
    this.http.get('http://localhost:3000/api/postagens/tipo/denuncia').subscribe({
      next: (res: any) => {
        const dadosReais = Array.isArray(res) ? res : (res.data || res.postagens || []);

        const cidadesSet = new Set<string>();
        const estadosSet = new Set<string>();

        this.denuncias = dadosReais.map((denuncia: any) => {
          if (denuncia.foto) {
            try {
              denuncia.fotosArray = JSON.parse(denuncia.foto);
            } catch (e) {
              denuncia.fotosArray = [denuncia.foto];
            }
          } else {
            denuncia.fotosArray = [];
          }

          if (!denuncia.descricaoCompleta) {
            denuncia.descricaoCompleta = denuncia.descricao || '';
          }

          if (!denuncia.localizacao) {
            denuncia.localizacao = denuncia.cidade || denuncia.local || '';
          }

          // Mapeia cidades e estados existentes para os filtros não virem em branco
          if (denuncia.cidade) cidadesSet.add(denuncia.cidade);
          if (denuncia.estado) estadosSet.add(denuncia.estado);

          denuncia.fixado = Number(denuncia.fixado) || 0;

          return denuncia;
        });

        this.cidadesDisponiveis = Array.from(cidadesSet).sort();
        this.estadosDisponiveis = Array.from(estadosSet).sort();

        // 🟢 ORDENAÇÃO INTELIGENTE: Fixados (Admin/ONG) no topo, depois ID mais recente
        this.denuncias.sort((a, b) => {
          const aFixado = (a.fixado === 1 || a.fixado === 2) ? 1 : 0;
          const bFixado = (b.fixado === 1 || b.fixado === 2) ? 1 : 0;

          if (aFixado !== bFixado) {
            return bFixado - aFixado;
          }
          return (b.id || 0) - (a.id || 0);
        });

        this.denunciasFiltradas = [...this.denuncias];
      },
      error: (err) => console.error('Erro ao buscar denúncias', err)
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
    let resultado = [...this.denuncias];

    // 1. Filtro por Texto (Barra de Pesquisa)
    const termo = this.termoBusca.toLowerCase().trim();
    if (termo) {
      resultado = resultado.filter(d =>
        (d.titulo && d.titulo.toLowerCase().includes(termo)) ||
        (d.descricaoCompleta && d.descricaoCompleta.toLowerCase().includes(termo)) ||
        (d.localizacao && d.localizacao.toLowerCase().includes(termo)) ||
        (d.cidade && d.cidade.toLowerCase().includes(termo))
      );
    }

    // 2. Filtro por Data
    if (this.filtros.data) {
      resultado = resultado.filter(d => {
        const dataCriacao = (d as any).data || (d as any).created_at || '';
        return dataCriacao.startsWith(this.filtros.data);
      });
    }

    // 3. Filtro por Tipo de Animal
    if (this.filtros.tipoAnimal) {
      const animalAlvo = this.filtros.tipoAnimal.toLowerCase();
      resultado = resultado.filter(d =>
        ((d as any).animal && (d as any).animal.toLowerCase() === animalAlvo) ||
        (d.titulo && d.titulo.toLowerCase().includes(animalAlvo)) ||
        (d.descricao && d.descricao.toLowerCase().includes(animalAlvo))
      );
    }

    // 4. Filtro por Cidade
    if (this.filtros.cidade) {
      const cidadeAlvo = this.filtros.cidade.toLowerCase();
      resultado = resultado.filter(d => d.cidade && d.cidade.toLowerCase() === cidadeAlvo);
    }

    // 5. Filtro por Estado
    if (this.filtros.estado) {
      const estadoAlvo = this.filtros.estado.toLowerCase();
      resultado = resultado.filter(d => (d as any).estado && (d as any).estado.toLowerCase() === estadoAlvo);
    }

    this.denunciasFiltradas = resultado;
  }

  temFiltroAtivo(): boolean {
    return Object.values(this.filtros).some(valor => valor !== '');
  }

  limparCampo(campo: 'data' | 'tipoAnimal' | 'cidade' | 'estado') {
    this.filtros[campo] = '';
    this.filtrar();
  }

  limparTodosFiltros() {
    this.filtros = {
      data: '',
      tipoAnimal: '',
      cidade: '',
      estado: ''
    };
    this.filtrar();
  }

  limparBusca() {
    this.termoBusca = '';
    this.filtrar();
  }

  irParaDetalhes(item: any) {
    this.navCtrl.navigateForward('/denuncias-detalhes', {
      state: { denuncia: item }
    });
  }

  goBack() {
    this.location.back();
  }
}