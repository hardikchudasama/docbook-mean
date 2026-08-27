import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DoctorService } from '../../../core/services/doctor-service';

@Component({
  selector: 'app-doctor-profile-view',
  imports: [CommonModule, FormsModule, ButtonModule, DatePickerModule],
  templateUrl: './doctor-profile-view.html',
  styleUrl: './doctor-profile-view.scss'
})
export class DoctorProfileView implements OnInit {
  doctor: any = null;
  loading = true;
  doctorId = '';

  selectedDate: Date | null = null;
  minDate = new Date(); // can't book in the past
  slots: string[] = [];
  slotsLoading = false;
  selectedSlot: string | null = null;
  noSlotsMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {
    this.doctorId = this.route.snapshot.paramMap.get('id') || '';
    if (this.doctorId) {
      this.doctorService.getDoctorById(this.doctorId).subscribe({
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

  onDateSelect() {
    if (!this.selectedDate) return;

    this.slotsLoading = true;
    this.selectedSlot = null;
    this.noSlotsMessage = '';

    const dateStr = this.formatDate(this.selectedDate);

    this.doctorService.getAvailableSlots(this.doctorId, dateStr).subscribe({
      next: (res) => {
        this.slots = res.slots;
        this.slotsLoading = false;
        if (this.slots.length === 0) {
          this.noSlotsMessage = res.message || 'No slots available on this date';
        }
      },
      error: () => {
        this.slotsLoading = false;
        this.noSlotsMessage = 'Failed to load slots';
      }
    });
  }

  selectSlot(slot: string) {
    this.selectedSlot = slot;
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  goBack() {
    this.router.navigate(['/patient']);
  }

  bookAppointment() {
    // We'll wire this to the real booking API in Day 8-10
    console.log('Booking:', this.doctorId, this.formatDate(this.selectedDate!), this.selectedSlot);
  }
}