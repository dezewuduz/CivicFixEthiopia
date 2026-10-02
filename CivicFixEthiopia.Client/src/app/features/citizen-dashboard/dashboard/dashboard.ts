import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ReportsService } from '../../../core/services/reports';
import { ReportListItem, ReportStatus } from '../../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  reports = signal<ReportListItem[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ReportStatus = ReportStatus; // template ውስጥ ለመጠቀም

  totalCount = computed(() => this.reports().length);
  pendingCount = computed(() =>
    this.reports().filter(r => r.status === ReportStatus.Submitted || r.status === ReportStatus.Verified).length
  );
  inProgressCount = computed(() =>
    this.reports().filter(r => r.status === ReportStatus.Assigned || r.status === ReportStatus.InProgress).length
  );
  resolvedCount = computed(() =>
    this.reports().filter(r => r.status === ReportStatus.Resolved).length
  );

  recentReports = computed(() =>
    [...this.reports()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  constructor(public authService: AuthService, private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.reportsService.getAll().subscribe({
      next: (data) => {
        this.reports.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load reports. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  statusLabel(status: ReportStatus): string {
    return ReportStatus[status]
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }

  statusClass(status: ReportStatus): string {
    switch (status) {
      case ReportStatus.Submitted:
      case ReportStatus.Verified:
        return 'badge-pending';
      case ReportStatus.Assigned:
      case ReportStatus.InProgress:
        return 'badge-progress';
      case ReportStatus.Resolved:
        return 'badge-resolved';
      case ReportStatus.Rejected:
        return 'badge-rejected';
      default:
        return '';
    }
  }
}