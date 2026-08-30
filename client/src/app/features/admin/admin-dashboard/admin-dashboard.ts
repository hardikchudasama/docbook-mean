import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, TableModule, TagModule, ButtonModule, InputTextModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  @ViewChild('doctorTable') doctorTable!: Table;
  @ViewChild('userTable') userTable!: Table;
  @ViewChild('apptTable') apptTable!: Table;

  stats: any = null;
  statsLoading = true;

  activeTab: 'doctors' | 'users' | 'appointments' = 'doctors';

  doctors: any[] = [];
  users: any[] = [];
  appointments: any[] = [];
  tableLoading = true;

  actionLoadingId: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStats();
    this.loadDoctors();
  }

  loadStats() {
    this.statsLoading = true;
    this.adminService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.statsLoading = false;
      },
      error: () => {
        this.statsLoading = false;
      }
    });
  }

  setTab(tab: 'doctors' | 'users' | 'appointments') {
    this.activeTab = tab;
    if (tab === 'doctors' && this.doctors.length === 0) this.loadDoctors();
    if (tab === 'users' && this.users.length === 0) this.loadUsers();
    if (tab === 'appointments' && this.appointments.length === 0) this.loadAppointments();
  }

  loadDoctors() {
    this.tableLoading = true;
    this.adminService.getAllDoctors().subscribe({
      next: (res) => {
        this.doctors = res;
        this.tableLoading = false;
      },
      error: () => { this.tableLoading = false; }
    });
  }

  loadUsers() {
    this.tableLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.tableLoading = false;
      },
      error: () => { this.tableLoading = false; }
    });
  }

  loadAppointments() {
    this.tableLoading = true;
    this.adminService.getAllAppointments().subscribe({
      next: (res) => {
        this.appointments = res;
        this.tableLoading = false;
      },
      error: () => { this.tableLoading = false; }
    });
  }

  toggleUserStatus(id: string) {
    this.actionLoadingId = id;
    this.adminService.toggleUserStatus(id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.loadUsers();
      },
      error: () => { this.actionLoadingId = null; }
    });
  }

  deleteDoctor(id: string) {
    const confirmed = confirm('Remove this doctor? This cannot be undone.');
    if (!confirmed) return;

    this.actionLoadingId = id;
    this.adminService.deleteDoctor(id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.loadDoctors();
      },
      error: () => { this.actionLoadingId = null; }
    });
  }

  getSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    switch (status) {
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'no-show': return 'warn';
      default: return 'info';
    }
  }

  onGlobalFilter(event: Event, table: Table) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  onStatusFilter(event: Event, table: Table) {
    const value = (event.target as HTMLSelectElement).value;
    table.filter(value, 'status', 'equals');
  }

  onRoleFilter(event: Event, table: Table) {
    const value = (event.target as HTMLSelectElement).value;
    table.filter(value, 'role', 'equals');
  }
}