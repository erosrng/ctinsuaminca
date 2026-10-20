import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import { AccessRole, AuthService } from './../../auth.service';
import { ACCESS_PERMISSIONS } from './../../access.config';
import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { Router } from '@angular/router';
import { PROTEO_URL_ALONEINTER } from './../../app.config';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    NavBarComponent,
    FooterComponent,
    SideBarComponent,
    MatSidenav,
    MatSidenavModule,
    CommonModule,
],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  userData: any;
  apiKey: string = '';
  isMenuOpen: boolean = true;
  toggleMenu = false;

  accessRole: AccessRole = 'VENDEDOR';
  accessLabel: string = 'Vendedor';
  accessIcon: string = 'fa-user';
  accessDescription: string = 'Reportes y tu cuenta';

  canSeeVentas: boolean = false;
  canSeeReportes: boolean = false;
  canSeeAdmin: boolean = false;
  canSeeAdminSummary: boolean = false;
  canSeeMasterReport: boolean = false;

  constructor(
    public authService: AuthService, 
    public portalcliLogicaService: PortalcliLogicaService,
    private router: Router
  ) {} 

  /* ngOnInit() { // Implementa ngOnInit
    const token = this.authService.getToken();
  }

  isMenuOpen: boolean = true;

  toggleMenu(){
    this.isMenuOpen = !this.isMenuOpen;
  } */

    ngOnInit() {
      // Obtener el token y los datos del usuario
      const token = this.authService.getToken();
      //this.userData = this.authService.getUserData(); // Obtener los datos del usuario
  
      // Suscribirse al estado del menú desde el servicio
      this.portalcliLogicaService.isMenuOpen$.subscribe((isOpen: boolean) => {
        this.isMenuOpen = isOpen;
      });

      this.accessRole = this.authService.getAccessRole();
      this.accessLabel = this.authService.getAccessLabel();
      this.accessIcon = this.authService.getAccessIcon();
      this.accessDescription = this.authService.getAccessDescription();

      // Accesos por perfil
      const permissions = ACCESS_PERMISSIONS[this.accessRole];
      this.canSeeVentas = permissions.ventas;
      this.canSeeReportes = permissions.reportes;
      this.canSeeAdmin = permissions.admin;
      this.canSeeAdminSummary = permissions.adminSummary;
      this.canSeeMasterReport = permissions.masterReport;
    }

    navigateTo(route: string) {
      this.router.navigate([route]);
    }

    bajareporteunico(){
      const usuario = this.authService.getUsuario();
      const url = `${PROTEO_URL_ALONEINTER}reportes/ver/VTPTPRV/${usuario}`;
      window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes');
    }

    bajareportemaster(){
      const proveed = this.authService.getProveed();
      const url = `${PROTEO_URL_ALONEINTER}reportes/ver/VTASCENTRA/${proveed}`;
      window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,screenx=((screen.availWidth/2)-400),screeny=((screen.availHeight/2)-300)');
    }

    bajareporteinv(){
      const proveed = this.authService.getProveed();
      const url = `${PROTEO_URL_ALONEINTER}reportes/ver/INVXLAB/${proveed}`;
      window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,screenx=((screen.availWidth/2)-400),screeny=((screen.availHeight/2)-300)');
    }

    logout() {
      this.authService.logout();
      this.router.navigate(['/login']);
    }

    openMenu(event: any) {
      if (this.toggleMenu) {
        this.toggleMenu = false;
      } else {
        this.toggleMenu = true;
      }
    }
}
