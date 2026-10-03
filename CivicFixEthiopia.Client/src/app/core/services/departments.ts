import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../../shared/models/models';

const API_URL = 'http://localhost:5075/api/departments';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  constructor(private http: HttpClient) {}

  getAll(activeOnly: boolean = false): Observable<Department[]> {
    return this.http.get<Department[]>(`${API_URL}?activeOnly=${activeOnly}`);
  }

  create(department: { name: string; description?: string; contactPhone?: string; email?: string }): Observable<Department> {
    return this.http.post<Department>(API_URL, department);
  }

  update(id: number, department: Department): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}`, department);
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}