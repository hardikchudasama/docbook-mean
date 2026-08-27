import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DoctorService } from '../../../core/services/doctor-service';

@Component({
  selector: 'app-complete-profile',
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, TextareaModule, ButtonModule, MessageModule
  ],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.scss'
})
export class CompleteProfile {
  profileForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      specialty: ['', Validators.required],
      qualification: ['', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]],
      consultationFee: [0, [Validators.required, Validators.min(0)]],
      bio: ['']
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.doctorService.completeProfile(this.profileForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/doctor']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to save profile';
      }
    });
  }
}