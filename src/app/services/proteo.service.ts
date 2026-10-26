import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {PROTEO_URL} from "../app.config";
import {PROTEO_URLINTER} from "../app.config";

import {AuthService} from "../auth.service";

@Injectable({
  providedIn: 'root'
})
export class ProteoService {
  apiUrl = PROTEO_URL;
  apiUrl2 = PROTEO_URLINTER;

  constructor(
      private httpClient: HttpClient,
      public authService: AuthService,
  ) { }


  //Para obtener los pedidos del formato
  get_document_by_group(grupo: string) : Observable<Blob> {
    const info =  {'cmatriz': grupo}
    const formData = new FormData();
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl2 = this.apiUrl + `post/getfile`;
    return this.httpClient.post(apiUrl2, info, { headers: headers, responseType: 'blob', })
  }

  //Para obtener los clientes por grupo de casas matriz
  get_clients_by_group(): Observable<any> {
    const token = this.authService.getToken();
    const formData = new FormData();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = this.apiUrl + `get/cmatriz`;
    return this.httpClient.post(apiUrl,formData, {headers: headers})
  }


  // Para obtener los clientes individuales
  get_clients(): Observable<any> {
    const token = this.authService.getToken();
    const formData = new FormData();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = this.apiUrl + `post/bdscli`;
    return this.httpClient.post(apiUrl,formData, {headers: headers})
  }

  //Para enviar mutilples pedido por excel
  generate_ped_multi(info: any): Observable<any> {
    const token = this.authService.getToken();
    const formData = new FormData();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = this.apiUrl + `post/multiped`;
    return this.httpClient.post(apiUrl, info, {headers: headers})
  }


  //Para enviar pedido por excel sencillo
  generate_ped_simple(info: any): Observable<any> {
    const token = this.authService.getToken();
    const formData = new FormData();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = this.apiUrl + `post/listape`;
    return this.httpClient.post(apiUrl, info, {headers: headers})
  }


  //Para obtener el excel de pedido sencillo
  get_file_simple(cliente: any) : Observable<Blob> {
    const info =  {'cliente': cliente}
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });
    const apiUrl2 = this.apiUrl + `post/simplefile`;
    return this.httpClient.post(apiUrl2, info, { headers: headers, responseType: 'blob', })
  }

  get_client_data(cliente: any) : Observable<any> {
    const info = {"codCli": cliente}
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = this.apiUrl + `post/buscaalmacen`;
    return this.httpClient.post(apiUrl, info, { headers: headers })
  }

}
