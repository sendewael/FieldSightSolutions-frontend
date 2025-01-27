import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ChatbotResponse } from '../../dtos/Chatbot/chatbot-dto';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = `${environment.baseUrl}/chat`

  constructor(private http: HttpClient) { }

  getChatbotResponse(userId: number, question: string): Observable<ChatbotResponse> {
    const url = `${this.apiUrl}/${userId}/${encodeURIComponent(question)}/`;
    return this.http.post<ChatbotResponse>(url, {});
  }
}
