import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ReportsService } from '../../../core/services/reports';
import { HttpClient } from '@angular/common/http';
import { ReportListItem, ReportStatus, Department } from '../../../shared/models/models';

const DEPARTMENTS_URL = 'http://localhost:5075/api/departments';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './admin-dashboard.css',
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
  reports = signal<ReportListItem[]>([]);
  departments = signal<Department[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  actionMessage = signal<string | null>(null);

  ReportStatus = ReportStatus;

  // ለእያንዳንዱ ሪፖርት የተመረጠ department (assign ለማድረግ)
  selectedDepartmentId = new Map<number, number>();

  totalCount = computed(() => this.reports().length);
  pendingCount = computed(() => this.reports().filter(r => r.status === ReportStatus.Submitted).length);
  inProgressCount = computed(() =>
    this.reports().filter(r => r.status === ReportStatus.Assigned || r.status === ReportStatus.InProgress).length
  );
  resolvedCount = computed(() => this.reports().filter(r => r.status === ReportStatus.Resolved).length);

  constructor(
    public authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadReports();
    this.http.get<Department[]>(DEPARTMENTS_URL).subscribe({
      next: (data) => this.departments.set(data)
    });
  }

  loadReports(): void {
    this.isLoading.set(true);
    this.reportsService.getAll().subscribe({
      next: (data) => {
        this.reports.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load reports.');
        this.isLoading.set(false);
      }
    });
  }

  statusLabel(status: ReportStatus): string {
    return ReportStatus[status].replace(/([A-Z])/g, ' $1').trim();
  }

  statusClass(status: ReportStatus): string {
    switch (status) {
      case ReportStatus.Submitted: return 'badge-pending';
      case ReportStatus.Verified: return 'badge-verified';
      case ReportStatus.Assigned:
      case ReportStatus.InProgress: return 'badge-progress';
      case ReportStatus.Resolved: return 'badge-resolved';
      case ReportStatus.Rejected: return 'badge-rejected';
      default: return '';
    }
  }

  verify(reportId: number, approve: boolean): void {
    this.actionMessage.set(null);
    this.errorMessage.set(null);
    const userId = this.authService.currentUser()?.id ?? 0;
    this.reportsService.verify(reportId, approve, userId).subscribe({
      next: () => {
        this.actionMessage.set(approve ? 'Report verified.' : 'Report rejected.');
        this.loadReports();
      },
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Action failed.')
    });
  }

  assign(reportId: number): void {
    const departmentId = this.selectedDepartmentId.get(reportId);
    if (!departmentId) {
      this.errorMessage.set('Please select a department first.');
      return;
    }
    this.actionMessage.set(null);
    this.errorMessage.set(null);
    const userId = this.authService.currentUser()?.id ?? 0;
    this.reportsService.assign(reportId, departmentId, userId).subscribe({
      next: () => {
        this.actionMessage.set('Report assigned to department.');
        this.loadReports();
      },
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Action failed.')
    });
  }

  onDepartmentSelect(reportId: number, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedDepartmentId.set(reportId, Number(value));
  }
}