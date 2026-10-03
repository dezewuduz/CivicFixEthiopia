import { Routes } from '@angular/router';

import { Home } from './features/home/home';

import { Login } from './features/auth/login/login';

import { Register } from './features/auth/register/register';

import { Dashboard } from './features/citizen-dashboard/dashboard/dashboard';

import { ReportForm } from './features/reports/report-form/report-form';

import { ReportDetail } from './features/reports/report-detail/report-detail';

import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';

import { OfficerManage } from './features/admin/officer-manage/officer-manage';

import { DepartmentDashboard } from './features/departments/department-dashboard/department-dashboard';

import { DepartmentManage } from './features/departments/department-manage/department-manage';

import { roleGuard } from './core/guards/role-guard';

import { UserRole } from './shared/models/models';

export const routes: Routes = [

  // Home page
  { path: '', component: Home },

  // Authentication
  { path: 'login', component: Login },

  { path: 'register', component: Register },

  // Citizen
  { path: 'dashboard', component: Dashboard },

  { path: 'reports/new', component: ReportForm },

  { path: 'reports/:id', component: ReportDetail },

  // Administrator
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [roleGuard(UserRole.Administrator)]
  },

  {
    path: 'admin/departments',
    component: DepartmentManage,
    canActivate: [roleGuard(UserRole.Administrator)]
  },

  {
    path: 'admin/officers',
    component: OfficerManage,
    canActivate: [roleGuard(UserRole.Administrator)]
  },

  // Department Officer
  {
    path: 'department',
    component: DepartmentDashboard,
    canActivate: [roleGuard(UserRole.DepartmentOfficer)]
  }

];