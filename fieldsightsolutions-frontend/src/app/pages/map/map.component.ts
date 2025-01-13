import { Component, Input } from '@angular/core';
import * as L from 'leaflet';
import "leaflet/dist/leaflet.css"
import { PerceelknopComponent } from '../../components/perceelknop/perceelknop.component';
import { FieldResponsetDto } from '../../api/dtos/Field/Field-response-dto';
import { FieldService } from '../../api/services/field/field.service';
import { CornerService } from '../../api/services/corner/corner.service';
import { CropResponseDto } from '../../api/dtos/Crop/Crop-response-dto';
import { CropService } from '../../api/services/crop/crop.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [PerceelknopComponent, CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {

  private map: L.Map | undefined;
  public isOpen: boolean = false;
  public nieuwPerceel: boolean = false;
  public geselecteerdPerceel: FieldResponsetDto | null = null;
  private highlightedPolygon: L.Polygon | null = null;


  crops: CropResponseDto[] = [];
  percelen: FieldResponsetDto[] = [];

  constructor(private fieldService: FieldService, private cornerService: CornerService, private cropService: CropService) { }

  ngOnInit(): void {
    this.percelen = this.fieldService.getFields()
    this.crops = this.cropService.getCrops()
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.drawFieldsOnMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [51.1667, 4.9833],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  private drawFieldsOnMap(): void {
    if (!this.map) return;

    this.percelen.forEach(field => {
      const corners = this.cornerService.getCornersByFieldId(field.id);

      if (corners && corners.length > 0) {
        const polygonCoords: [number, number][] = corners.map(corner => [
          parseFloat(corner.xCord),
          parseFloat(corner.yCord),
        ]);


        const polygon = L.polygon(polygonCoords, {
          color: 'blue',
          fillColor: 'lightblue',
          fillOpacity: 0.5,
        });

        if (this.map) {
          polygon.addTo(this.map);
        }

        polygon.bindPopup(`<b>Name:</b> ${field.name}`);
      }
    });
  }

  highlightField(fieldId: number): void {
    if (!this.map) return;

    if (this.highlightedPolygon) {
      this.map.removeLayer(this.highlightedPolygon);
      this.highlightedPolygon = null;
    }

    const corners = this.cornerService.getCornersByFieldId(fieldId);

    if (corners && corners.length > 0) {
      const polygonCoords: [number, number][] = corners.map(corner => [
        parseFloat(corner.xCord),
        parseFloat(corner.yCord),
      ]);

      this.highlightedPolygon = L.polygon(polygonCoords, {
        color: 'red',
        fillColor: 'rgba(255, 0, 0, 0.4)',
        fillOpacity: 0.6,
        weight: 4,
      });

      this.highlightedPolygon.addTo(this.map);

    }
  }



  togglePanel(): void {
    this.isOpen = !this.isOpen;
    console.log('Panel is now:', this.isOpen ? 'Open' : 'Closed');
  }

  focusOnField(fieldId: number): void {
    const corners = this.cornerService.getCornersByFieldId(fieldId);
    if (corners.length > 0) {
      const firstCorner = corners[0];
      const x = parseFloat(firstCorner.xCord);
      const y = parseFloat(firstCorner.yCord);

      if (this.map) {
        this.map.setView([x, y], 30);
      }
    }

    const geselecteerdPerceel = this.percelen.find(perceel => perceel.id === fieldId);
    if (geselecteerdPerceel) {
      this.geselecteerdPerceel = geselecteerdPerceel;
      this.highlightField(fieldId);
    }
    console.log(geselecteerdPerceel)
  }

  openPerceelToevoegen(): void {
    this.nieuwPerceel = !this.nieuwPerceel
  }

  wisGeselecteerdPerceel(): void {
    this.geselecteerdPerceel = null
    if (this.highlightedPolygon) {
      if (this.map) {
        this.map.removeLayer(this.highlightedPolygon);
      }
      this.highlightedPolygon = null;
    }
  }
}
