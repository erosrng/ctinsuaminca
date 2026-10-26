import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ACCESS_PERMISSIONS, AccessPermissions } from './access.config';
import { AuthService } from './auth.service';

function permissionGuard(permission: keyof AccessPermissions): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const permissions = ACCESS_PERMISSIONS[authService.getAccessRole()];

    if (permissions[permission]) {
      return true;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Acceso restringido',
      text: 'No tienes permisos para acceder a este módulo.',
      confirmButtonText: 'Ir al inicio',
      allowOutsideClick: false,
    });

    return router.createUrlTree(['/home']);
  };
}

export const salesGuard = permissionGuard('ventas');
export const reportsGuard = permissionGuard('reportes');
export const adminGuard = permissionGuard('admin');
export const adminSummaryGuard = permissionGuard('adminSummary');
