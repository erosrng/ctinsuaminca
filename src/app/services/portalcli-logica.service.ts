import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './../auth.service';
import { Router } from '@angular/router';
import { API_URL } from '../app.config';
import { API_URLINTER } from '../app.config';

import Swal from 'sweetalert2';
import { Observable, of } from 'rxjs';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class PortalcliLogicaService {
  //Para el carrito 
  loading: boolean = false;
  private productosEnCarritoSubject = new BehaviorSubject<any[]>([]);
  productosEnCarrito$ = this.productosEnCarritoSubject.asObservable();
  private unidadesSubject = new BehaviorSubject<string>('');
  unidades$ = this.unidadesSubject.asObservable();
  private totalBsSubject = new BehaviorSubject<string>('');
  totalBs$ = this.totalBsSubject.asObservable();
  private totalUsdSubject = new BehaviorSubject<string>('');
  totalUsd$ = this.totalUsdSubject.asObservable();

  private ivaBsSubject = new BehaviorSubject<string>('');
  ivaBs$ = this.ivaBsSubject.asObservable();
  private ivaUsdSubject = new BehaviorSubject<string>('');
  ivaUsd$ = this.ivaUsdSubject.asObservable();

  private descuentoBsSubject = new BehaviorSubject<string>('');
  descuentoBs$ = this.descuentoBsSubject.asObservable();
  private descuentoUsdSubject = new BehaviorSubject<string>('');
  descuentoUsd$ = this.descuentoUsdSubject.asObservable();
  private encarprodSubject = new BehaviorSubject<string>('');
  encarprod$ = this.encarprodSubject.asObservable();
  private productosEnCarritoCodigosSubject = new BehaviorSubject<string[]>([]);
  productosEnCarritoCodigos$ = this.productosEnCarritoCodigosSubject.asObservable();

  //Informacion del cliente
  private clienteDataSource = new BehaviorSubject<any>({});
  clienteData$ = this.clienteDataSource.asObservable();


  private isMenuOpenSubject = new BehaviorSubject<boolean>(true);
  isMenuOpen$ = this.isMenuOpenSubject.asObservable();
  public isButtonOpen = false; 

    constructor(
      private authService: AuthService, 
      private http: HttpClient, 
      private router: Router
    ) {} 

    toggleMenu() {
      this.isButtonOpen = !this.isButtonOpen;
      this.isMenuOpenSubject.next(this.isButtonOpen);
    }
  
    openMenu() {
      if (!this.isButtonOpen) {
        this.isMenuOpenSubject.next(true);
      }
    }
  
    closeMenu() {
      if (!this.isButtonOpen) {
        this.isMenuOpenSubject.next(false);
      }
    }
    
  /* toggleMenu() {
    this.isMenuOpenSubject.next(!this.isMenuOpenSubject.value);
  } */


  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  agregarAlCarrito(producto: any, cantidad: number, descprov: number, almacen: string) {
    const codCli = this.authService.getCodCli();
    const proveed = this.authService.getProveed();
    const token = this.authService.getToken();
    const formData = new FormData();

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    formData.append('codigo', producto.codigo);
    formData.append('cana', cantidad.toString());
    formData.append('descprov', descprov.toString());
    formData.append('codCli', codCli ?? '');
    formData.append('proveed', proveed ?? '');

    formData.append('almacen', almacen);

    const apiUrl = `${API_URL}agg_pedido`;

    return this.http.post(apiUrl, formData, { headers: headers });
  }

  revisarCarrito(): void { 
    const codCli = this.authService.getCodCli();
    this.loading = true;
    const formData = new FormData();

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`,
    });
    formData.append('codCli', codCli ?? '');

    this.http.post(`${API_URL}revisacar`, formData, { headers: headers } ).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response && response.data.encar) {
          const productosEnCarrito = Object.entries(response.data.encar).map(([key, value]) => ({
            key,
            value,
          }));

          this.productosEnCarritoSubject.next(productosEnCarrito);
          this.unidadesSubject.next(response.data.encar.cana);
          this.totalBsSubject.next(response.data.encar.totalbs_con_descuento);
          this.totalUsdSubject.next(response.data.encar.totald_con_descuento);

          this.ivaBsSubject.next(response.data.encar.iva);
          this.ivaUsdSubject.next(response.data.encar.ivad);

          this.descuentoBsSubject.next(response.data.encar.descuento_bs);
          this.descuentoUsdSubject.next(response.data.encar.descuento_dolar);

          this.encarprodSubject.next(response.data.encar.products);
          this.productosEnCarritoCodigosSubject.next(response.data.codigos || []);
        } else {
          this.productosEnCarritoSubject.next([]);
          this.productosEnCarritoCodigosSubject.next([]);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al revisar el carrito:', error);
      },
    });
  }

  validateCant(event: any): string {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      event.target.value = numericValue;
    }
    if (numericValue.length > 1) {
      return numericValue.slice(0, 1);
    } else {
      return numericValue;
    }
  }

  //Vacia carrito
  vaciacar(): Observable<any> {
    const codCli = this.authService.getCodCli();
    const apiUrl = `${API_URL}vaciacar`;
    const formData = new FormData();
    const token = this.authService.getToken();
    formData.append('codCli', codCli ?? '');

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    return this.http.post(apiUrl, formData, { headers: headers }); // Devuelve el observable
  }
        
  selectedProduct: any;
  imageficha: any;

  openProductModal(codigo: string): Observable<any> {
    this.loading = true;
    const formData = new FormData();
    const token = this.authService.getToken();

    formData.append('codigo', codigo);

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = `${API_URL}traeficha`;

    return new Observable(observer => {
      this.http.post(apiUrl, formData, { headers: headers }).subscribe({
        next: (response: any) => {
          this.selectedProduct = response.data.producto;
          this.imageficha = response.data.imageUrl;
          this.loading = false;
          observer.next({ product: this.selectedProduct, imageUrl: this.imageficha }); // Emite un objeto
          observer.complete();
        },
        error: (error) => {
          this.loading = false;
          observer.error(error); // Emite el error
        },
      });
    });
  }

    alertaerror(){
      Swal.fire({
        text: 'Algo salió mal',
        icon: 'error',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        position: 'bottom-end',
    });
    }

    mostrarLoader(){
      Swal.fire({
        title: 'Cargando...',
        html: 'Por favor, espere...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
    }

    ocultarLoader(){
      Swal.close();
    }

  formatCurrency(value: number | string,moneda:string = 'USD'): string {

    const formateador:any = new Intl.NumberFormat('es-VE',{
      style:"currency",
      currency: moneda,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formateador.format(value);
  }

    private clienteCambiado = new Subject<string>();
    clienteCambiado$ = this.clienteCambiado.asObservable();
  
    notificarCambioCliente(codCli: string): void {
      this.clienteCambiado.next(codCli);
    }

    buscaalmacen() {
      const formData = new FormData();
      const token = this.authService.getToken();
  
      const headers = new HttpHeaders({
        'X-Auth-Token': `${token}`
      });
      const apiUrl = `${API_URL}buscaalmacen`;
  
      formData.append('codCli', this.authService.getCodCli() ?? '');
  
      this.http.post(apiUrl, formData, { headers: headers }).subscribe({
        next: (response: any) => {
          this.clienteDataSource.next(response.data.datcli);
        },
        error: (error) => {
          console.error('Error buscando almacen:', error);
        },
      });
    }

  obtenerItemCarrito(codigo: string, codCli: string, almacen: string): Observable<any> {
    const usuario = this.authService.getCodCli();
    const token = this.authService.getToken();
    const formData = new FormData();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    formData.append('codCli', codCli);
    formData.append('almacen', almacen);
    formData.append('usuario', usuario ?? '');

    const apiUrl = `${API_URL}opencardb`;

    return this.http.post(apiUrl, formData, { headers }).pipe(
      map((response: any) => {
        const items = Array.isArray(response.data) ? response.data : [];
        return items.find((item: any) => item.codigoa === codigo) || null;
      })
    );
  }

  actualizarCantidad(id: string, codigo: string, cantidad: number): Observable<any> {
    const token = this.authService.getToken();
    const formData = new FormData();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    formData.append('id', id);
    formData.append('codigo', codigo);
    formData.append('cantidad', cantidad.toString());

    const apiUrl = `${API_URL}totalizacampo`;
    return this.http.post(apiUrl, formData, { headers });
  }

  eliminarItemCarrito(id: string, codigo: string): Observable<any> {
    const token = this.authService.getToken();
    const formData = new FormData();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    formData.append('id', id);
    formData.append('codigo', codigo);

    const apiUrl = `${API_URL}eliminareg`;
    return this.http.post(apiUrl, formData, { headers });
  }

} 