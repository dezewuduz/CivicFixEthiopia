import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse, UserRole } from '../../shared/models/models';

const API_URL = 'http://localhost:5075/api/users';
const TOKEN_KEY = 'civicfix_token';
const USER_KEY = 'civicfix_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<LoginResponse | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): LoginResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res));
        this.currentUser.set(res);
      })
    );
  }

  register(fullName: string, email: string, password: string, phoneNumber?: string): Observable<any> {
    return this.http.post(`${API_URL}/register`, { fullName, email, password, phoneNumber });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this.currentUser();
    return !!user && roles.includes(user.role);
  }
}