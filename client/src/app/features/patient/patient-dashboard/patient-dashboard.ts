import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor-service';

@Component({
  selector: 'app-patient-dashboard',
  imports: [CommonModule,RouterLink],
  templateUrl: './patient-dashboard.html',
  styleUrl: './patient-dashboard.scss'
})
export class PatientDashboard implements OnInit {
  doctors: any[] = [];
  loading = true;

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.doctorService.getAllDoctors().subscribe({
      next: (res) => {
        this.doctors = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewDoctor(id: string) {
    this.router.navigate(['/patient/doctor', id]);
  }
}