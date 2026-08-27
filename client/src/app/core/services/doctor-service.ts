import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  // Doctor completes their profile
  completeProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile`, data);
  }

  // Check if logged-in doctor has a profile
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/me`);
  }

  // Update doctor's own profile
  updateMyProfile(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/profile/me`, data);
  }

  // Public: get all doctors (for patient search)
  getAllDoctors(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { params });
  }

  // Public: get single doctor by id
  getDoctorById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}