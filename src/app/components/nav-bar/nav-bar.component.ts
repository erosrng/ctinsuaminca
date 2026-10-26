import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { AuthService } from './../../auth.service';
import { ACCESS_PERMISSIONS } from './../../access.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from './../../app.config';
import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatBadgeModule} from '@angular/material/badge';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, FormsModule,MatBadgeModule, MatButtonModule, MatIconModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  categoriaSeleccionada: { grupo: string; nom_grup: string } | null = null;
  searchTermNavbar: string = '';
  rutaActual: string = '';
  categoriaSeleccionadaNombre: string = ''; // Nueva variable
  categoriaSeleccionadaGrupo: string = ''; // Nueva variable
  searchParam: string = ''; // Nueva variable

  userData: any;
  apiKey: string = '';
  isMenuOpen: boolean = true;
  canSeeVentas: boolean = true;

  productosEnCarrito: any[] = [];
  productosEnCarritoNumber: string = '';
  encarprod: string = '';
  productosEnCarritoCodigos: string[] = [];
  selectedProduct: any = null;
  totalBs: string = '';
  totalUsd: string = '';
  unidades: string = '';

  private subscriptions: Subscription[] = [];
  clientes: { cliente: string; nombre: string; rifci: string }[] | null = null;
  grup: { grupo: string; nom_grup: string }[] | null = null;
  codCli: string | null = null;

  @Output() openMenu = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
    private http: HttpClient,
    public portalcliLogicaService: PortalcliLogicaService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['categoria']) {
        this.grup?.forEach((cat) => {
          if (cat.grupo == params['categoria']) {
            this.categoriaSeleccionada = cat;
            this.categoriaSeleccionadaNombre = cat.nom_grup; // Actualiza el nombre
            this.categoriaSeleccionadaGrupo = cat.grupo; // Actualiza el grupo
          }
        });
      } else {
        this.categoriaSeleccionada = null;
        this.categoriaSeleccionadaNombre = ''; // Limpia el nombre
        this.categoriaSeleccionadaGrupo = ''; // Limpia el grupo
      }
      this.searchParam = params['search'] || '';
      this.searchTermNavbar = this.searchParam; // Mantener el valor en el input
    });
    this.rutaActual = this.route.snapshot.url.join('/');
    //this.codCli = this.authService.getCodCli();
    //this.clientes = this.authService.getClientes();
    this.grup = this.authService.getLgrup();
    this.portalcliLogicaService.buscaalmacen();

    this.canSeeVentas = ACCESS_PERMISSIONS[this.authService.getAccessRole()].ventas;

    //if (this.rutaActual != 'carrito') {
    if (this.canSeeVentas) {
      this.revisarCarrito();
    }
    //}
  }

  toggleMenu() {
    this.openMenu.emit(true)
    // this.portalcliLogicaService.toggleMenu();
  }

  openMenuOnHover() {
    this.portalcliLogicaService.openMenu();
  }

  closeMenuOnLeave() {
    this.portalcliLogicaService.closeMenu();
  }

  navigateTo(route: string) {
    this.portalcliLogicaService.navigateTo(route);
  }

  onCategoriaSeleccionada(lgrup?: { grupo: string; nom_grup: string }): void {
    let currentSearch = '';
    this.route.queryParams.subscribe((params) => {
      currentSearch = params['search'] || '';
    });

    if (lgrup) {
      this.categoriaSeleccionadaNombre = lgrup.nom_grup;
      this.categoriaSeleccionadaGrupo = lgrup.grupo;
      this.router.navigate(['/pedidos'], {
        queryParams: {
          search: currentSearch, // Mantén el valor de search
          categoria: lgrup.grupo,
          categorianombre: lgrup.nom_grup,
        },
      });
    } else {
      this.categoriaSeleccionadaNombre = '';
      this.categoriaSeleccionadaGrupo = '';
      this.router.navigate(['/pedidos'], {
        queryParams: {
          search: currentSearch, // Mantén el valor de search
          categoria: '',
        },
      });
    }
  }

  buscarProductos() {
    let currentCategoria = '';
    let currentCategoriaNombre = '';
    this.route.queryParams.subscribe((params) => {
      currentCategoria = params['categoria'] || '';
      currentCategoriaNombre = params['categorianombre'] || '';
    });

      this.router.navigate(['/pedidos'], {
        queryParams: {
          search: this.searchTermNavbar || '',
          categoria: currentCategoria,
          categorianombre: currentCategoriaNombre, 
        },
      });
  }

  limpiarBuscar() {
    this.searchTermNavbar = '';
    this.buscarProductos(); // Refresca la búsqueda
  }

    revisarCarrito() {
      this.portalcliLogicaService.revisarCarrito();
      this.subscriptions.push(
        this.portalcliLogicaService.productosEnCarrito$.subscribe((productos) => {
          // Verifica si productos es un array y tiene al menos un elemento
          if (Array.isArray(productos) && productos.length > 0) {
            if (productos[0].value > 0) {
              this.productosEnCarritoNumber = productos[0].value;
            } else {
              this.productosEnCarritoNumber = '0';
            }
          } else {
            // Maneja el caso en que productos es vacío o no es un array
            this.productosEnCarritoNumber = '0'; // O cualquier valor predeterminado
          }
    
          if (this.rutaActual == 'pedidos') {
            this.productosEnCarrito = productos;
          }
        }),
        this.portalcliLogicaService.unidades$.subscribe((unidades) => {
          if (this.rutaActual == 'pedidos') {
            this.unidades = unidades;
          }
        }),
        this.portalcliLogicaService.totalBs$.subscribe((totalBs) => {
          if (this.rutaActual == 'pedidos') {
            this.totalBs = totalBs;
          }
        }),
        this.portalcliLogicaService.totalUsd$.subscribe((totalUsd) => {
          if (this.rutaActual == 'pedidos') {
            this.totalUsd = totalUsd;
          }
        }),
        this.portalcliLogicaService.encarprod$.subscribe((encarprod) => {
          if (this.rutaActual == 'pedidos') {
            this.encarprod = encarprod;
          }
        }),
        this.portalcliLogicaService.productosEnCarritoCodigos$.subscribe((codigos) => {
          if (this.rutaActual == 'pedidos') {
            this.productosEnCarritoCodigos = codigos;
          }
        })
      );
    }
    getNombreUsuarioSeleccionado(): string {
    const codCli = this.authService.getCodCli();
      return `${this.authService.getNombre()}`;


  }
}
