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
  iconPath: string = 'nietGevonden.svg';
  iconAlt: string = 'Onbekend';

  constructor() { }

  ngOnInit(): void {
    this.setIcon();
  }

  setIcon(): void {
    const weatherIcons: { [key: string]: string } = {
      "Helder": "Helder.png",
      "Overwegend helder tot bewolkt": "OverwegendHelder.png",
      "Mist, mogelijks met vorst": "Mist.png",
      "Motregen": "Motregen.png",
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
