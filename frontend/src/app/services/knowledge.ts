import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Knowledge {
  _id?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class KnowledgeService {
  private apiUrl = 'http://localhost:3000/knowledge';

  constructor(private http: HttpClient) {}

  getAllKnowledge(): Observable<Knowledge[]> {
    return this.http.get<Knowledge[]>(this.apiUrl);
  }

  getKnowledgeById(id: string): Observable<Knowledge> {
    return this.http.get<Knowledge>(`${this.apiUrl}/${id}`);
  }

  createKnowledge(knowledge: Knowledge): Observable<Knowledge> {
    return this.http.post<Knowledge>(this.apiUrl, knowledge);
  }

  updateKnowledge(id: string, knowledge: Knowledge): Observable<Knowledge> {
    return this.http.put<Knowledge>(`${this.apiUrl}/${id}`, knowledge);
  }

  deleteKnowledge(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
