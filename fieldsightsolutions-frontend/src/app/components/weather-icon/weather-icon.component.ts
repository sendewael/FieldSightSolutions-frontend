import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  imports: [],
  templateUrl: './weather-icon.component.html',
  styleUrl: './weather-icon.component.css'
})
export class WeatherIconComponent implements OnInit {
  @Input() prediction: string = '';
  iconPath: string = 'nietGevonden.png';
  iconAlt: string = 'Onbekend';

  constructor() { }

  ngOnInit(): void {
    this.setIcon();
  }

  setIcon(): void {
    const weatherIcons: { [key: string]: string } = {
      "helder": "Helder.png",
      "overwegend helder tot bewolkt": "OverwegendHelder.png",
      "mist, mogelijks met vorst": "Mist.png",
      "motregen": "Motregen.png",
      "motregen met kans op smeltende sneeuw": "Motregen.png",
      "regen met kans op smeltende sneeuw": "Regen.png",
      "regen": "Regen.png",
      "Sneeuwval": "Sneeuw.png",
      "Ijzel": "Ijzel.png",
      "Regenbuien": "Regenbuien.png",
      "Sneeuwbuien": "Sneeuwbuien.png",
      "Onweer": "Onweer.png",
      "Onweer met hagel": "OnweerHagel.png"

    };

    if (weatherIcons[this.prediction]) {
      this.iconPath = weatherIcons[this.prediction];
      this.iconAlt = this.prediction;
    }
  }
}
