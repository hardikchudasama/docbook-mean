import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getAllUsers(role?: string): Observable<any> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  toggleUserStatus(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/toggle-status`, {});
  }

  getAllDoctors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors`);
  }

  deleteDoctor(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/doctors/${id}`);
  }

  getAllAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments`);
  }
}