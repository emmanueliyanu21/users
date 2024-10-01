import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.staging';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient,) {}

  get<T>(
    url: string,
    params?: HttpParams,
    headers?: HttpHeaders
  ): Observable<T> {
    const options = { params, headers };
    return this.http.get<T>(`${this.baseUrl}${url}`, options);
  }

  post<T, R>(url: string, body: R, headers?: HttpHeaders): Observable<T> {
    const options = { headers };
    return this.http.post<T>(`${this.baseUrl}${url}`, body, options);
  }
  put<T, R>(url: string, body: R, headers?: HttpHeaders): Observable<T> {
    const options = { headers };
    return this.http.put<T>(`${this.baseUrl}${url}`, body, options);
  }
  patch<T, R>(url: string, body: R, headers?: HttpHeaders): Observable<T> {
    const options = { headers };
    return this.http.patch<T>(`${this.baseUrl}${url}`, body, options);
  }
  delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    const options = { headers };
    return this.http.delete<T>(`${this.baseUrl}${url}`, options);
  }

}
