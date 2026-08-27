import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    InputTextModule, PasswordModule, ButtonModule, SelectModule, MessageModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm: FormGroup;
  errorMessage = '';
  loading = false;

  roles = [
    { label: 'Patient', value: 'patient' },
    { label: 'Doctor', value: 'doctor' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
      role: ['patient', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        const role = res.user.role;
        if (role === 'doctor') this.router.navigate(['/doctor']);
        else this.router.navigate(['/patient']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
}