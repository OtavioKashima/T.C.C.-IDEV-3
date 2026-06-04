import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
   constructor(private navCtrl: NavController) {}
  
    goToLogin() {
      // Navega para a tela de Login (Tab 2)
      this.navCtrl.navigateForward('/login');
    }
  
    goToRegistration() {
      // Navega para a tela de Cadastro (Tab 3)
      this.navCtrl.navigateForward('/registro');
    }
  }

