import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DoctorService } from '../../../core/services/doctor-service';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-dashboard',
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.scss'
})
export class DoctorDashboard implements OnInit {
  loading = true;
  profile: any = null;
  appointments: any[] = [];
  appointmentsLoading = true;
  actionLoadingId: string | null = null;

  constructor(
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private router: Router
  ) { }

  ngOnInit() {
    this.doctorService.getMyProfile().subscribe({
      next: (res) => {
        this.profile = res;
        this.loading = false;
        this.loadAppointments();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          this.router.navigate(['/doctor/complete-profile']);
        }
      }
    });
  }

  loadAppointments() {
    this.appointmentsLoading = true;
    this.appointmentService.getDoctorAppointments().subscribe({
      next: (res) => {
        this.appointments = res;
        this.appointmentsLoading = false;
      },
      error: () => {
        this.appointmentsLoading = false;
      }
    });
  }

  markStatus(id: string, status: string) {
    this.actionLoadingId = id;
    this.appointmentService.updateAppointmentStatus(id, status).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.loadAppointments();
      },
      error: () => {
        this.actionLoadingId = null;
      }
    });
  }

  cancelAppointment(id: string) {
    const reason = prompt('Reason for cancellation (optional):') || '';
    this.actionLoadingId = id;
    this.appointmentService.cancelAppointment(id, reason).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.loadAppointments();
      },
      error: () => {
        this.actionLoadingId = null;
      }
    });
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'confirmed':
        return 'info';

      case 'completed':
        return 'success';

      case 'cancelled':
        return 'danger';

      case 'no-show':
        return 'warn';

      default:
        return 'info';
    }
  }

  isUpcoming(appt: any): boolean {
    return appt.status === 'confirmed';
  }
}