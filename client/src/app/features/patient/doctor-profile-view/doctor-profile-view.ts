import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DoctorService } from '../../../core/services/doctor-service';

@Component({
  selector: 'app-doctor-profile-view',
  imports: [CommonModule, ButtonModule],
  templateUrl: './doctor-profile-view.html',
  styleUrl: './doctor-profile-view.scss'
})
export class DoctorProfileView implements OnInit {
  doctor: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.doctorService.getDoctorById(id).subscribe({
        next: (res) => {
          this.doctor = res;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/patient']);
  }
}