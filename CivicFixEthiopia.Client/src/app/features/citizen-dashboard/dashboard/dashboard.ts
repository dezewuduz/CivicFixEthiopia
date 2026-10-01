import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth';
@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  constructor(public authService:AuthService){}
}
