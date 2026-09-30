export enum ReportStatus {
  Submitted = 0,
  Verified = 1,
  Rejected = 2,
  Assigned = 3,
  InProgress = 4,
  Resolved = 5
}

export enum UserRole {
  Citizen = 0,
  Administrator = 1,
  DepartmentOfficer = 2
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  contactPhone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReportListItem {
  id: number;
  reportNumber: string;
  title: string;
  status: ReportStatus;
  categoryName?: string;
  departmentName?: string;
  locationText?: string;
  createdAt: string;
}

export interface StatusHistoryItem {
  oldStatus: ReportStatus;
  newStatus: ReportStatus;
  comment?: string;
  changedByUserId: number;
  changedAt: string;
}

export interface ReportDetail {
  id: number;
  reportNumber: string;
  title: string;
  description: string;
  status: ReportStatus;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  department?: { id: number; name: string };
  statusHistory: StatusHistoryItem[];
}

export interface LoginResponse {
  token: string;
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface CreateReportRequest {
  title: string;
  description: string;
  categoryId: number;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}