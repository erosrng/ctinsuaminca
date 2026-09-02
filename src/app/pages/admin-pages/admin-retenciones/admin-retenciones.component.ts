import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from "../../../components/footer/footer.component";
import { AuthService } from '../../../auth.service';
import { API_URLINTER, PROTEO_URL_ALONEINTER } from '../../../app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SideBarComponent } from "../../../components/side-bar/side-bar.component";
import Swal from 'sweetalert2';

interface Retencion {
  tipo_doc: string;
  numero: string;
  cod_prv: string;
  reten: number;
  fecha: string;
  monto: number;
  abonos: number;
  banco: string;
  tasadolar: number;
  nombre: string;
  nomfis: string;
  direc: string;
  rif: string;
  tipo_op: string;
  numche: string;
  observa: string;
  rifci: string;
  transac: string;
  moneda: string;
  montod: number;
  mdivisa: number;
  negreso: string;
  idsprm: number;
  idriva: number;
  nrocomp: string;
  numeroriva: string;
  idgser: number;
  idscst: number;
}

interface DetalleRetencion {
  tipoppro: string;
  fecha: string;
  monto: number;
  idsprm: number;
  [key: string]: any;
}

interface FilaRetencion extends Retencion {
  expanded: boolean;
  loading: boolean;
  detalle: DetalleRetencion[] | null;
  error: boolean;
}

@Component({
  selector: 'app-admin-retenciones',
  imports: [
    NavBarComponent,
    MatSidenav,
    MatSidenavModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    FooterComponent,
    SideBarComponent
  ],
  templateUrl: './admin-retenciones.component.html',
  styleUrl: './admin-retenciones.component.scss'
})
export class AdminRetencionesComponent implements OnInit {
  toggleMenu = false;
  retenciones: FilaRetencion[] = [];
  filteredRetenciones: FilaRetencion[] = [];
  searchText: string = '';

  selectedMes: number = new Date().getMonth() + 1;
  selectedAnio: number = new Date().getFullYear();
  aniosDisponibles: number[] = [];
  meses: { valor: number; nombre: string }[] = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];

  currentPage: number = 1;
  pageSize: number = 15;
  totalPages: number = 0;

  constructor(
    public authService: AuthService,
    public http: HttpClient,
  ) {}

  ngOnInit() {
    const anioActual = new Date().getFullYear();
    for (let a = anioActual; a >= anioActual - 5; a--) {
      this.aniosDisponibles.push(a);
    }
    this.cargarRetenciones();
  }

  cambiarFiltro() {
    this.cargarRetenciones();
  }

  cargarRetenciones() {
    Swal.showLoading();
    const proveed = this.authService.getProveed();
    const token = this.authService.getToken();
    const formData = new FormData();
    const headers = new HttpHeaders({ 'Authorization': `${token}` });
    formData.append('proveed', proveed ?? '');
    formData.append('mes', this.selectedMes.toString());
    formData.append('anio', this.selectedAnio.toString());

    this.http.post(`${API_URLINTER}retenciones`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          if (response.result && response.data) {
            this.retenciones = response.data.map((r: Retencion) => ({
              ...r,
              expanded: false,
              loading: false,
              detalle: null,
              error: false
            }));
            this.applyFilter();
          }
          Swal.close();
        },
        error: () => {
          Swal.fire('Error', 'No se pudieron cargar las retenciones', 'error');
        }
      });
  }

  applyFilter() {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.filteredRetenciones = [...this.retenciones];
    } else {
      this.filteredRetenciones = this.retenciones.filter(r =>
        r.numero.toLowerCase().includes(search) ||
        r.tipo_doc.toLowerCase().includes(search) ||
        r.nombre.toLowerCase().includes(search) ||
        r.rif.toLowerCase().includes(search) ||
        r.banco.toLowerCase().includes(search) ||
        r.reten.toString().includes(search) ||
        r.transac.toLowerCase().includes(search)
      );
    }
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredRetenciones.length / this.pageSize);
  }

  get paginatedRetenciones(): FilaRetencion[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRetenciones.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  imprimir(id: number) {
    const url = `${PROTEO_URL_ALONEINTER}formatos/ver/RIVA/${id}/S`;
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes');
  }

  imprimirIslr(r: FilaRetencion) {
    const formato = r.idgser ? 'GSERRT' : 'SCSTRT';
    const id = r.idgser || r.idscst;
    const url = `${PROTEO_URL_ALONEINTER}formatos/ver/${formato}/${id}/S`;
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes');
  }

  toggleDetalle(r: FilaRetencion) {
    r.expanded = !r.expanded;
    if (r.expanded && !r.detalle && !r.loading) {
      if (r.tipo_doc === 'NC') {
        r.detalle = [];
      } else {
        this.cargarDetalle(r);
      }
    }
  }

  cargarDetalle(r: FilaRetencion) {
    r.loading = true;
    r.error = false;
    const token = this.authService.getToken();
    const formData = new FormData();
    const headers = new HttpHeaders({ 'Authorization': `${token}` });
    formData.append('tipo_doc', r.tipo_doc);
    formData.append('numero', r.numero);
    formData.append('cod_prv', this.authService.getProveed() ?? '');

    this.http.post(`${API_URLINTER}detalle_retencion`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          r.detalle = (response.result && response.data) ? response.data : [];
          r.loading = false;
        },
        error: () => {
          r.loading = false;
          r.error = true;
        }
      });
  }

verInfoAbono(d: DetalleRetencion) {
    const formato = this.esAbono(d) ? 'PPROABC' : 'PPROANC';
    const url = `${PROTEO_URL_ALONEINTER}formatos/ver/${formato}/${d.idsprm}`;
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes');
  }

  esAbono(d: DetalleRetencion): boolean {
    return d && d.tipoppro === 'AB';
  }

  esAnticipo(d: DetalleRetencion): boolean {
    return d && d.tipoppro === 'AN';
  }

objectKeys(obj: any): string[] {
    if (!obj) return [];
    const excluidos = ['tipo_doc', 'numero', 'mora', 'transac', 'estampa', 'hora', 'usuario', 'preten', 'creten', 'breten', 'reteiva', 'id', 'modificado', 'montod', 'abonod', 'cambiod', 'riva', 'pdescp', 'montpp', 'pdescpa', 'idsprm', 'cod_prv'];
    return Object.keys(obj).filter(key => !excluidos.includes(key));
  }

  columnName(key: string): string {
    const nombres: Record<string, string> = {
      numppro: 'Número',
      tipoppro: 'Tipo',
      fecha: 'Fecha',
      monto: 'Monto',
      abono: 'Abono',
      ppago: 'Pago',
      reten: 'Retención',
      cambio: 'Cambio',
      observa: 'Observación'
    };
    return nombres[key] || key;
  }

  openMenu(event: any) {
    this.toggleMenu = !this.toggleMenu;
  }
}
