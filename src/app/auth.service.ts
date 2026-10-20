import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

export type AccessRole = 'SUPERPROV' | 'MASTERPROV' | 'ADMINPROV' | 'VENTAS' | 'VENDEDOR';

interface DecodedToken {
  proveed: string | null;
  usuariopadre: string | null;
  nomprv: string;
  usuario: string;
  nombre: string;
  emailuser: string | null;
  logged_in: boolean;
  tipo_u: string;
  almacen: string;
  tasa: string;
  rifproveed: string;
  cmatriz: string;
  lgrup: { grupo: string; nom_grup: string;}[];
  clientes: { cliente: string; nombre: string; rifci: string }[];
  API_TIME: number;
  dmfactura: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string | null = null;
  private decodedToken: DecodedToken | null = null;
  private jwtHelper = new JwtHelperService();
  private _codCli: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    try {
      this.decodedToken = this.jwtHelper.decodeToken(token);
    } catch (error) {
      console.error('Error decodificando token:', error);
      this.decodedToken = null;
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
      if (this.token) {
        try {
          this.decodedToken = this.jwtHelper.decodeToken(this.token);
        } catch (error) {
          console.error('Error decodificando token:', error);
          this.decodedToken = null;
        }
      }
    }
    return this.token;
  }

  removeToken() {
    this.token = null;
    this.decodedToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('loginUser');
    localStorage.removeItem('userType');
  }

  getUsuario(): string | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.usuario : null;
  }

  getEmailuser(): string | null {
    return this.decodedToken ? this.decodedToken.emailuser : null;
  }

  getProveed(): string | null {
    return this.decodedToken ? this.decodedToken.proveed : null;
  }

  getNombre(): string | null {
    return this.decodedToken ? this.decodedToken.nombre : null;
  }

  isLoggedIn(): boolean {
    return !!this.decodedToken && this.decodedToken.logged_in;
  }

  getTipoU(): string | null {
    return this.decodedToken ? this.decodedToken.tipo_u : null;
  }
  getUsuarioPadre(): string | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.usuariopadre : null;
  }

  /*
   * Perfiles del portal:
   * SUPERPROV  -> acceso total (master master)
   * MASTERPROV -> acceso completo del proveedor
   * ADMINPROV  -> solo administración (pagos y retenciones)
   * PTPRV / SPRVTRANSFE -> perfiles de ventas
   * Cualquier otro usuario -> vendedor
   */
  private static readonly ROLE_BY_CODE: Record<string, AccessRole> = {
    SUPERPROV: 'SUPERPROV',
    MASTERPROV: 'MASTERPROV',
    ADMINPROV: 'ADMINPROV',
    PTPRV: 'VENTAS',
    SPRVTRANSFE: 'VENTAS',
  };

  private getAccessCodes(): string[] {
    return [
      (this.getUsuario() || '').trim().toUpperCase(),
      (localStorage.getItem('loginUser') || '').trim().toUpperCase(),
      (this.getUsuarioPadre() || '').trim().toUpperCase(),
    ].filter((code) => !!code);
  }

  private isTransferUser(): boolean {
    return this.getAccessCodes().includes('SPRVTRANSFE');
  }

  getAccessRole(): AccessRole {
    for (const code of this.getAccessCodes()) {
      const role = AuthService.ROLE_BY_CODE[code];
      if (role) {
        return role;
      }
    }
    return 'VENDEDOR';
  }

  getAccessLabel(): string {
    switch (this.getAccessRole()) {
      case 'SUPERPROV':
        return 'Super Master';
      case 'MASTERPROV':
        return 'Master Proveedor';
      case 'ADMINPROV':
        return 'Administrativo';
      case 'VENTAS':
        return this.isTransferUser() ? 'Transferencista' : 'Ventas';
      default:
        return 'Vendedor';
    }
  }

  getAccessIcon(): string {
    switch (this.getAccessRole()) {
      case 'SUPERPROV':
        return 'fa-crown';
      case 'MASTERPROV':
        return 'fa-star';
      case 'ADMINPROV':
        return 'fa-briefcase';
      case 'VENTAS':
        return this.isTransferUser() ? 'fa-right-left' : 'fa-chart-line';
      default:
        return 'fa-user';
    }
  }

  getAccessDescription(): string {
    switch (this.getAccessRole()) {
      case 'SUPERPROV':
        return 'Acceso total al portal';
      case 'MASTERPROV':
        return 'Ventas, pedidos y reportes';
      case 'ADMINPROV':
        return 'Pagos y retenciones';
      case 'VENTAS':
        return this.isTransferUser()
          ? 'Transferencias y pedidos'
          : 'Catálogo, pedidos y reportes';
      default:
        return 'Ventas, reportes y tu cuenta';
    }
  }
  getAlmacen(): string | null {
    return this.decodedToken ? this.decodedToken.almacen : null;
  }
  getRif(): string | null {
    return this.decodedToken ? this.decodedToken.rifproveed : null;
  }
  getTasa(): number {
    if (!this.decodedToken || this.decodedToken.tasa === undefined || this.decodedToken.tasa === null) {
      return 0;
    }
  
    const parsedTasa = parseFloat(this.decodedToken.tasa);
    return isNaN(parsedTasa) ? 0 : parsedTasa;
  }

  getDiasMontoFactura(): number {
    if (!this.decodedToken || this.decodedToken.dmfactura === undefined || this.decodedToken.dmfactura === null) {
      return 0;
    }
  
    return this.decodedToken.dmfactura;
  }

  getNomprv(): string | null {
    return this.decodedToken ? this.decodedToken.nomprv : null;
  }

  getApiTime(): number | null {
    return this.decodedToken ? this.decodedToken.API_TIME : null;
  }

  logout() {
    this.removeToken();
  }

/*   getCodCli(): string | null {
    //if (!this._codCli) {
      this._codCli = localStorage.getItem('codCli');
        localStorage.setItem('codCli', this._codCli || '');
    //}
    return this._codCli;
  }

  setCodCli(codCli: string | null): void {
    this._codCli = codCli;
    localStorage.setItem('codCli', codCli || '');
  }
 */
  getCodCli(): string | null {
    //if (this._codCli === null) {
      this._codCli = localStorage.getItem('codCli');
    //}
    return this._codCli;
  }

  setCodCli(cliente: string | null): void {
    this._codCli = cliente;
    localStorage.setItem('codCli', cliente || '');
  }
  getClientes(): { cliente: string; nombre: string; rifci: string }[] | null {
    return this.decodedToken ? this.decodedToken.clientes : null;
  } 

  getLgrup(): { grupo: string; nom_grup: string; }[] | null {
    return this.decodedToken ? this.decodedToken.lgrup : null;
  }

}