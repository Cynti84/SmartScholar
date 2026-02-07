import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AIScholarshipDiscoveryService,
  ChatMessage,
  DiscoveredScholarship,
  ExtractedFilters,
} from '../../../core/services/ai-scholarship-discovery.service';
import { ScholarshipService, Scholarship } from '../../../core/services/scholarship.service';
import {
  ScholarshipDetailModalComponent,
  ScholarshipDetail,
} from '../scholarship-detail-modal/scholarship-detail-modal.component';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ScholarshipDetailModalComponent],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
})
export class AIChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isChatOpen = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isProcessing = false;
  quickPrompts: string[] = [];

  // Scholarship modal state
  selectedScholarship: ScholarshipDetail | null = null;

  private shouldScrollToBottom = false;

  constructor(
    private discoveryService: AIScholarshipDiscoveryService,
    private scholarshipService: ScholarshipService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to chat state
    this.discoveryService.isChatOpen$.subscribe((isOpen) => {
      this.isChatOpen = isOpen;
      if (isOpen) {
        this.shouldScrollToBottom = true;
      }
    });

    // Subscribe to chat messages
    this.discoveryService.chatHistory$.subscribe((messages) => {
      this.messages = messages;
      this.shouldScrollToBottom = true;
    });

    // Get quick prompts
    this.quickPrompts = this.discoveryService.getQuickPrompts();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  /**
   * Toggle chat open/close
   */
  toggleChat(): void {
    this.discoveryService.toggleChat();
  }

  /**
   * Close chat
   */
  closeChat(): void {
    this.discoveryService.closeChat();
  }

  /**
   * Send message
   */
  sendMessage(): void {
    if (!this.userInput.trim() || this.isProcessing) {
      return;
    }

    const query = this.userInput.trim();
    this.userInput = '';
    this.isProcessing = true;

    this.discoveryService.discoverScholarships(query).subscribe({
      next: () => {
        this.isProcessing = false;
      },
      error: (err) => {
        console.error('Discovery error:', err);
        this.isProcessing = false;
      },
    });
  }

  /**
   * Use quick prompt
   */
  useQuickPrompt(prompt: string): void {
    this.userInput = prompt;
    this.sendMessage();
  }

  /**
   * Handle Enter key
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * View scholarship details - opens modal
   */
  viewScholarship(scholarship: DiscoveredScholarship): void {
    // Fetch full scholarship details
    this.scholarshipService.getScholarshipById(scholarship.scholarship_id.toString()).subscribe({
      next: (res) => {
        this.selectedScholarship = this.mapToScholarshipDetail(res.data);
      },
      error: (err) => {
        console.error('Failed to load scholarship details', err);
      },
    });
  }

  /**
   * Close scholarship modal
   */
  closeScholarshipModal(): void {
    this.selectedScholarship = null;
  }

  /**
   * Handle apply action from modal
   */
  onApplyScholarship(scholarshipId: number): void {
    this.router.navigate(['/student/apply', scholarshipId]);
  }

  /**
   * Map Scholarship to ScholarshipDetail format
   */
  private mapToScholarshipDetail(s: Scholarship): ScholarshipDetail {
    return {
      id: s.scholarship_id,
      scholarshipId: s.scholarship_id,
      title: s.title,
      provider: s.organization_name,
      providerLogo: s.banner_url,
      status: this.getScholarshipStatus(s),
      category: s.scholarship_type,
      country: s.country,
      level: s.education_level,
      fundingType: s.scholarship_type,
      fieldOfStudy: s.fields_of_study.join(', '),
      tags: s.fields_of_study,
      amount: s.benefits,
      deadline: s.deadline,
      description: s.description,
      eligibility: s.eligibility_criteria.split('\n').filter((e) => e.trim()),
      fundingDetails: s.benefits,
      requirements: s.application_instructions.split('\n').filter((r) => r.trim()),
      applicationUrl: s.application_link,
      savedDate: new Date(s.created_at),
      matchScore: s.matchScore,
    };
  }

  /**
   * Determine scholarship status
   */
  private getScholarshipStatus(s: Scholarship): 'active' | 'expired' | 'applied' {
    const deadlineDate = new Date(s.deadline);
    const today = new Date();

    if (deadlineDate < today) {
      return 'expired';
    }

    // You can add logic here to check if user has applied
    // For now, we'll just return 'active'
    return 'active';
  }

  /**
   * Clear chat
   */
  clearChat(): void {
    this.discoveryService.clearChat();
  }

  /**
   * Scroll to bottom of messages
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  /**
   * Get days remaining for deadline
   */
  getDaysRemaining(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Format filters for display
   */
  formatFilters(filters: ExtractedFilters): string {
    const parts: string[] = [];

    if (filters.countries?.length) {
      parts.push(`📍 ${filters.countries.join(', ')}`);
    }

    if (filters.academicLevels?.length) {
      parts.push(`🎓 ${filters.academicLevels.join(', ')}`);
    }

    if (filters.fieldsOfStudy?.length) {
      parts.push(`📚 ${filters.fieldsOfStudy.join(', ')}`);
    }

    if (filters.scholarshipTypes?.length) {
      parts.push(`💰 ${filters.scholarshipTypes.join(', ')}`);
    }

    return parts.join(' • ');
  }
}
