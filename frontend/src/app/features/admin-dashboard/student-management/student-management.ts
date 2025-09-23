import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';

interface Student {
  name: string;
  email: string;
  country: string;
  status: string;
  applied: number;
  bookmarked: number;
  lastLogin: string;
}

@Component({
  selector: 'app-student-management',
  imports: [CommonModule, DashboardLayout],
  templateUrl: './student-management.html',
  styleUrl: './student-management.scss',
})
export class StudentManagement {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
  ];
  stats = [
    { title: 'Total Students', value: 6, color: '#3b82f6' },
    { title: 'Active Students', value: 120, color: '#22c55e' },
    { title: 'Inactive Students', value: 8, color: '#facc15' },
    { title: 'Banned Students', value: 8, color: '#ef4444' },
  ];

  students: Student[] = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      country: 'Kenya',
      status: 'Active',
      applied: 3,
      bookmarked: 2,
      lastLogin: '2 days ago',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      country: 'Kenya',
      status: 'Active',
      applied: 5,
      bookmarked: 1,
      lastLogin: '1 day ago',
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      country: 'Kenya',
      status: 'Inactive',
      applied: 2,
      bookmarked: 0,
      lastLogin: '5 days ago',
    },
  ];

  selectedStudent: Student | null = this.students[0];

  selectStudent(student: Student) {
    this.selectedStudent = student;
  }
}
