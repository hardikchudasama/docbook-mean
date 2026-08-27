import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor-service';

@Component({
  selector: 'app-doctor-dashboard',
  imports: [CommonModule],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.scss'
})
export class DoctorDashboard implements OnInit {
  loading = true;
  profile: any = null;

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.doctorService.getMyProfile().subscribe({
      next: (res) => {
        this.profile = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          this.router.navigate(['/doctor/complete-profile']);
        }
      }
    });
  }
}