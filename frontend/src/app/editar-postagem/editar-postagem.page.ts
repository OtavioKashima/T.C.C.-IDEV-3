import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController, ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-editar-postagem',
  templateUrl: './editar-postagem.page.html',
  styleUrls: ['./editar-postagem.page.scss'],
  standalone: false
})
export class EditarPostagemPage implements OnInit {
  postId: string | null = null;
  carregando: boolean = true;
  isAdminOuOng: boolean = false;

  post: any = {
    tipo_postagem: '',
    titulo: '',
    localizacao: '',
    descricao: '',
    raca: '',
    genero: '',
    idade: null,
    foto: '',
    fotosArray: []
  };

  novosArquivos: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private navCtrl: NavController,
    private toastController: ToastController,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id');

    const nivelAdmin = localStorage.getItem('admin');
    if (nivelAdmin === '1' || nivelAdmin === '2') {
      this.isAdminOuOng = true;
    }

    if (this.postId) {
      this.carregarPostagem(this.postId);
    }
  }

  carregarPostagem(id: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get(`http://localhost:3000/api/postagens/${id}`, { headers })
      .subscribe({
        next: (res: any) => {
          this.post = res;

          if (this.post.foto) {
            try {
              this.post.fotosArray = JSON.parse(this.post.foto);
            } catch (e) {
              this.post.fotosArray = [this.post.foto];
            }
          } else {
            this.post.fotosArray = [];
          }

          this.carregando = false;
        },
        error: (err) => {
          console.error('Erro ao carregar postagem', err);
          this.mostrarToast('Erro ao carregar dados.', 'danger');
          this.carregando = false;
        }
      });
  }

  removerFoto(index: number) {
    if (this.post && this.post.fotosArray) {
      const fotoRemovida = this.post.fotosArray[index];

      if (fotoRemovida && (fotoRemovida.startsWith('data:') || fotoRemovida.startsWith('blob:'))) {
        let contadorNovas = 0;
        for (let i = 0; i < index; i++) {
          if (this.post.fotosArray[i].startsWith('data:') || this.post.fotosArray[i].startsWith('blob:')) {
            contadorNovas++;
          }
        }
        this.novosArquivos.splice(contadorNovas, 1);
      }

      this.post.fotosArray.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  gatilhoSelecaoArquivo() {
    document.getElementById('inputFotoPost')?.click();
  }

  onFileSelected(event: any) {
    const arquivos: FileList = event.target.files;
    if (arquivos && arquivos.length > 0) {
      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];
        this.novosArquivos.push(arquivo);

        const reader = new FileReader();
        reader.onload = () => {
          this.post.fotosArray.push(reader.result as string);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(arquivo);
      }
    }
  }

  async salvarEdicao() {
    if (!this.post.titulo || !this.post.descricao) {
      this.mostrarToast('Título e Descrição são obrigatórios!', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.mostrarToast('Sessão expirada. Faça login novamente.', 'danger');
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.carregando = true;

    const formData = new FormData();
    formData.append('tipo_postagem', this.post.tipo_postagem || '');
    formData.append('titulo', this.post.titulo || '');
    formData.append('localizacao', this.post.localizacao || '');
    formData.append('descricao', this.post.descricao || '');

    if (this.post.tipo_postagem !== 'denuncia') {
      formData.append('raca', this.post.raca || '');
      formData.append('genero', this.post.genero || '');
      formData.append('idade', this.post.idade ? this.post.idade.toString() : '');
    }

    const fotosMantidas = this.post.fotosArray.filter(
      (f: string) => !f.startsWith('data:') && !f.startsWith('blob:')
    );
    formData.append('fotosMantidas', JSON.stringify(fotosMantidas));

    this.novosArquivos.forEach((arquivo) => {
      formData.append('foto', arquivo);
    });

    console.log('Enviando para:', `http://localhost:3000/api/postperfil/${this.postId}`);
    console.log('Token:', token);
    console.log('FotosMantidas:', fotosMantidas);
    console.log('NovosArquivos:', this.novosArquivos.length);

    this.http.put(`http://localhost:3000/api/postperfil/${this.postId}`, formData, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Resposta do servidor:', res);
          this.carregando = false;
          this.mostrarToast('Postagem atualizada com sucesso!', 'success');
          window.dispatchEvent(new CustomEvent('postagemAtualizada'));
          this.navCtrl.back();
        },
        error: (err) => {
          this.carregando = false;
          console.error('Erro completo:', err);
          console.error('Status:', err.status);
          console.error('Mensagem:', err.error);
          this.mostrarToast(`Erro ${err.status}: ${err.error?.message || 'Verifique os dados.'}`, 'danger');
        }
      });
  }

  async mostrarToast(mensagem: string, cor: string) {
    const toast = await this.toastController.create({
      message: mensagem, duration: 2000, color: cor, position: 'bottom'
    });
    toast.present();
  }
}