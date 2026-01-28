import { Component, OnInit } from '@angular/core';
import { UserScholarshipService } from '../../../core/services/user-scholarship.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
@Component({
  selector: 'app-apply-scholarship',
  imports: [DashboardLayout, CommonModule],
  templateUrl: './apply-scholarship.html',
  styleUrl: './apply-scholarship.scss',
})
export class ApplyScholarship implements OnInit {
  scholarshipId!: number;
  scholarship: any;
  isSubmitting = false;
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
    { label: 'Logout', action: 'logout' },
  ];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userScholarshipService: UserScholarshipService,
    private location: Location,
  ) {}

  alreadyApplied = false;
  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    this.scholarshipId = Number(this.route.snapshot.paramMap.get('id'));
    this.userScholarshipService.getAppliedScholarships().subscribe((res) => {
      this.alreadyApplied = res.data.some(
        (app: any) => app.scholarship.scholarship_id === this.scholarshipId,
      );
    });
    this.loadScholarship();
  }
  loadScholarship(): void {
    this.userScholarshipService.getScholarshipDetails(this.scholarshipId).subscribe((res) => {
      console.log('Scholarship response:', res.data); // <--- check this!
      if (!res?.data) {
        console.error('Scholarship data is missing');
        return;
      }

      const data = res.data;

      // Normalize fields to strings
      data.eligibility_criteria = data.eligibility_criteria || '';
      data.required_documents = data.required_documents || '';
      data.application_steps = data.application_steps || '';
      data.application_url = data.application_url || '';

      this.scholarship = data;
    });
  }

  markAsApplied(): void {
    this.userScholarshipService.markAsApplied(this.scholarshipId).subscribe({
      next: () => {
        alert('Scholarship marked as applied');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to apply');
      },
    });
  }

  applyScholarship() {
    if (this.alreadyApplied) {
      return;
    }

    this.userScholarshipService.markAsApplied(this.scholarshipId).subscribe({
      next: () => {
        this.alreadyApplied = true;
      },
      error: (err) => {
        alert(err.error?.message);
      },
    });
  }

  onSidebarAction(action: string): void {
    console.log('Sidebar action:', action);
  }
}
