import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DepartmentsService } from '../../../core/services/departments';
import { Department } from '../../../shared/models/models';

@Component({
  selector: 'app-department-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './department-manage.html',
  styleUrl: './department-manage.css'
})
export class DepartmentManage implements OnInit {
  departments = signal<Department[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // form state — null means "not editing/creating"
  showForm = signal(false);
  editingId = signal<number | null>(null);

  formName = '';
  formDescription = '';
  formContactPhone = '';
  formEmail = '';

  constructor(private departmentsService: DepartmentsService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.isLoading.set(true);
    this.departmentsService.getAll(false).subscribe({
      next: (data) => {
        this.departments.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load departments.');
        this.isLoading.set(false);
      }
    });
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.formName = '';
    this.formDescription = '';
    this.formContactPhone = '';
    this.formEmail = '';
    this.showForm.set(true);
  }

  openEditForm(dept: Department): void {
    this.editingId.set(dept.id);
    this.formName = dept.name;
    this.formDescription = dept.description ?? '';
    this.formContactPhone = dept.contactPhone ?? '';
    this.formEmail = dept.email ?? '';
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveDepartment(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      name: this.formName,
      description: this.formDescription || undefined,
      contactPhone: this.formContactPhone || undefined,
      email: this.formEmail || undefined
    };

    const editId = this.editingId();

    if (editId) {
      // Update needs the full Department shape including isActive/createdAt/id
      const existing = this.departments().find(d => d.id === editId);
      if (!existing) return;

      const updated: Department = { ...existing, ...payload };
      this.departmentsService.update(editId, updated).subscribe({
        next: () => {
          this.successMessage.set('Department updated.');
          this.showForm.set(false);
          this.loadDepartments();
        },
        error: () => this.errorMessage.set('Failed to update department.')
      });
    } else {
      this.departmentsService.create(payload).subscribe({
        next: () => {
          this.successMessage.set('Department created.');
          this.showForm.set(false);
          this.loadDepartments();
        },
        error: () => this.errorMessage.set('Failed to create department.')
      });
    }
  }

  deactivate(dept: Department): void {
    if (!confirm(`Deactivate "${dept.name}"? It will no longer be assignable to new reports.`)) {
      return;
    }
    this.errorMessage.set(null);
    this.departmentsService.deactivate(dept.id).subscribe({
      next: () => {
        this.successMessage.set('Department deactivated.');
        this.loadDepartments();
      },
      error: () => this.errorMessage.set('Failed to deactivate department.')
    });
  }
}