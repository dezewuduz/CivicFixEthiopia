import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportListItem, ReportDetail, CreateReportRequest } from '../../shared/models/models';

const API_URL = 'http://localhost:5075/api/reports';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ReportListItem[]> {
    return this.http.get<ReportListItem[]>(API_URL);
  }

  getById(id: number): Observable<ReportDetail> {
    return this.http.get<ReportDetail>(`${API_URL}/${id}`);
  }

  create(request: CreateReportRequest): Observable<ReportDetail> {
    return this.http.post<ReportDetail>(API_URL, request);
  }

  verify(id: number, approved: boolean, changedByUserId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/verify`, { approved, changedByUserId });
  }

  assign(id: number, departmentId: number, changedByUserId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/assign`, { departmentId, changedByUserId });
  }
  updateStatus(id: number, newStatus: number, changedByUserId: number, comment?: string): Observable<void> {
  return this.http.put<void>(`${API_URL}/${id}/status`, { newStatus, changedByUserId, comment });
}
}