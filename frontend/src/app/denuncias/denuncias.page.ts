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
  fixado?: number;
  prioridade?: string;        // 'urgente' | 'alta' | 'normal'
  prioridade_score?: number;
}

@Component({
  selector: 'app-denuncias',
  templateUrl: './denuncias.page.html',
  styleUrls: ['./denuncias.page.scss'],
  standalone: false,
})
export class DenunciasPage implements OnInit {

  showSearch = false;
  showFiltros = false;
  termoBusca = '';

  filtros = {
    prioridade: '',
    data: '',
    tipoAnimal: '',
    cidade: '',
    estado: ''
  };

  denuncias: Denuncia[] = [];
  denunciasFiltradas: Denuncia[] = [];

  cidadesDisponiveis: string[] = [];
  estadosDisponiveis: string[] = [];

  constructor(
    private location: Location,
    private navCtrl: NavController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.carregarDenuncias();
  }

  carregarDenuncias() {
    this.http.get<any[]>('http://localhost:3000/api/postagens/tipo/denuncia').subscribe({
      next: (res) => {
        const dadosReais = Array.isArray(res) ? res : [];

        const cidadesSet = new Set<string>();
        const estadosSet = new Set<string>();

        this.denuncias = dadosReais.map((denuncia: any) => {
          if (denuncia.foto) {
            try { denuncia.fotosArray = JSON.parse(denuncia.foto); }
            catch { denuncia.fotosArray = [denuncia.foto]; }
          } else {
            denuncia.fotosArray = [];
          }

          if (!denuncia.descricaoCompleta) {
            denuncia.descricaoCompleta = denuncia.descricao || '';
          }

          if (!denuncia.localizacao) {
            denuncia.localizacao = denuncia.cidade || denuncia.local || '';
          }

          if (denuncia.cidade) cidadesSet.add(denuncia.cidade);
          if (denuncia.estado) estadosSet.add(denuncia.estado);

          denuncia.fixado = Number(denuncia.fixado) || 0;
          denuncia.prioridade = denuncia.prioridade || 'normal';
          denuncia.prioridade_score = Number(denuncia.prioridade_score) || 0;

          return denuncia;
        });

        this.cidadesDisponiveis = Array.from(cidadesSet).sort();
        this.estadosDisponiveis = Array.from(estadosSet).sort();

        // Ordenação: fixados → urgente → alta → normal → score desc → id desc
        // O backend já retorna ordenado mas garantimos aqui
        const prioridadeOrdem: Record<string, number> = { urgente: 1, alta: 2, normal: 3 };
        this.denuncias.sort((a, b) => {
          const aFixado = (a.fixado === 1 || a.fixado === 2) ? 1 : 0;
          const bFixado = (b.fixado === 1 || b.fixado === 2) ? 1 : 0;
          if (aFixado !== bFixado) return bFixado - aFixado;

          const aPrio = prioridadeOrdem[a.prioridade || 'normal'] || 3;
          const bPrio = prioridadeOrdem[b.prioridade || 'normal'] || 3;
          if (aPrio !== bPrio) return aPrio - bPrio;

          const aScore = a.prioridade_score || 0;
          const bScore = b.prioridade_score || 0;
          if (aScore !== bScore) return bScore - aScore;

          return (b.id || 0) - (a.id || 0);
        });

        this.denunciasFiltradas = [...this.denuncias];
      },
      error: (err) => console.error('Erro ao buscar denúncias', err)
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
    let resultado = [...this.denuncias];

    const termo = this.termoBusca.toLowerCase().trim();
    if (termo) {
      resultado = resultado.filter(d =>
        (d.titulo && d.titulo.toLowerCase().includes(termo)) ||
        (d.descricaoCompleta && d.descricaoCompleta.toLowerCase().includes(termo)) ||
        (d.localizacao && d.localizacao.toLowerCase().includes(termo)) ||
        (d.cidade && d.cidade.toLowerCase().includes(termo))
      );
    }

    if (this.filtros.prioridade) {
      resultado = resultado.filter(d => d.prioridade === this.filtros.prioridade);
    }

    if (this.filtros.data) {
      resultado = resultado.filter(d => {
        const dataCriacao = (d as any).data_criacao || (d as any).created_at || '';
        return dataCriacao.startsWith(this.filtros.data);
      });
    }

    if (this.filtros.tipoAnimal) {
      const animalAlvo = this.filtros.tipoAnimal.toLowerCase();
      resultado = resultado.filter(d =>
        ((d as any).animal && (d as any).animal.toLowerCase() === animalAlvo) ||
        (d.titulo && d.titulo.toLowerCase().includes(animalAlvo)) ||
        (d.descricao && d.descricao.toLowerCase().includes(animalAlvo))
      );
    }

    if (this.filtros.cidade) {
      const cidadeAlvo = this.filtros.cidade.toLowerCase();
      resultado = resultado.filter(d => d.cidade && d.cidade.toLowerCase() === cidadeAlvo);
    }

    if (this.filtros.estado) {
      const estadoAlvo = this.filtros.estado.toLowerCase();
      resultado = resultado.filter(d => (d as any).estado && (d as any).estado.toLowerCase() === estadoAlvo);
    }

    this.denunciasFiltradas = resultado;
  }

  temFiltroAtivo(): boolean {
    return Object.values(this.filtros).some(v => v !== '');
  }

  limparCampo(campo: keyof typeof this.filtros) {
    this.filtros[campo] = '';
    this.filtrar();
  }

  limparTodosFiltros() {
    this.filtros = { prioridade: '', data: '', tipoAnimal: '', cidade: '', estado: '' };
    this.filtrar();
  }

  limparBusca() {
    this.termoBusca = '';
    this.filtrar();
  }

  irParaDetalhes(item: any) {
    this.navCtrl.navigateForward('/denuncias-detalhes', { state: { denuncia: item } });
  }

  goBack() {
    this.location.back();
  }
}