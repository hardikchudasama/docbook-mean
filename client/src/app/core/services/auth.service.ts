import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap(res => this.setSession(res)));
  }

  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data)
      .pipe(tap(res => this.setSession(res)));
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}