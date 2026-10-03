import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5075/api/users';

export interface OfficerListItem {
  id: number;
  fullName: string;
  email: string;
  departmentId: number | null;
  departmentName?: string;
  isActive: boolean;
}

export interface CreateOfficerRequest {
  fullName: string;
  email: string;
  password: string;
  departmentId: number;
  phoneNumber?: string;
}

export interface UpdateOfficerRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  departmentId: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getOfficers(): Observable<OfficerListItem[]> {
    return this.http.get<OfficerListItem[]>(`${API_URL}/officers`);
  }

  createOfficer(request: CreateOfficerRequest): Observable<OfficerListItem> {
    return this.http.post<OfficerListItem>(
      `${API_URL}/create-officer`,
      request
    );
  }

  updateOfficer(
    id: number,
    request: UpdateOfficerRequest
  ): Observable<OfficerListItem> {
    return this.http.put<OfficerListItem>(
      `${API_URL}/${id}`,
      request
    );
  }

  deactivateOfficer(id: number): Observable<any> {
    return this.http.put(
      `${API_URL}/${id}/deactivate`,
      {}
    );
  }
}