import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private API_URL = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  readData(){
    return this.http.get('${this.API_URL}/usuarios');
  }

}
