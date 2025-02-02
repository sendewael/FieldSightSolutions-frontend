import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../api/services/weather/weather.service';
import { WeatherResponseDTO } from '../../api/dtos/Weather/weather-response.dto';

@Component({
    selector: 'app-weather',
    templateUrl: './weather-vis.component.html',
    styleUrls: ['./weather-vis.component.css'],
    standalone: true,
    imports: [CommonModule]
  })

  export class WeatherComponent implements OnInit {
    weatherData: WeatherResponseDTO | undefined;
    fieldId: number = 4524;  // dynamisch maken
  
    constructor(private readonly weatherService: WeatherService) {}
  
    ngOnInit(): void {
      this.weatherService.getWeatherForecast(this.fieldId).subscribe({
        next: (data: WeatherResponseDTO) => {
          this.weatherData = data;
          console.log(this.weatherData);
        },
        error: error => {
          console.error('Error fetching weather data:', error);
        }
      });
    }
  }