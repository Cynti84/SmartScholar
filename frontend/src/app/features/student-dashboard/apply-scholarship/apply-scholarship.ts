import { Component, OnInit } from '@angular/core';
import { UserScholarshipService } from '../../../core/services/user-scholarship.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  ApplicationAssistantService,
  DocumentChecklistItem,
  InterviewQuestion,
  ApplicationTip,
  EssayReviewResult,
} from '../../../core/services/application-assistant.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-apply-scholarship',
  imports: [DashboardLayout, CommonModule, FormsModule, MatIconModule],
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

  // Application Assistant State
  showAssistant = false;
  assistantLoading = {
    checklist: false,
    questions: false,
    tips: false,
    essayReview: false,
  };

  // Application Data
  documentChecklist: DocumentChecklistItem[] = [];
  interviewQuestions: InterviewQuestion[] = [];
  applicationTips: ApplicationTip[] = [];
  essayReview: EssayReviewResult | null = null;

  // Essay Review
  essayText = '';
  essayError = '';

  // Active tab
  activeAssistantTab: 'checklist' | 'questions' | 'tips' | 'essay' = 'checklist';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userScholarshipService: UserScholarshipService,
    private location: Location,
    private applicationAssistant: ApplicationAssistantService
  ) {}

  alreadyApplied = false;
  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    this.scholarshipId = Number(this.route.snapshot.paramMap.get('id'));
    this.userScholarshipService.getAppliedScholarships().subscribe((res) => {
      this.alreadyApplied = res.data.some(
        (app: any) => app.scholarship.scholarship_id === this.scholarshipId
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

  // Toggle application assistant visibility
  toggleAssistant(): void {
    this.showAssistant = !this.showAssistant;

    // load assistant data when opened for the first time
    if (this.showAssistant && this.documentChecklist.length === 0) {
      this.loadAllAssistantData();
    }
  }

  // Load all assistant data
  loadAllAssistantData(): void {
    this.loadDocumentChecklist();
    this.loadInterviewQuestions();
    this.loadApplicationTips();
  }

  // Load document checklist
  loadDocumentChecklist(): void {
    this.assistantLoading.checklist = true;

    this.applicationAssistant.getDocumentChecklist(this.scholarshipId).subscribe({
      next: (response) => {
        this.documentChecklist = response.data.map((item) => ({
          ...item,
          completed: false, // Add tracking
        }));
        this.assistantLoading.checklist = false;
      },
      error: (err) => {
        console.error('Error loading checklist:', err);
        this.assistantLoading.checklist = false;
      },
    });
  }

  // load interview questions
  loadInterviewQuestions(): void {
    this.assistantLoading.questions = true;

    this.applicationAssistant.getInterviewQuestions(this.scholarshipId).subscribe({
      next: (response) => {
        this.interviewQuestions = response.data;
        this.assistantLoading.questions = false;
      },
      error: (err) => {
        console.error('Error loading questions:', err);
        this.assistantLoading.questions = false;
      },
    });
  }

  // load application tips
  loadApplicationTips(): void {
    this.assistantLoading.tips = true;

    this.applicationAssistant.getApplicationTips(this.scholarshipId).subscribe({
      next: (response) => {
        this.applicationTips = response.data;
        this.assistantLoading.tips = false;
      },
      error: (err) => {
        console.error('Error loading tips:', err);
        this.assistantLoading.tips = false;
      },
    });
  }

  // review essay
  reviewEssay(): void {
    if (!this.essayText || this.essayText.trim().length < 100) {
      this.essayError = 'Essay must be at least 100 characters long';
      return;
    }

    this.essayError = '';
    this.assistantLoading.essayReview = true;
    this.essayReview = null;

    this.applicationAssistant.reviewEssay(this.scholarshipId, this.essayText).subscribe({
      next: (response) => {
        this.essayReview = response.data;
        this.assistantLoading.essayReview = false;
      },
      error: (err) => {
        console.error('Error reviewing essay:', err);
        this.essayError = 'Failed to review essay. Please try again.';
        this.assistantLoading.essayReview = false;
      },
    });
  }

  // toggle checklist item completion
  toggleChecklistItem(index: number): void {
    this.documentChecklist[index].completed = !this.documentChecklist[index].completed;
  }

  // switch assistant tab
  switchAssistantTab(tab: 'checklist' | 'questions' | 'tips' | 'essay'): void {
    this.activeAssistantTab = tab;
  }

  // get completion percentage for checklist
  getChecklistProgress(): number {
    if (this.documentChecklist.length === 0) return 0;

    const completed = this.documentChecklist.filter((item) => item.completed).length;
    return Math.round((completed / this.documentChecklist.length) * 100);
  }

  /**
   *
   * Helper methods for essay review score display
   */

  // get score class for styling
  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    return 'needs-work';
  }

  // get score description
  getScoreDescription(score: number): string {
    if (score >= 80) return 'Excellent! Your essay is well-aligned with the scholarship.';
    if (score >= 70) return 'Good work! With some improvements, this will be strong.';
    if (score >= 60) return 'Fair. Consider the suggestions to strengthen your essay.';
    return 'Needs significant work. Review the feedback carefully.';
  }

  // Get count of completed documents
  getCompletedCount(): number {
    return this.documentChecklist.filter((d) => d.completed).length;
  }

  onSidebarAction(action: string): void {
    console.log('Sidebar action:', action);
  }
}
