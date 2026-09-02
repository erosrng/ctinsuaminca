import { Component, ViewChild, OnInit } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../../auth.service';
import { API_URL } from '../../../app.config';
import { API_URLINTER } from '../../../app.config';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  NgApexchartsModule
} from "ng-apexcharts";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from "../../../components/footer/footer.component";
import { FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SideBarComponent } from "../../../components/side-bar/side-bar.component";
import { HistoricoPedidosModel } from '../../../models/model';
import Swal from 'sweetalert2';

interface Vendedor {
  us_codigo: string;
  us_nombre: string;
  proveed: string;
  usuariopadre: string;
}

interface ResumenVendedor {
  totalg: number;
  us_nombre: string;
  pedidos: number;
  unidades: number;
}

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};
@Component({
  selector: 'app-admin-home',
  imports: [
    NavBarComponent,
    MatSidenav,
    MatSidenavModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatIconModule,
    FooterComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    SideBarComponent
  ],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent implements OnInit { // Implementa OnInit
  @ViewChild("chart") chart: ChartComponent | undefined;
  public unidadesVendidasPorVendedorChart: Partial<ChartOptions> | any; // Gráfico para unidades
  public totalVendidoPorVendedorChart: Partial<ChartOptions> | any; // Gráfico para el total
  // ... otras propiedades ...
  toggleMenu = false;
  toppings = new FormControl('');
  // Eliminamos la propiedad estática vededores
  selectedValue: string = '';
  vendedores: Vendedor[] = [];
  isLoadingVendedores: boolean = false;
  selectedVendedor: Vendedor | null = null;
  pedidos: HistoricoPedidosModel[] | null = []
  totalPedidos: number | null = null;
  totalUnidades: number | null = null;
  totalValorDolar: number | null = null;

  constructor(
    public authService: AuthService,
    public http: HttpClient,
  ) {
    this.unidadesVendidasPorVendedorChart = {
      series: [
        {
          name: "Unidades Vendidas",
          data: []
        }
      ],
      chart: {
        height: 350,
        type: "bar"
      },
      title: {
        text: "Unidades Vendidas por Vendedor",
        style: {
          color: '#053354',
          fontWeight: 600
        }
      },
      colors: ['#0F7243'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#45cbda'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#053354']
        }
      },
      xaxis: {
        categories: []
      }
    };

    this.totalVendidoPorVendedorChart = {
      series: [
        {
          name: "Total Vendido ($)",
          data: []
        }
      ],
      chart: {
        height: 350,
        type: "bar"
      },
      title: {
        text: "Total Vendido por Vendedor ($)",
        style: {
          color: '#053354',
          fontWeight: 600
        }
      },
      colors: ['#8b7b46'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#FEC100'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#053354']
        }
      },
      xaxis: {
        categories: []
      }
    };
  }

  ngOnInit() {
    Swal.showLoading();
    this.obtenerVendedores().subscribe(() => {
      this.cargarResumen();
      this.cargarResumenVendedores();
    });
  }

  cargarResumen() {
    const proveed = this.authService.getProveed();
    const token = this.authService.getToken();
    const formData = new FormData();

    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });
    formData.append('proveed', proveed ?? '');

    const apiUrl = `${API_URLINTER}resumen1`;

    this.http.post(apiUrl, formData, { headers: headers })
      .subscribe({
        next: (response: any) => {
          if (response.data) { // La API ya devuelve un objeto, no un array
            this.totalPedidos = parseInt(response.data.pedidos);
            this.totalUnidades = parseInt(response.data.unidades);
            this.totalValorDolar = parseFloat((response.data.totalg / this.authService.getTasa()).toFixed(2));
          } else {
            this.totalPedidos = 0;
            this.totalUnidades = 0;
            this.totalValorDolar = 0;
            console.warn('La API de resumen devolvió un objeto de datos vacío.');
          }
          // Swal.close(); // Movemos el Swal.close al final de ngOnInit o después de cargar ambos resúmenes
        },
        error: (error) => {
          console.error('Error al cargar resumen:', error);
          Swal.close();
        },
      });
  }

cargarResumenVendedores() {
    const proveed = this.authService.getProveed();
    const token = this.authService.getToken();
    const formData = new FormData();

    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });
    formData.append('proveed', proveed ?? '');

    const apiUrl = `${API_URLINTER}resumen2`;

    this.http.post<{ result: boolean, mensaje: string, data: ResumenVendedor[] }>(apiUrl, formData, { headers: headers })
      .subscribe({
        next: (response) => {
          if (response.data && Array.isArray(response.data)) {
            const topVendedores = response.data.slice(0, 10);

            // Gráfico de Unidades Vendidas
            this.unidadesVendidasPorVendedorChart.series = [{
              name: "Unidades Vendidas",
              data: topVendedores.map((item: ResumenVendedor) => item.unidades)
            }];
            this.unidadesVendidasPorVendedorChart.xaxis = {
              categories: topVendedores.map((item: ResumenVendedor) => item.us_nombre)
            };
            this.unidadesVendidasPorVendedorChart.yaxis = {
              labels: {
                formatter: (value: number) => {
                  return value;
                }
              }
            };

            // Gráfico de Total Vendido
            this.totalVendidoPorVendedorChart.series = [{
              name: "Total Vendido ($)",
              data: topVendedores.map((item: ResumenVendedor) => parseFloat((item.totalg / this.authService.getTasa()).toFixed(2)))
            }];
            this.totalVendidoPorVendedorChart.xaxis = {
              categories: topVendedores.map((item: ResumenVendedor) => item.us_nombre)
            };
            this.totalVendidoPorVendedorChart.yaxis = {
              labels: {
                formatter: (value: number) => {
                  return '$ ' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
              }
            };

          } else {
            this.unidadesVendidasPorVendedorChart.series = [{ name: "Unidades Vendidas", data: [] }];
            this.unidadesVendidasPorVendedorChart.xaxis = { categories: [] };
            this.totalVendidoPorVendedorChart.series = [{ name: "Total Vendido ($)", data: [] }];
            this.totalVendidoPorVendedorChart.xaxis = { categories: [] };
            console.warn('La API de resumen de vendedores devolvió datos incorrectos o vacíos.');
          }
          Swal.close();
        },
        error: (error) => {
          console.error('Error al cargar resumen de vendedores:', error);
          Swal.close();
        },
      });
  }


  obtenerVendedores(): Observable<void> {
    this.isLoadingVendedores = true;
    const formData = new FormData();
    const token = this.authService.getToken();
    const apiUrl = `${API_URLINTER}vendedoresportal`;
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });

    return this.http.post<{ data: Vendedor[], result: boolean, mensaje: string }>(apiUrl, formData, { headers: headers }).pipe(
      map(response => {
        if (response.result) {
          this.vendedores = response.data;
        } else {
          console.error('Error al cargar vendedores:', response);
          this.vendedores = [];
        }
        this.isLoadingVendedores = false;
      })
    );
  }

  openMenu(event: any) {
    if (this.toggleMenu) {
      this.toggleMenu = false;
    } else {
      this.toggleMenu = true;
    }
  }
}