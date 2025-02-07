import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../api/services/chatbot/chatbot.service';
import { ChatbotResponse } from '../../api/dtos/Chatbot/chatbot-dto';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.css'
})
export class ChatWidgetComponent {
  isChatOpen = false;
  userMessage = '';
  messages: { text: string; user: boolean }[] = [];
  predefinedMessages = [
    'Wat is je doel?',
    'Wie is VITO?',
    'Wat is Moisture Stress Index?',
    'Wat is de Yield Potential Map?',
    'Wat is CropSAR_2D?',
    'Wat is Anomaly Detection?'
  ];

  constructor(
    private chatbotService: ChatbotService
  ) { }

  public userId: number = 0

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      this.userId = user.id;
    }
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      this.addMessage(this.userMessage, true);

      this.chatbotService.getChatbotResponse(this.userId, this.userMessage).subscribe({
        next: (response: ChatbotResponse) => {
          this.addMessage(response.response, false);
        },
        error: (error) => {
          console.error('Error fetching chatbot response:', error);
          this.addMessage('Er is een fout opgetreden. Probeer het later opnieuw.', false);
        },
      });

      this.userMessage = '';
    }
  }

  sendPredefinedMessage(message: string) {
    this.userMessage = message;
    this.sendMessage();
  }

  private addMessage(text: string, user: boolean) {
    this.messages.push({ text, user });
  }
}
