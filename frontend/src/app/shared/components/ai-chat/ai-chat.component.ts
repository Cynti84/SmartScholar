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

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  private shouldScrollToBottom = false;

  constructor(private discoveryService: AIScholarshipDiscoveryService, private router: Router) {}

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
   * View scholarship details
   */
  viewScholarship(scholarship: DiscoveredScholarship): void {
    this.closeChat();
    this.router.navigate(['/student/scholarships'], {
      queryParams: { id: scholarship.scholarship_id },
    });
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
