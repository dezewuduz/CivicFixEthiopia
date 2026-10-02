import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportsService } from '../../../core/services/reports';
import { AuthService } from '../../../core/services/auth';
import { ReportListItem, ReportStatus } from '../../../shared/models/models';

@Component({
  selector: 'app-department-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './department-dashboard.html',
  styleUrl: './department-dashboard.css'
})
export class DepartmentDashboard implements OnInit {
  reports = signal<ReportListItem[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  updatingId = signal<number | null>(null);

  ReportStatus = ReportStatus; // expose enum to template

  constructor(
    private reportsService: ReportsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading.set(true);
    this.reportsService.getAll().subscribe({
      next: (data) => {
        this.reports.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load reports.');
        this.isLoading.set(false);
      }
    });
  }

  startWork(report: ReportListItem): void {
    this.changeStatus(report, ReportStatus.InProgress, 'Work started by department officer.');
  }

  markResolved(report: ReportListItem): void {
    this.changeStatus(report, ReportStatus.Resolved, 'Issue resolved.');
  }

  private changeStatus(report: ReportListItem, newStatus: ReportStatus, comment: string): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.updatingId.set(report.id);
    this.reportsService.updateStatus(report.id, newStatus, userId, comment).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.loadReports();
      },
      error: () => {
        this.updatingId.set(null);
        this.errorMessage.set('Failed to update status.');
      }
    });
  }

  statusLabel(status: ReportStatus): string {
    return ReportStatus[status];
  }
}