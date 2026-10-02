import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReportsService } from '../../../core/services/reports';
import { ReportDetail as ReportDetailModel, ReportStatus, StatusHistoryItem } from '../../../shared/models/models';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report-detail.html',
  styleUrl: './report-detail.css'
})
export class ReportDetail implements OnInit {
  report = signal<ReportDetailModel | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ReportStatus = ReportStatus;

  // mockup Screen 5 ላይ ያለውን 4-ደረጃ timeline (Rejected ሲሆን አንድ ተጨማሪ ደረጃ ነው)
  timelineSteps = [
    ReportStatus.Submitted,
    ReportStatus.Verified,
    ReportStatus.Assigned,
    ReportStatus.InProgress,
    ReportStatus.Resolved
  ];

  constructor(private route: ActivatedRoute, private reportsService: ReportsService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reportsService.getById(id).subscribe({
      next: (data) => {
        this.report.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Report not found.');
        this.isLoading.set(false);
      }
    });
  }

  statusLabel(status: ReportStatus): string {
    return ReportStatus[status].replace(/([A-Z])/g, ' $1').trim();
  }

  // timeline step 
  isStepDone(step: ReportStatus): boolean {
    const current = this.report()?.status;
    if (current === undefined) return false;
    if (current === ReportStatus.Rejected) return step === ReportStatus.Submitted;
    return step <= current;
  }

  isStepActive(step: ReportStatus): boolean {
    return this.report()?.status === step;
  }

  historyForStep(step: ReportStatus): StatusHistoryItem | undefined {
    return this.report()?.statusHistory.find(h => h.newStatus === step);
  }
}