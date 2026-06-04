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

  // Objeto com as colunas EXATAS do banco de dados + os novos campos de suporte
  post: any = {
    tipo_postagem: '',
    titulo: '',
    localizacao: '', // 📍 NOVO: Campo adicionado ao modelo inicial
    descricao: '',
    raca: '',
    genero: '',
    idade: null,
    foto: '',
    fotosArray: [] // 🖼️ NOVO: Inicializado como array para evitar erros de template
  };

  // 🔴 LISTA DE NOVOS ARQUIVOS SELECIONADOS
  novosArquivos: File[] = []; // Guarda os arquivos reais prontos para upload via FormData

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

    // 🟢 CORREÇÃO: Lendo a nova variável 'admin' que salvamos no login
    const nivelAdmin = localStorage.getItem('admin');

    // Se for 1 (Admin) ou 2 (ONG), libera as opções avançadas
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

    // 🟢 CORREÇÃO: URL ajustada para buscar UMA postagem pelo ID dela
    this.http.get(`http://localhost:3000/api/postagens/${id}`, { headers })
      .subscribe({
        next: (res: any) => {
          this.post = res;

          // 🖼️ PROCESSA AS FOTOS VINDAS DO SERVIDOR
          if (this.post.foto) {
            try {
              // Tenta decodificar caso o banco salve como string JSON: '["foto1.jpg", "foto2.jpg"]'
              this.post.fotosArray = JSON.parse(this.post.foto);
            } catch (e) {
              // Fallback caso no banco esteja apenas uma string simples: 'foto1.jpg'
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

  // LÓGICA PARA REMOVER FOTO (MANTIDAS OU NOVAS)
  removerFoto(index: number) {
    if (this.post && this.post.fotosArray) {
      const fotoRemovida = this.post.fotosArray[index];

      // Se a foto removida for uma recém-adicionada (base64 local), removemos ela também do array de envio
      if (fotoRemovida && (fotoRemovida.startsWith('data:') || fotoRemovida.startsWith('blob:'))) {
        let contadorNovas = 0;
        for (let i = 0; i < index; i++) {
          if (this.post.fotosArray[i].startsWith('data:') || this.post.fotosArray[i].startsWith('blob:')) {
            contadorNovas++;
          }
        }
        this.novosArquivos.splice(contadorNovas, 1);
      }

      // Remove a foto da lista visual
      this.post.fotosArray.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  gatilhoSelecaoArquivo() {
    document.getElementById('inputFotoPost')?.click();
  }

  // CAPTURA MÚLTIPLAS NOVAS IMAGENS
  onFileSelected(event: any) {
    const arquivos: FileList = event.target.files;
    if (arquivos && arquivos.length > 0) {

      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];
        this.novosArquivos.push(arquivo); // Armazena o arquivo binário real para o PUT

        // Gera o preview local em base64 e joga no array visual
        const reader = new FileReader();
        reader.onload = () => {
          this.post.fotosArray.push(reader.result as string);
          this.cdr.detectChanges(); // Força o Angular a renderizar o novo item no grid
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
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.carregando = true;

    const formData = new FormData();
    formData.append('tipo_postagem', this.post.tipo_postagem);
    formData.append('titulo', this.post.titulo);
    formData.append('localizacao', this.post.localizacao || ''); // 📍 enviando a localização atualizada
    formData.append('descricao', this.post.descricao);

    if (this.post.tipo_postagem !== 'denuncia') {
      formData.append('raca', this.post.raca || '');
      formData.append('genero', this.post.genero || '');
      formData.append('idade', this.post.idade ? this.post.idade.toString() : '');
    }

    // Separamos e enviamos quais fotos antigas do servidor o usuário NÃO deletou
    const fotosMantidas = this.post.fotosArray.filter((f: string) => !f.startsWith('data:') && !f.startsWith('blob:'));
    formData.append('fotosMantidas', JSON.stringify(fotosMantidas));

    // Anexa todas as novas fotos físicas selecionadas sob a chave 'foto'
    this.novosArquivos.forEach((arquivo) => {
      formData.append('foto', arquivo);
    });

    this.http.put(`http://localhost:3000/api/postperfil/${this.postId}`, formData, { headers })
      .subscribe({
        next: (res: any) => {
          this.carregando = false;
          this.mostrarToast('Postagem updated com sucesso!', 'success');
          window.dispatchEvent(new CustomEvent('postagemAtualizada'));
          this.navCtrl.back();
        },
        error: (err) => {
          this.carregando = false;
          console.error('Erro ao salvar', err);
          this.mostrarToast('Erro ao atualizar. Verifique os dados.', 'danger');
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