import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { WeatherResponseDTO } from '../../dtos/Weather/weather-response.dto';


@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly apiUrl = `${environment.baseUrl}/weather/forecast`;

  constructor(private readonly http: HttpClient) {}

  getWeatherForecast(fieldId: number): Observable<WeatherResponseDTO> {
    const url = `${this.apiUrl}/${fieldId}/`;
    return this.http.get<WeatherResponseDTO>(url);  // GET request
  }
}
