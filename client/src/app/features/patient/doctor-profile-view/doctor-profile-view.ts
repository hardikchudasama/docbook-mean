import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DoctorService } from '../../../core/services/doctor-service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MessageModule } from 'primeng/message';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-doctor-profile-view',
  imports: [CommonModule, FormsModule, ButtonModule, DatePickerModule, MessageModule],
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

  booking = false;
  bookingError = '';
  bookingSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private socketService: SocketService
  ) { }

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

    // Listen for real-time slot updates
    this.socketService.onSlotBooked((data) => {
    // Skip if this event was triggered by my own booking
    if (data.emittedBy === this.socketService.getSocketId()) return;

    if (data.doctorId === this.doctorId && this.selectedDate && this.formatDate(this.selectedDate) === data.date) {
      this.slots = this.slots.filter(s => s !== data.timeSlot);
      if (this.selectedSlot === data.timeSlot) {
        this.selectedSlot = null;
        this.bookingError = 'This slot was just booked by someone else. Please choose another.';
      }
    }
  });

    this.socketService.onSlotCancelled((data) => {
      if (data.doctorId === this.doctorId && this.selectedDate && this.formatDate(this.selectedDate) === data.date) {
        if (!this.slots.includes(data.timeSlot)) {
          this.slots = [...this.slots, data.timeSlot].sort();
        }
      }
    });
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

  // replace the bookAppointment method:
  bookAppointment() {
  if (!this.selectedDate || !this.selectedSlot) return;

  this.booking = true;
  this.bookingError = '';

  const payload = {
    doctorId: this.doctorId,
    date: this.formatDate(this.selectedDate),
    timeSlot: this.selectedSlot,
    reason: 'General consultation',
    socketId: this.socketService.getSocketId()  // add this
  };

  this.appointmentService.bookAppointment(payload).subscribe({
    next: () => {
      this.booking = false;
      this.bookingSuccess = true;
      this.onDateSelect();
      this.selectedSlot = null;
    },
    error: (err) => {
      this.booking = false;
      this.bookingError = err.error?.message || 'Booking failed. Please try again.';
      if (err.status === 409) {
        this.onDateSelect();
        this.selectedSlot = null;
      }
    }
  });
}
}