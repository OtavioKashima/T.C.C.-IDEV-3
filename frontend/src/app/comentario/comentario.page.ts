import { Component } from '@angular/core';
import { Location } from '@angular/common';

export interface Comment {
  author: string;
  avatar: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.page.html',
  styleUrls: ['./comentario.page.scss'],
  standalone: false
})
export class ComentarioPage {

  newComment: string = '';

  comments: Comment[] = [
    {
      author: 'Maria Silva',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      text: 'Que lindos! Adoraria adotar um. Vou entrar em contato pelo email.',
      time: 'há 2 horas'
    },
    {
      author: 'João Souza',
      avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
      text: 'Pitbulls são ótimos! Tenho dois e são muito carinhosos. Boa sorte na adoção!',
      time: 'há 3 horas'
    },
    {
      author: 'Ana Lima',
      avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
      text: 'Mandei email! Espero que ainda tenha filhote disponível 🐶',
      time: 'há 5 horas'
    }
  ];

  constructor(private location: Location) {}

  addComment(): void {
    const text = this.newComment.trim();
    if (!text) return;

    this.comments.push({
      author: 'Você',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: text,
      time: 'agora mesmo'
    });

    this.newComment = '';
  }

  goBack(): void {
    this.location.back();
  }

}