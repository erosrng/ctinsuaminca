import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CarritoPageComponent } from './pages/carrito-page/carrito-page.component';
import { MiperfilPageComponent } from './pages/miperfil-page/miperfil-page.component';
import { PedidosPageComponent } from './pages/pedidos-page/pedidos-page.component';
import { TomaexcelPageComponent } from './pages/tomaexcel-page/tomaexcel-page.component';
import { PagosPageComponent } from './pages/pagos-page/pagos-page.component';
import { HistorialpedComponent } from "./components/historialped/historialped.component";


import { authGuard } from './auth.guard';
import { AdminHomeComponent } from './pages/admin-pages/admin-home/admin-home.component';
import { AdminPedidosVendedorComponent } from './pages/admin-pages/admin-pedidos-vendedor/admin-pedidos-vendedor.component';
import { AdminRetencionesComponent } from './pages/admin-pages/admin-retenciones/admin-retenciones.component';
import { HistorialPedidosComponent } from './pages/historial-pedidos/historial-pedidos.component';
import {UploadPedidosComponent} from "./pages/upload-pedidos/upload-pedidos.component";
import {ResumenClienteComponent} from "./pages/resumen-cliente/resumen-cliente.component";

export const routes: Routes = [
    { path: '', component: LoginPageComponent},
    { path: 'login', component: LoginPageComponent }, 
    { path: 'home', component: HomePageComponent, canActivate: [authGuard] },
    { path: 'carrito', component: CarritoPageComponent, canActivate: [authGuard] },
    { path: 'miperfil', component: MiperfilPageComponent, canActivate: [authGuard] },
    { path: 'pedidos', component: PedidosPageComponent, canActivate: [authGuard] },
    { path: 'tomaexcel', component: TomaexcelPageComponent, canActivate: [authGuard] },
    { path: 'pagos', component: PagosPageComponent, canActivate: [authGuard] },
    { path: 'historialped', component: HistorialPedidosComponent, canActivate: [authGuard] },
    { path: 'admin', component: AdminHomeComponent, canActivate: [authGuard] },
    { path: 'admin/pedidos', component: AdminPedidosVendedorComponent, canActivate: [authGuard] },
    { path: 'admin/retenciones', component: AdminRetencionesComponent, canActivate: [authGuard] },
    { path: 'cargar-pedidos', component: UploadPedidosComponent, canActivate: [authGuard]},
    { path: 'resumen-cliente', component: ResumenClienteComponent}
];