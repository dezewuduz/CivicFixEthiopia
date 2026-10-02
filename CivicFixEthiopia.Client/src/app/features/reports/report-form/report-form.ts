import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReportsService } from '../../../core/services/reports';
import { UploadService } from '../../../core/services/upload';
import { Category } from '../../../shared/models/models';
import { HttpClient } from '@angular/common/http';

const CATEGORIES_URL = 'http://localhost:5075/api/categories';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './report-form.html',
  styleUrl: './report-form.css'
})
export class ReportForm {
  categories = signal<Category[]>([]);
  selectedCategoryId: number | null = null;
  title = '';
  description = '';
  locationText = '';

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isUploading = signal(false);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private reportsService: ReportsService,
    private uploadService: UploadService,
    private router: Router
  ) {
    this.http.get<Category[]>(CATEGORIES_URL).subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.errorMessage.set('Could not load categories.')
    });
  }

  selectCategory(id: number): void {
    this.selectedCategoryId = id;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.errorMessage.set('Only JPG and PNG images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('Image must be under 5 MB.');
      return;
    }

    this.errorMessage.set(null);
    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  onSubmit(): void {
    if (!this.selectedCategoryId) {
      this.errorMessage.set('Please select a category.');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const file = this.selectedFile();
    if (file) {
      this.isUploading.set(true);
      this.uploadService.uploadReportImage(file).subscribe({
        next: (res) => this.submitReport(res.url),
        error: () => {
          this.isUploading.set(false);
          this.isLoading.set(false);
          this.errorMessage.set('Image upload failed. Try submitting without a photo.');
        }
      });
    } else {
      this.submitReport(undefined);
    }
  }

  private submitReport(imageUrl: string | undefined): void {
    this.reportsService.create({
      categoryId: this.selectedCategoryId!,
      title: this.title,
      description: this.description,
      locationText: this.locationText || undefined,
      imageUrl
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isUploading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isUploading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Failed to submit report.');
      }
    });
  }
}