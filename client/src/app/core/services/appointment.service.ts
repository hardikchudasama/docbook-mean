import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) { }

  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  cancelAppointment(id: string, reason?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancel`, { reason });
  }
  getMyAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my`);
  }

  getDoctorAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctor/my`);
  }

  updateAppointmentStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }
}