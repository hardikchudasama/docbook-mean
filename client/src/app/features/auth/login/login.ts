import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    InputTextModule, PasswordModule, ButtonModule, MessageModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        const role = res.user.role;
        if (role === 'admin') this.router.navigate(['/admin']);
        else if (role === 'doctor') this.router.navigate(['/doctor']);
        else this.router.navigate(['/patient']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed';
      }
    });
  }
}