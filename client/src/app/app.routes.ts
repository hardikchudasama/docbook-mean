import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { PatientDashboard } from './features/patient/patient-dashboard/patient-dashboard';
import { DoctorDashboard } from './features/doctor/doctor-dashboard/doctor-dashboard';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { CompleteProfile } from './features/doctor/complete-profile/complete-profile';
import { DoctorProfileView } from './features/patient/doctor-profile-view/doctor-profile-view';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'patient', component: PatientDashboard },
  { path: 'doctor', component: DoctorDashboard },
  { path: 'admin', component: AdminDashboard },
  { path: 'doctor/complete-profile', component: CompleteProfile },
  { path: 'patient/doctor/:id', component: DoctorProfileView }, // we'll create this next
];