import { AccessRole } from './auth.service';

export interface AccessPermissions {
  ventas: boolean;
  reportes: boolean;
  admin: boolean;
  adminSummary: boolean;
  masterReport: boolean;
}

/*
 * Matriz de accesos por perfil.
 * Modifica aquí si necesitas asignar o quitar módulos a un perfil.
 */
export const ACCESS_PERMISSIONS: Record<AccessRole, AccessPermissions> = {
  SUPERPROV: {
    ventas: true,
    reportes: true,
    admin: true,
    adminSummary: true,
    masterReport: true,
  },
  MASTERPROV: {
    ventas: true,
    reportes: true,
    admin: false,
    adminSummary: true,
    masterReport: true,
  },
  VENTAS: {
    ventas: true,
    reportes: true,
    admin: false,
    adminSummary: true,
    masterReport: true,
  },
  ADMINPROV: {
    ventas: false,
    reportes: false,
    admin: true,
    adminSummary: false,
    masterReport: false,
  },
  VENDEDOR: {
    ventas: true,
    reportes: true,
    admin: false,
    adminSummary: false,
    masterReport: false,
  },
};
