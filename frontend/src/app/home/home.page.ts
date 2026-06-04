import { Component} from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
standalone: false,
})
export class HomePage{

  constructor(private navCtrl: NavController) {}

  goToRegistration() {
    // Navega para a tela de Login (Tab 2)
    this.navCtrl.navigateForward('/registro');
  }

  goToLogin() {
    // Navega para a tela de Login (Tab 2)
    this.navCtrl.navigateForward('/login');
  }

  
}