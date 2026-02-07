import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ExtractedFilters {
  countries?: string[];
  academicLevels?: string[];
  fieldsOfStudy?: string[];
  interests?: string[];
  scholarshipTypes?: string[];
  hasDisability?: boolean;
  incomeLevel?: string;
  minGPA?: number;
}

export interface DiscoveredScholarship {
  scholarship_id: number;
  title: string;
  organization_name: string;
  country: string;
  education_level: string;
  fields_of_study: string[];
  scholarship_type: string;
  deadline: string;
  matchScore: number; // ✅ Added back
}

export interface DiscoveryResponse {
  success: boolean;
  data: {
    scholarships: DiscoveredScholarship[];
    aiExplanation: string;
    extractedFilters: ExtractedFilters;
    totalMatches: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  scholarships?: DiscoveredScholarship[];
  filters?: ExtractedFilters;
  isLoading?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AIScholarshipDiscoveryService {
  private apiUrl = `${environment.apiUrl}/student`;

  // Chat history
  private chatHistorySubject = new BehaviorSubject<ChatMessage[]>([]);
  public chatHistory$ = this.chatHistorySubject.asObservable();

  // Chat open state
  private isChatOpenSubject = new BehaviorSubject<boolean>(false);
  public isChatOpen$ = this.isChatOpenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeChat();
  }

  /**
   * Initialize chat with welcome message
   */
  private initializeChat(): void {
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: `Hi! 👋 I'm your AI scholarship assistant. Tell me what you're looking for and I'll find the perfect scholarships for you!\n\nFor example, try saying:\n• "Find scholarships for engineering students"\n• "I'm interested in AI and machine learning"\n• "Show me full funding opportunities"`,
      timestamp: new Date(),
    };
    this.chatHistorySubject.next([welcomeMessage]);
  }

  /**
   * Discover scholarships using natural language
   */
  discoverScholarships(query: string): Observable<DiscoveryResponse> {
    // Add user message immediately
    this.addUserMessage(query);

    // Add loading message
    const loadingMessage = this.addAssistantLoadingMessage();

    return this.http
      .post<DiscoveryResponse>(`${this.apiUrl}/discover-scholarships`, { query })
      .pipe(
        tap({
          next: async (response) => {
            // ✅ Simulate realistic typing delay based on response length
            await this.simulateTypingDelay(response.data.aiExplanation);

            // Remove loading message
            this.removeMessage(loadingMessage.id);

            // Add assistant response
            this.addAssistantMessage(
              response.data.aiExplanation,
              response.data.scholarships,
              response.data.extractedFilters
            );
          },
          error: async (error) => {
            // ✅ Small delay even for errors
            await this.simulateTypingDelay('Error message');

            // Remove loading message
            this.removeMessage(loadingMessage.id);

            // Add error message
            this.addAssistantMessage(
              "Sorry, I couldn't process your request right now. Please try again! 😔"
            );
          },
        })
      );
  }

  /**
   * Simulate realistic typing delay based on text length
   */
  private simulateTypingDelay(text: string): Promise<void> {
    return new Promise((resolve) => {
      // Base delay (1.5 seconds) + extra time based on text length
      // Simulates realistic typing speed (~40 chars per second for thoughtful responses)
      const baseDelay = 1500; // 1.5 seconds minimum
      const charsPerSecond = 40; // Slower = more realistic for AI "thinking"
      const extraDelay = Math.min((text.length / charsPerSecond) * 1000, 3000); // Max 3 seconds extra
      const totalDelay = baseDelay + extraDelay;

      console.log(`⏱️ Simulating typing delay: ${totalDelay}ms for ${text.length} characters`);

      setTimeout(resolve, totalDelay);
    });
  }

  /**
   * Add user message to chat
   */
  private addUserMessage(content: string): ChatMessage {
    const message: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const currentHistory = this.chatHistorySubject.value;
    this.chatHistorySubject.next([...currentHistory, message]);

    return message;
  }

  /**
   * Add assistant message to chat
   */
  private addAssistantMessage(
    content: string,
    scholarships?: DiscoveredScholarship[],
    filters?: ExtractedFilters
  ): ChatMessage {
    const message: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      scholarships,
      filters,
    };

    const currentHistory = this.chatHistorySubject.value;
    this.chatHistorySubject.next([...currentHistory, message]);

    return message;
  }

  /**
   * Add loading message
   */
  private addAssistantLoadingMessage(): ChatMessage {
    const message: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    const currentHistory = this.chatHistorySubject.value;
    this.chatHistorySubject.next([...currentHistory, message]);

    return message;
  }

  /**
   * Remove message from chat
   */
  private removeMessage(messageId: string): void {
    const currentHistory = this.chatHistorySubject.value;
    this.chatHistorySubject.next(currentHistory.filter((m) => m.id !== messageId));
  }

  /**
   * Clear chat history
   */
  clearChat(): void {
    this.initializeChat();
  }

  /**
   * Toggle chat open/close
   */
  toggleChat(): void {
    this.isChatOpenSubject.next(!this.isChatOpenSubject.value);
  }

  /**
   * Open chat
   */
  openChat(): void {
    this.isChatOpenSubject.next(true);
  }

  /**
   * Close chat
   */
  closeChat(): void {
    this.isChatOpenSubject.next(false);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Quick prompt suggestions
   */
  getQuickPrompts(): string[] {
    return [
      'Find scholarships for engineering students',
      'Show me AI and tech scholarships',
      'I need full funding opportunities',
      'Scholarships for international students',
      'Find opportunities for my field',
    ];
  }
}
