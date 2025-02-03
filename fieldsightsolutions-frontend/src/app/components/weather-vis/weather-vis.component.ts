import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../api/services/weather/weather.service';
import { WeatherResponseDTO } from '../../api/dtos/Weather/weather-response.dto';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, BarElement, LineController, BarController, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, BarElement, LineController, BarController, Title, Tooltip, Legend);

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-vis.component.html',
  styleUrls: ['./weather-vis.component.css']
})
export class WeatherComponent implements OnInit {
  @Input() fieldId!: number;
  weatherData: WeatherResponseDTO | null = null;
  loading = true;
  errorMessage = '';
  chart: any;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    if (this.fieldId) {
      this.fetchWeather();
    }
  }

  fetchWeather() {
    this.weatherService.getWeatherForecast(this.fieldId).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.updateChartData();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error fetching weather data';
        console.error(error);
        this.loading = false;
      }
    });
  }

  updateChartData() {
    if (!this.weatherData) return;

    const dates = this.weatherData.response.map(day => day.date);
    const maxTemps = this.weatherData.response.map(day => day.temperature_2m_max);
    const minTemps = this.weatherData.response.map(day => day.temperature_2m_min);
    const precipitation = this.weatherData.response.map(day => day.precipitation_sum);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('weatherChart', {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Max Temperatuur',
            data: maxTemps,
            borderColor: 'red',
            fill: false,
            tension: 0.1,
            pointRadius: 5,
            pointBackgroundColor: 'red'
          },
          {
            label: 'Min Temperatuur',
            data: minTemps,
            borderColor: 'blue',
            fill: false,
            tension: 0.1,
            pointRadius: 5,
            pointBackgroundColor: 'blue'
          },
          {
            label: 'Verwachte Neerslag',
            data: precipitation,
            borderColor: 'green',
            backgroundColor: 'rgba(0, 128, 0, 0.2)',
            type: 'bar',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Datum'
            }
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: 'Temperatuur (°C)'
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Verwachte Neerslag (mm)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }
}
