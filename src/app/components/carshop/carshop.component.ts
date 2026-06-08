import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, takeUntil, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './../../auth.service';
import Swal from 'sweetalert2';
import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { API_URL } from './../../app.config';
import { API_URLINTER } from './../../app.config';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input'; // Importa MatInputModule
import { MatIconModule } from '@angular/material/icon';

import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select'; // Importa MatSelectModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Importa MatFormFieldModule
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface Product {
    img: string;
    descrip: string;
    preciosiniva: number;
    ivabs: number;
    preciod: number;
    ivad: number;
    totalbs: number;
    totald: number;
    cant: string;
    descprov: number;
    //descu: number;
    id_pedido: number;
    codigoa: string;
}


@Component({
    selector: 'app-carshop',
    imports: [
        CommonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatDialogModule,
        MatButtonModule,
        MatSelectModule
    ],
    templateUrl: './carshop.component.html',
    styleUrl: './carshop.component.scss'
})
export class CarshopComponent implements OnInit, AfterViewInit {
    isLoading = false;

    sortField: string = 'descrip'; // Campo de ordenamiento inicial
    sortDirection: 'desc' | 'asc' = 'desc';
    private subscriptions: Subscription[] = [];
    private clienteCambiadoSubscription: Subscription | undefined;

    private destroy$ = new Subject<void>();
    clienteData: any;
    private clienteDataSubscription: Subscription | undefined;
    codCli: string | null = null;

    encarprod: string = '';

    @ViewChild('productModalTemplate')
    productModalTemplate!: TemplateRef<any>;

    productosEnCarritoNumber: string = '';
    productscar: Product[] = [];
    dataSource = new MatTableDataSource<Product>(this.productscar);
    displayedColumns: string[] =
        ['img', 'descrip', 'preciosinivad', 'ivad', 'preciosiniva', 'ivabs',  'totalbs', 'totald', 'cant', 'descprov','actions']; 
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    totalBs: string = '';
    totalUsd: string = '';
    unidades: string = '';

    descuentoLineal: number | 0 = 0;
    ivaBs: string = '';
    ivaUsd: string = '';
    descuentoBs: string = '';
    descuentoUsd: string = '';

    diasCredito: number = 0;
    montoFactura: number = 0;
    productosEnCarritoCodigos: string[] = [];
    emailSendUser = ''
    totalAmount = 0
    totalAmountBS = 0
    totalAmountD = 0

    constructor(
        private route: Router,
        private http: HttpClient,
        private authService: AuthService,
        public portalcliLogicaService: PortalcliLogicaService,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.codCli = this.authService.getCodCli();
        if(this.codCli){
            this.subscribeToClienteData();
        }

        /* this.clienteCambiadoSubscription = this.portalcliLogicaService.clienteCambiado$.subscribe(() => {
          console.log(this.clienteCambiadoSubscription)
          this.openCar();
        }); */
    }

   /*  ngAfterViewInit(): void {

    } */

   ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
}

    subscribeToClienteData() {
        this.portalcliLogicaService.clienteData$.pipe(takeUntil(this.destroy$)).subscribe(data => {
            this.clienteData = data;
            this.openCar();
        });
    }

    /* openCar() {
        const codCli = this.authService.getCodCli();

        Swal.showLoading()
        const token = this.authService.getToken();
        const formData = new FormData();

        const headers = new HttpHeaders({
            'X-Auth-Token': `${token}`
        });

        const apiUrl = `${API_URL}opencardb`;
        formData.append('codCli', codCli ?? '');
        if (this.clienteData && this.clienteData.ubica) {
            formData.append('almacen', this.clienteData.ubica);
        }else{
            formData.append('almacen', '');
        }
        this.http.post(apiUrl,formData, { headers: headers }).subscribe({
            next: (response: any) => {
                this.revisarCarrito();
                
                this.productscar = response.data;
                this.dataSource.data = this.productscar;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.sortData(this.sortField as keyof Product); // Llamar a sortData después de asignar los datos
                this.isLoading = false;

                for (const producto of this.productscar) {
                    console.log('Descripción:', producto.descrip);
                    console.log('Precio Total Bs:', producto.preciod);
                    console.log('Codigo', producto.codigoa);
                    console.log('descuento:', producto.descprov);
                    console.log('cantidad:', producto.cant);

                    this.recalculadescud(producto);
                    this.recalculadescubs(producto);
                    setTimeout(()=>{
                        this.recalcular(parseFloat(producto.cant), producto.codigoa)
                    },500);
                    
                }
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Error al cargar carrito de compras:', error);
            },
        });
        setTimeout(()=>{
            this.totalizartodo();
        },500);
    } */


    openCar() {
        const codCli = this.authService.getCodCli();

        Swal.showLoading()
        Swal.showLoading()
        // Ocultar la tabla al iniciar la carga
        const tableElement = document.querySelector('.carrito__table');
        if (tableElement) {
            tableElement.classList.add('hidden');
        }

        const token = this.authService.getToken();
        const formData = new FormData();

        const headers = new HttpHeaders({
            'X-Auth-Token': `${token}`
        });

        const apiUrl = `${API_URL}opencardb`;
        formData.append('codCli', codCli ?? '');
        if (this.clienteData && this.clienteData.ubica) {
            formData.append('almacen', this.clienteData.ubica);
        } else {
            formData.append('almacen', '');
        }
        this.http.post(apiUrl, formData, { headers: headers }).subscribe({
            next: (response: any) => {
                this.revisarCarrito();

                this.productscar = response.data || []; 
                this.dataSource.data = this.productscar;
                let aux = 0
                this.productscar.forEach(product => {
                    aux = aux + Number(product.cant)
                    this.totalAmount = this.totalAmount + this.recalculadescud(product)
                    this.totalAmountBS = this.totalAmountBS + this.recalculadescubs(product)*aux;
                    this.totalAmountD = this.totalAmountD + this.recalculadescud(product)*aux;
                })
                //console.log('TOTAL UNIDADES: ', aux)
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.sortData(this.sortField as keyof Product); // Llamar a sortData después de asignar los datos

                // Recalcular datos y luego mostrar la tabla
                let recalculationPromises: Promise<void>[] = [];
                for (const producto of this.productscar) {
                    /* console.log('Descripción:', producto.descrip);
                    console.log('Precio Total Bs:', producto.preciod);
                    console.log('Codigo', producto.codigoa);
                    console.log('descuento:', producto.descprov);
                    console.log('cantidad:', producto.cant); */

                    this.recalculadescud(producto);
                    this.recalculadescubs(producto);
                    recalculationPromises.push(new Promise(resolve => {
                        setTimeout(() => {
                            this.recalcular(parseFloat(producto.cant), producto.codigoa);
                            resolve();
                        }, 1000); // Reduje el tiempo para una respuesta más rápida
                    }));
                }

                Promise.all(recalculationPromises).then(() => {
                    this.totalizartodo();
                    this.isLoading = false;
                    // Mostrar la tabla después de la carga y el recálculo
                    if (tableElement) {
                        tableElement.classList.remove('hidden');
                        Swal.close()
                    }
                });
            },
            error: (error) => {
                this.isLoading = false;
                Swal.close()
                // Mostrar la tabla en caso de error también para que el usuario vea si hay algún mensaje
                const tableElement = document.querySelector('.carrito__table');
                if (tableElement) {
                    tableElement.classList.remove('hidden');
                }
                console.error('Error al cargar carrito de compras:', error);
            },
        });
    }

    // Función para aplicar el descuento lineal a todos los items del carrito
    aplicarDescuentoLineal(event: any): void {
        const inputValue = event.target.value;
        this.descuentoLineal = parseFloat(inputValue);

        if (isNaN(this.descuentoLineal) || inputValue === '') {
            this.descuentoLineal = 0;
            // También puedes actualizar directamente el valor del input si lo prefieres:
            event.target.value = '0';
        }
        if (this.descuentoLineal > 100) {
            Swal.fire('El descuento no puede ser mayor a 100', '', 'warning');
            return;
        }
        if (this.descuentoLineal !== null) {
            this.productscar = this.productscar.map(product => {
                product.descprov = this.descuentoLineal!; // Asignación directa (usando '!' para asegurar que no es null)

                return product;
            });
            this.dataSource.data = [...this.productscar];
        } else {
            this.productscar = this.productscar.map(product => {
                product.descprov = 0;
                return product;
            });
            this.dataSource.data = [...this.productscar];
        }

        const apiUrl = `${API_URL}totalizadesc`;
        const formData = new FormData();
        const token = this.authService.getToken();
        const codCli = this.authService.getCodCli();

        const headers = new HttpHeaders({
            'X-Auth-Token': `${token}`
        });

        formData.append('desc', this.descuentoLineal!.toString());
        formData.append('codCli', codCli ?? '');

        this.http.post(apiUrl,formData, { headers: headers }).subscribe({
            next: (response: any) => {
                if (response.result === true) {
                    this.revisarCarrito();
                    Swal.fire({
                        text: 'Descuento aplicado',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 3000,
                        toast: true,
                        position: 'bottom-end',
                    });
                    this.productscar.map(product => {
                        const cantidadinput = document.getElementById(`cantidad_${product.codigoa}`) as HTMLInputElement;

                        this.recalculadescud(product);
                        this.recalculadescubs(product);
                        this.recalcular(parseFloat(cantidadinput.value), product.codigoa)
                    });
                }
            },
            error: (error) => {
                this.isLoading = false;
                Swal.close()
                console.error('Error al actualizar', error);
                this.alertaerror();
            },
        });
    }

    eliminareg(caller: any, idPedido: any, codigo: any) {
        Swal.showLoading()

        const apiUrl = `${API_URL}eliminareg`;
        const formData = new FormData();
        const token = this.authService.getToken();

        const headers = new HttpHeaders({
            'X-Auth-Token': `${token}`
        });

        formData.append('id', idPedido);
        formData.append('codigo', codigo);

        this.productscar = this.productscar.filter(product => product.id_pedido !== idPedido && product.codigoa !== codigo);
        this.dataSource.data = this.productscar;

        this.http.post(apiUrl, formData, { headers: headers }).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                Swal.close()
                if (response.result === true) {
                    // Actualiza productscar
                    this.productscar = this.productscar.filter(product => product.id_pedido !== idPedido && product.codigoa !== codigo);
                    this.revisarCarrito();
                    Swal.fire({
                        text: 'Producto eliminado',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 3000,
                        toast: true,
                        position: 'bottom-end',
                    });
                } else {
                    this.alertaerror();
                }
            },
            error: (error) => {
                this.isLoading = false;
                Swal.close()
                this.alertaerror();
            },
        });
    }

    //Envia pedidos al servidor
    enviaped(){
        Swal.showLoading()
        const codCli = this.authService.getCodCli();

        const formData = new FormData();
        const token = this.authService.getToken();

        formData.append('codCli', codCli ?? '');
        formData.append('diasCredito', String(this.diasCredito));
        formData.append('montoFactura', String(this.montoFactura));

        const headers = new HttpHeaders({
            'X-Auth-Token': `${token}`
        });
        const apiUrl = `${API_URL}enviapedweb`;

        Swal.fire({
            title: '¿Desea enviar el pedido?',
            text: "Esta acción no se puede deshacer.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Procesando pedido...',
                    html: 'Por favor espere un momento',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                /* Swal.fire({
                    title: 'Ingrese una observación para el pedido',
                    input: 'textarea',
                    inputPlaceholder: 'Escriba aquí su observación (obligatorio)',
                    showCancelButton: true,
                    confirmButtonText: 'Continuar con el envío',
                    cancelButtonText: 'Cancelar',
                    inputValidator: (value) => {
                        if (!value) {
                            return '¡La observación es obligatoria!';
                        }
                        return null;
                    },
                    preConfirm: (observacion) => {
                        this.enviarPedidoConObservacion(apiUrl, formData, headers, observacion);
                    }
                }); */
                this.generar_pedido_proteo(apiUrl, formData, headers);

            }
        });
    }

    enviarPedidoConObservacion(apiUrl: string, formData: FormData, headers: HttpHeaders, observacion: string) {
        this.mostrarLoader();
        formData.append('observa', observacion); // Agrega la observación al FormData

                this.isLoading = false;
                Swal.close()
                this.ocultarLoader();
                this.generar_pedido_proteo(apiUrl, formData, headers);

    }


    generar_pedido_proteo(apiUrl: any, formData: any, headers: any): void {
        this.http.post(apiUrl, formData, { headers: headers }).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.ocultarLoader();
                
                if (response.result) {
                    // Éxito
                    Swal.fire({
                        title: '¡Éxito!',
                        text: response.message || 'Pedido enviado correctamente',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        this.productscar = [];
                        this.dataSource.data = this.productscar;
                        this.revisarCarrito();
                    });
                } else {
                    // Error del servidor (result: false)
                    Swal.fire({
                        title: 'Error',
                        text: response.message || 'Ocurrió un error al procesar el pedido',
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    });
                }
            },
            error: (error) => {
                this.isLoading = false;
                this.ocultarLoader();
                
                // Error de conexión/API
                Swal.fire({
                    title: 'Error de conexión',
                    text: error.message || 'No se pudo conectar con el servidor',
                    icon: 'error',
                    confirmButtonText: 'Reintentar'
                });
                console.error('Error de la API:', error);
            }
        });
    }

    //Vacia carrito
    vaciacar(): void {
        Swal.fire({
            title: '¿Desea vaciar el carrito?',
            text: "Eliminar todos los productos en el mismo.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Vaciar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.portalcliLogicaService.vaciacar().subscribe({
                    next: (response: any) => {
                        if (response.result) {
                            // Vaciar this.productscar
                            this.productscar = [];

                            // Actualizar this.dataSource.data
                            this.dataSource.data = this.productscar;

                            // Actualizar el carrito
                            this.revisarCarrito();

                            Swal.fire({
                                text: 'Carro vacio',
                                icon: 'success',
                                showConfirmButton: false,
                                timer: 3000,
                                toast: true,
                                position: 'bottom-end',
                            });
                        } else {
                            this.alertaerror();
                        }
                    },
                    error: (error) => {
                        this.alertaerror();
                    },
                });
            }
        });
    }

    totalCompleto: number = 0;
    
    revisarCarrito() {
        this.portalcliLogicaService.revisarCarrito();
        this.subscriptions.push(
            this.portalcliLogicaService.productosEnCarrito$.subscribe((productos) => {
                if (productos && productos.length > 0 && productos[0] && productos[0].value > 0) {
                    this.productosEnCarritoNumber = productos[0].value;
                } else {
                    this.productosEnCarritoNumber = '0';
                }
            }),


            this.portalcliLogicaService.unidades$.subscribe((unidades) => {
                this.unidades = unidades;
            }),
           this.portalcliLogicaService.totalBs$.subscribe((totalBs) => {
                this.totalBs = totalBs;
            }),
            this.portalcliLogicaService.totalUsd$.subscribe((totalUsd) => {
                this.totalUsd = totalUsd;
            }),
            this.portalcliLogicaService.encarprod$.subscribe((encarprod) => {
                this.encarprod = encarprod;
            }),
            this.portalcliLogicaService.ivaBs$.subscribe((ivaBs) => {
                this.ivaBs = ivaBs;
            }),
            this.portalcliLogicaService.ivaUsd$.subscribe((ivaUsd) => {
                this.ivaUsd = ivaUsd;
            }),

            this.portalcliLogicaService.descuentoBs$.subscribe((descuentoBs) => {
                this.descuentoBs = descuentoBs;
            }),
            this.portalcliLogicaService.descuentoUsd$.subscribe((descuentoUsd) => {
                this.descuentoUsd = descuentoUsd;
            }),
        );
    }

    imageficha: any;
    selectedProduct: any = null;

    openProductModal(row: any) {
        Swal.showLoading();
        this.portalcliLogicaService.openProductModal(row.codigoa).subscribe({
            next: (data) => {
                Swal.close();
                this.selectedProduct = data.product;
                this.imageficha = data.imageUrl;
                this.openDialog(); // Llama a la función para abrir el modal
            },
            error: (error) => {
                Swal.close();
                console.error('Error al obtener el producto:', error);
            },
        });
    }

    openDialog() {
        this.dialog.open(this.productModalTemplate, {
            width: '80%',
            maxWidth: '1200px',
            data: { product: this.selectedProduct, imageUrl: this.imageficha } // Puedes pasar datos si es necesario
        });
    }

    validateInput(product: any, event: any) {
        product.cant = this.portalcliLogicaService.validateCant(event);
    }

    alertaerror(){
        this.portalcliLogicaService.alertaerror();
    }

    mostrarLoader(){
        this.portalcliLogicaService.mostrarLoader();
    }

    ocultarLoader(){
        this.portalcliLogicaService.ocultarLoader();
    }

    sortData(sortField: keyof Product) {
        this.sortField = sortField;
        if (this.productscar && Array.isArray(this.productscar)) {
            this.productscar.sort((a, b) => {
                let valueA = a[sortField];
                let valueB = b[sortField];

                if (sortField === 'cant') {
                    // Ordenamiento numérico para la columna 'cant'
                    const numA = Number(valueA);
                    const numB = Number(valueB);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        if (numA < numB) {
                            return this.sortDirection === 'asc' ? -1 : 1;
                        } else if (numA > numB) {
                            return this.sortDirection === 'asc' ? 1 : -1;
                        } else {
                            return 0;
                        }
                    } else {
                        // Si los valores no son números válidos, vuelve a la comparación de strings (opcional)
                        const strA = String(valueA).toLowerCase();
                        const strB = String(valueB).toLowerCase();
                        if (strA < strB) {
                            return this.sortDirection === 'asc' ? -1 : 1;
                        } else if (strA > strB) {
                            return this.sortDirection === 'asc' ? 1 : -1;
                        } else {
                            return 0;
                        }
                    }
                } else if (typeof valueA === 'string' && typeof valueB === 'string') {
                    // Ordenamiento de strings (ignorando mayúsculas/minúsculas) para otras columnas de texto
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                    if (valueA < valueB) {
                        return this.sortDirection === 'asc' ? -1 : 1;
                    } else if (valueA > valueB) {
                        return this.sortDirection === 'asc' ? 1 : -1;
                    } else {
                        return 0;
                    }
                } else {
                    // Ordenamiento por defecto para otros tipos de datos (puede necesitar ajustes según tus datos)
                    if (valueA < valueB) {
                        return this.sortDirection === 'asc' ? -1 : 1;
                    } else if (valueA > valueB) {
                        return this.sortDirection === 'asc' ? 1 : -1;
                    } else {
                        return 0;
                    }
                }
            });
            this.dataSource.data = this.productscar;
        } else {
            console.warn('this.productscar no es un array, no se puede ordenar.');
        }
    }

    onSortChange(sortField: string) {
        this.sortData(sortField as keyof Product);
    }

    toggleSortDirection() {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.sortData(this.sortField as keyof Product);
    }


    // Agrega la función applyFilter
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    updatecant(idPedido: string, codigo: string, existen: string, change: string) {
        const input = document.getElementById(`cantidad_${codigo}`) as HTMLInputElement;

        const existenNum = parseInt(existen); // Convertir a número correctamente

        if (input) {
            const cantidadInput = parseInt(input.value); // Obtener el valor del input y convertirlo a número

            if (cantidadInput > existenNum && change!="-") { // Comparar el valor del input con existen
                Swal.fire('Cantidad mayor a existencia', '', 'error');
                return;
            }

            let newValue = cantidadInput + ((change === '-') ? -1 : 1);

            if (newValue > 0) {
                input.value = newValue.toString();
                this.recalcular(newValue,codigo)

                this.totaliza(idPedido, codigo, newValue, existenNum); // Usar existenNum
            }
        }
        this.totalizartodo();
    }

    sumabs: number = 0.00;
    sumausd: number = 0.00;

    totalizartodo(): void {
        this.sumausd = 0.00; // Resetear la suma al inicio
        this.sumabs = 0.00; // Resetear la suma al inicio

        const self = this; // Guarda una referencia a 'this' para usar dentro de la función each
        //console.log($('tbody >tr> td[id^="totald"]'));
        $('tbody >tr> td[id^="total"]').each(function(i, e) {
            let valor = $(this).html();
            if (valor) {
                valor = valor.replace('USD&nbsp;','').replace('Bs.S&nbsp;','').replace('.', '').replace(',', '.');
                const valorNumerico:number = parseFloat(valor);
                //console.log(valorNumerico)

                if (!isNaN(valorNumerico)) {
                    // @ts-ignore
                    let nid:string = $(this).attr('id').split('_')[0]
                    if( nid == 'totald') {
                        self.sumausd += valorNumerico; // Usa 'self.suma' para acceder a la propiedad del componente
                    } else {
                        self.sumabs += valorNumerico; // Usa 'self.suma' para acceder a la propiedad del componente
                    }
                    //self.suma += valorNumerico; // Usa 'self.suma' para acceder a la propiedad del componente
                }
            }
        });

        //console.log([this.sumabs.toFixed(2),this.sumausd.toFixed(2)]);
    }



    recalculadescud(product: any): number {
        let precio = parseFloat(String(product.opreciod));
        let descuentoProveedorPorcentaje = parseFloat(String(product.descprov).replace(',', '.'));
        let otroDescuentoPorcentaje = parseFloat(String(product.descu).replace(',', '.'));
        let descuentoFichaPorcentaje = parseFloat(String(product.ficha).replace(',', '.')); // Descuento de ficha
    
        if (!isNaN(precio)) {
            let precioConDescuento = precio;
    
            // Aplicar descuento del proveedor si es válido y mayor que cero
            if (!isNaN(descuentoProveedorPorcentaje) && descuentoProveedorPorcentaje > 0) {
                const descuentoProveedor = (precioConDescuento * descuentoProveedorPorcentaje) / 100;
                precioConDescuento -= descuentoProveedor;
            }
    
            // Aplicar descuento de ficha si es válido y mayor que cero
            /* if (!isNaN(descuentoFichaPorcentaje) && descuentoFichaPorcentaje > 0) {
                const descuentoFicha = (precioConDescuento * descuentoFichaPorcentaje) / 100;
                precioConDescuento -= descuentoFicha;
            }
    
            // Aplicar el otro descuento si es válido y mayor que cero
            if (!isNaN(otroDescuentoPorcentaje) && otroDescuentoPorcentaje > 0) {
                const otroDescuento = (precioConDescuento * otroDescuentoPorcentaje) / 100;
                precioConDescuento -= otroDescuento;
            } */
    
            return precioConDescuento;
        } else {
            return precio;
        }
    }

    recalculadescubs(product: any): number {
        let precio = parseFloat(String(product.oprecio));
        let descuentoProveedorPorcentaje = parseFloat(String(product.descprov).replace(',', '.'));
        //let descuentoFichaPorcentaje = parseFloat(String(product.ficha).replace(',', '.')); // Descuento de ficha
        //let otroDescuentoPorcentaje = parseFloat(String(product.descu).replace(',', '.')); // Nuevo descuento
    
        if (!isNaN(precio)) {
            let precioConDescuento = precio;
    
            // Aplicar descuento del proveedor si es válido y mayor que cero
            if (!isNaN(descuentoProveedorPorcentaje) && descuentoProveedorPorcentaje > 0) {
                const descuentoProveedor = (precioConDescuento * descuentoProveedorPorcentaje) / 100;
                precioConDescuento -= descuentoProveedor;
            }
    
            // Aplicar descuento de ficha si es válido y mayor que cero
            /* if (!isNaN(descuentoFichaPorcentaje) && descuentoFichaPorcentaje > 0) {
                const descuentoFicha = (precioConDescuento * descuentoFichaPorcentaje) / 100;
                precioConDescuento -= descuentoFicha;
            } */
    
            // Aplicar el otro descuento si es válido y mayor que cero
            /* if (!isNaN(otroDescuentoPorcentaje) && otroDescuentoPorcentaje > 0) {
                const otroDescuento = (precioConDescuento * otroDescuentoPorcentaje) / 100;
                precioConDescuento -= otroDescuento;
            } */
    
            return precioConDescuento;
        } else {
            return precio;
        }
    }

        recalcular(newValue: number, codigo: string) {
            var totald = document.getElementById(`totald_${codigo}`) as HTMLElement;
            var preciod = document.getElementById(`preciod_${codigo}`) as HTMLElement;
        
            if (preciod) { // Validamos si el elemento 'preciod' existe
                var preciod2 = preciod.innerText.replace('USD','').replace('Bs.S','').replace('.', '').replace(',', '.') as any
                totald.innerText=this.formatCurrency((parseFloat(preciod2)*newValue),'USD').toString();
            } else {
                // Aquí podrías agregar un manejo adicional si el elemento no existe,
                // como asignar un valor por defecto a totald o simplemente no hacer nada.
                if (totald) {
                    totald.innerText = this.formatCurrency(0, 'USD').toString(); // Ejemplo de valor por defecto
                }
            }
        
            var totalbs = document.getElementById(`totalbs_${codigo}`) as HTMLElement;
            var preciobs = document.getElementById(`preciobs_${codigo}`) as HTMLElement;
        
            if (preciobs) { // Validamos si el elemento 'preciobs' existe
                var preciobs2 = preciobs.innerText.replace('USD','').replace('Bs.S','').replace('.', '').replace(',', '.') as any
                totalbs.innerText=this.formatCurrency((parseFloat(preciobs2)*newValue),'VES').toString();
            } else {
                // Aquí podrías agregar un manejo adicional si el elemento no existe.
                if (totalbs) {
                    totalbs.innerText = this.formatCurrency(0, 'VES').toString(); // Ejemplo de valor por defecto
                }
            }
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

    totalbscalc = 0;
    totaldcalc = 0;
    ivabscalc = 0;
    ivadcalc = 0;
    descubscalc = 0;
    descudcalc = 0;

    totaliza(idPedido: string, codigo: string, cantidad: number, existen: number) {
        const apiUrl = `${API_URL}totalizacampo`;
        const formData = new FormData();
        const token = this.authService.getToken();

        const headers = new HttpHeaders({
            'X-Auth-Token': `${token}`
        });

        formData.append('id', idPedido);
        formData.append('codigo', codigo);
        formData.append('cantidad', cantidad.toString());
        let aux = 0

        this.http.post(apiUrl, formData, { headers: headers }).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                Swal.close()
                if (response.result == true) {
                    // Actualiza productscar
                    this.revisarCarrito();
                    this.dataSource.data = [...this.productscar];

                    Swal.fire({
                        text: 'Producto Actualizado',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 3000,
                        toast: true,
                        position: 'bottom-end',
                    });
                } else {
                    this.alertaerror();
                }
            },
            error: (error) => {
                this.isLoading = false;
                Swal.close()
                this.alertaerror();
            },
        });
    }



    protected readonly parseFloat = parseFloat;
}


