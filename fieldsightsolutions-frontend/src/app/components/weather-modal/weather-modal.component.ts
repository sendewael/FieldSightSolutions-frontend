import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-weather-modal',
  standalone: true,
  imports: [NgClass],
  templateUrl: './weather-modal.component.html',
  styleUrl: './weather-modal.component.css'
})
export class WeatherModalComponent implements OnInit {
  @Input() prediction: string = '';
  modalClass: string = 'bg-red-400';
  modalMessage: string = '';
  showModal: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.setModalProperties();
  }

  setModalProperties(): void {
    const redConditions = [
      "regenbuien",
      "sneeuwbuien",
      "onweer",
      "onweer met hagel"
    ];

    if (redConditions.includes(this.prediction)) {
      this.showModal = true;
      this.modalMessage = `Opgelet, weersvoorspelling voor morgen: ${this.prediction}. Neem de juiste voorzorgsmaatregelen!`;
    } else {
      this.showModal = false;
    }
  }
}
