import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthService } from './auth.service'; 
import { NgxSpinnerModule } from 'ngx-spinner';

//export const API_URL = 'http://insuaminca.proteoerp.org:50080/practica/api/ptprv/post/';
//export const API_URL2 = 'http://insuaminca.proteoerp.org:50080/practica/api/ptprv/';

// ACCESO INTERNO INSUAMINCA
/*export const PROTEO_URL_ALONE = 'http://10.0.100.2/practica/'
export const API_URL = 'http://10.0.100.2/practica/api/ptprv/post/';
export const API_URL2 = 'http://10.0.100.2/practica/api/';
export const PROTEO_URL = 'http://10.0.100.2/practica/api/ptprv/';
export const API_FAST ='http://127.0.0.1:8000';*/

//ACCESO PARA TRABAJAR 
export const PROTEO_URL_ALONE = 'https://insuaminca.org/insuaminca/';
export const API_URL = 'https://insuaminca.org/insuaminca/api/ptprv/post/';
export const API_URL2 = 'https://insuaminca.org/insuaminca/api/ptprv/';
export const PROTEO_URL = 'https://insuaminca.org/insuaminca/api/ptprv/';
export const API_FAST ='http://3.143.124.47:5000';

// ACCESO FTP EXTERNO
export const PROTEO_URL_ALONEINTER = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/';
export const API_URLINTER = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/api/ptprv/post/';
export const API_URL2INTER = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/api/ptprv/';
export const PROTEO_URLINTER = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/api/ptprv/';

//Reportes
export const PROTEO_URL_ALONEREPO = 'https://insuaminca.org/enlinea/';
export const API_URLREPO = 'https://insuaminca.org/enlinea/api/ptprv/post/';
export const API_URL2REPO = 'https://insuaminca.org/enlinea/api/ptprv/';
export const PROTEO_URLREPO = 'https://insuaminca.org/enlinea/api/ptprv/';



//ACCESO TODO DESDE EL FTP
/* export const PROTEO_URL_ALONE = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/';
export const API_URL = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/api/ptprv/post/';
export const API_URL2 = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/api/ptprv/';
export const PROTEO_URL = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/api/ptprv/';
export const API_FAST ='http://3.143.124.47:5000';

export const PROTEO_URL_ALONEINTER = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/';
export const API_URLINTER = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/api/ptprv/post/';
export const API_URL2INTER = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/api/ptprv/';
export const PROTEO_URLINTER = 'https://d2wnvkodoh477y.cloudfront.net/proteoerp/api/ptprv/';
export const API_FASTINTER ='http://3.143.124.47:5000'; */

//////ACCESO TODO DESDE PRACTICA
/* export const PROTEO_URL_ALONE = 'https://d2wnvkodoh477y.cloudfront.net/practica/';
export const API_URL = 'https://d2wnvkodoh477y.cloudfront.net/practica/api/ptprv/post/';
export const API_URL2 = 'https://d2wnvkodoh477y.cloudfront.net/practica/api/ptprv/';
export const PROTEO_URL = 'https://d2wnvkodoh477y.cloudfront.net/practica/api/ptprv/';
export const API_FAST ='http://3.143.124.47:5000';

export const PROTEO_URL_ALONEINTER = 'https://d2wnvkodoh477y.cloudfront.net/practica/';
export const API_URLINTER = 'https://d2wnvkodoh477y.cloudfront.net/practica/api/ptprv/post/';
export const API_URL2INTER = 'https://d2wnvkodoh477y.cloudfront.net/practica/api/ptprv/';
export const PROTEO_URLINTER = 'https://d2wnvkodoh477y.cloudfront.net/practica/api/ptprv/';
export const API_FASTINTER ='http://3.143.124.47:5000';  */

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(NgxSpinnerModule),
  ]
};
