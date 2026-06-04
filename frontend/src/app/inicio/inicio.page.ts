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
  // 🟢 Novas variáveis para a busca
  termoBuscaOng: string = '';
  ongsFiltradas: any[] = [];

  ongs: any[] = [];
  comunicados: any[] = [];

  constructor(private http: HttpClient, private router: Router, private navCtrl: NavController) { }

  ngOnInit() {
    this.carregarComunicados();
    this.carregarOngs();
  }

  carregarComunicados() {
    this.http.get('http://localhost:3000/api/postagens/tipo/comunicado').subscribe({
      next: (res: any) => {
        this.comunicados = res;
      },
      error: (err) => console.error('Erro ao buscar Comunicados', err)
    });
  }

  carregarOngs() {
    this.http.get('http://localhost:3000/api/ongs').subscribe({
      next: (res: any) => {
        // 🟢 Filtra o resultado para garantir que não existam ONGs com o mesmo ID
        const ongsUnicas = res.filter((ong: any, index: number, self: any[]) =>
          index === self.findIndex((o) => o.id === ong.id)
        );

        this.ongs = ongsUnicas;
        this.ongsFiltradas = [...this.ongs];
      },
      error: (err) => console.error('Erro ao buscar ONGs', err)
    });
  }

  // 🟢 Nova função de filtro (Busca por Nome, Cidade ou Estado)
  filtrarOngs() {
    const termo = this.termoBuscaOng.toLowerCase().trim();
    if (!termo) {
      this.ongsFiltradas = [...this.ongs];
      return;
    }

    this.ongsFiltradas = this.ongs.filter(ong =>
      (ong.nome && ong.nome.toLowerCase().includes(termo)) ||
      (ong.cidade && ong.cidade.toLowerCase().includes(termo)) ||
      (ong.estado && ong.estado.toLowerCase().includes(termo))
    );
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