import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  UserService,
  OfficerListItem
} from '../../../core/services/user';

import { DepartmentsService } from '../../../core/services/departments';
import { Department } from '../../../shared/models/models';

@Component({
  selector: 'app-officer-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './officer-manage.html',
  styleUrl: './officer-manage.css'
})
export class OfficerManage implements OnInit {

  officers = signal<OfficerListItem[]>([]);
  departments = signal<Department[]>([]);

  isLoading = signal(true);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  showForm = signal(false);

  // =========================
  // EDIT MODE
  // =========================

  editingOfficerId: number | null = null;

  // =========================
  // FORM
  // =========================

  formFullName = '';
  formEmail = '';
  formPassword = '';
  formPhoneNumber = '';
  formDepartmentId: number | null = null;

  constructor(
    private userService: UserService,
    private departmentsService: DepartmentsService
  ) {}

  ngOnInit(): void {
    this.loadOfficers();

    this.departmentsService.getAll(true).subscribe({
      next: (data) => {
        this.departments.set(data);
      },
      error: () => {
        this.errorMessage.set('Failed to load departments.');
      }
    });
  }

  // =========================
  // LOAD OFFICERS
  // =========================

  loadOfficers(): void {
    this.isLoading.set(true);

    this.userService.getOfficers().subscribe({
      next: (data) => {
        this.officers.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load officers.');
        this.isLoading.set(false);
      }
    });
  }

  // =========================
  // CREATE FORM
  // =========================

  openCreateForm(): void {

    this.editingOfficerId = null;

    this.formFullName = '';
    this.formEmail = '';
    this.formPassword = '';
    this.formPhoneNumber = '';
    this.formDepartmentId = null;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.showForm.set(true);
  }

  // =========================
  // EDIT FORM
  // =========================

  openEditForm(officer: OfficerListItem): void {

    this.editingOfficerId = officer.id;

    this.formFullName = officer.fullName;
    this.formEmail = officer.email;
    this.formPhoneNumber = '';

    this.formPassword = '';

    this.formDepartmentId = officer.departmentId;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.showForm.set(true);
  }

  // =========================
  // CANCEL
  // =========================

  cancelForm(): void {

    this.showForm.set(false);

    this.editingOfficerId = null;
  }

  // =========================
  // SAVE OFFICER
  // =========================

  saveOfficer(): void {

    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.formDepartmentId) {

      this.errorMessage.set(
        'Please select a department.'
      );

      return;
    }

    // =========================
    // EDIT EXISTING OFFICER
    // =========================

    if (this.editingOfficerId !== null) {

      this.userService.updateOfficer(
        this.editingOfficerId,
        {
          fullName: this.formFullName,
          email: this.formEmail,
          phoneNumber: this.formPhoneNumber || undefined,
          departmentId: this.formDepartmentId
        }
      ).subscribe({

        next: () => {

          this.successMessage.set(
            'Officer updated successfully.'
          );

          this.showForm.set(false);

          this.editingOfficerId = null;

          this.loadOfficers();
        },

        error: (err) => {

          this.errorMessage.set(
            err.error ?? 'Failed to update officer.'
          );

        }

      });

      return;
    }

    // =========================
    // CREATE NEW OFFICER
    // =========================

    if (!this.formPassword) {

      this.errorMessage.set(
        'Please enter a password.'
      );

      return;
    }

    this.userService.createOfficer({

      fullName: this.formFullName,

      email: this.formEmail,

      password: this.formPassword,

      departmentId: this.formDepartmentId,

      phoneNumber: this.formPhoneNumber || undefined

    }).subscribe({

      next: () => {

        this.successMessage.set(
          'Officer account created.'
        );

        this.showForm.set(false);

        this.loadOfficers();
      },

      error: (err) => {

        this.errorMessage.set(
          err.error ?? 'Failed to create officer.'
        );

      }

    });
  }

  // =========================
  // DEACTIVATE OFFICER
  // =========================

  deactivateOfficer(officer: OfficerListItem): void {

    const confirmed = confirm(
      `Are you sure you want to deactivate ${officer.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.userService.deactivateOfficer(
      officer.id
    ).subscribe({

      next: () => {

        this.successMessage.set(
          `${officer.fullName} has been deactivated.`
        );

        this.loadOfficers();
      },

      error: (err) => {

        this.errorMessage.set(
          err.error ?? 'Failed to deactivate officer.'
        );

      }

    });
  }
}