import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-my-appointments',
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.scss'
})
export class MyAppointments implements OnInit {
  appointments: any[] = [];
  loading = true;
  actionLoadingId: string | null = null;
  filter: 'all' | 'upcoming' | 'past' = 'upcoming';

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getMyAppointments().subscribe({
      next: (res) => {
        this.appointments = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredAppointments() {
    if (this.filter === 'upcoming') {
      return this.appointments.filter(a => a.status === 'confirmed');
    }
    if (this.filter === 'past') {
      return this.appointments.filter(a => a.status !== 'confirmed');
    }
    return this.appointments;
  }

  setFilter(f: 'all' | 'upcoming' | 'past') {
    this.filter = f;
  }

  cancelAppointment(id: string) {
    const confirmed = confirm('Are you sure you want to cancel this appointment?');
    if (!confirmed) return;

    this.actionLoadingId = id;
    this.appointmentService.cancelAppointment(id).subscribe({
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

  canCancel(appt: any): boolean {
    return appt.status === 'confirmed';
  }
}