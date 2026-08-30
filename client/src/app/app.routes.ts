import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { PatientDashboard } from './features/patient/patient-dashboard/patient-dashboard';
import { DoctorDashboard } from './features/doctor/doctor-dashboard/doctor-dashboard';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { CompleteProfile } from './features/doctor/complete-profile/complete-profile';
import { DoctorProfileView } from './features/patient/doctor-profile-view/doctor-profile-view';
import { MyAppointments } from './features/patient/my-appointments/my-appointments';
import { Layout } from './shared/layout/layout';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'doctor/complete-profile', component: CompleteProfile },

  {
    path: '',
    component: Layout,
    children: [
      { path: 'patient', component: PatientDashboard },
      { path: 'patient/doctor/:id', component: DoctorProfileView },
      { path: 'patient/appointments', component: MyAppointments },
      { path: 'doctor', component: DoctorDashboard },
      { path: 'admin', component: AdminDashboard },
    ]
  }
];