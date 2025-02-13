import { Component } from '@angular/core';
import "leaflet/dist/leaflet.css"
import * as L from 'leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { UserFieldService } from '../../api/services/userField/user-field.service';
import { UserFieldResponseDto } from '../../api/dtos/UserField/UserField-response-dto';
import { UserService } from '../../api/services/user/user.service';
import { FieldResponsetDto } from '../../api/dtos/Field/Field-response-dto';
import { FieldService } from '../../api/services/field/field.service';
import { CornerService } from '../../api/services/corner/corner.service';

@Component({
  selector: 'app-dashboard-map',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-map.component.html',
  styleUrl: './dashboard-map.component.css'
})
export class DashboardMapComponent {

  constructor(
    private userFieldService: UserFieldService,
    private userService: UserService,
    private fieldService: FieldService,
    private cornerService: CornerService
  ) { }

  // Variablen
  public map: L.Map | undefined;
  public mapCenter: [number, number] = [51.1620, 4.9910];

  public userFieldsTable: UserFieldResponseDto[] = [];
  public fields: FieldResponsetDto[] = [];
  public fieldPolygons: Map<number, L.Polygon> = new Map();

  public userMunicipality: string | null = null;
  public userId: number = 0


  // Opstart methode
  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      this.userId = user.id;
      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          //DEZE LIJN COMMENTEN
          this.userMunicipality = "geel"
          //DEZE LIJN UNCOMMENTEN
          // this.userMunicipality = user.overzicht_gemeente
          console.log(this.userMunicipality)
          this.initMap()
          this.loadFields()
        }
      })
    }
  }

  // Maak de map
  private initMap(): void {
    this.map = L.map('map', {
      center: [51.1620, 4.9910],
      zoom: 13,
    });

    L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg', {
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.attributionControl.setPosition('bottomleft');

    const searchControl = GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      style: 'button',
      showMarker: false,
      showPopup: false,
    });

    this.map.addControl(searchControl);
  }

  // Laad de velden
  private loadFields(): void {
    console.log("Load fields")
    if (this.userMunicipality) {
      this.userFieldService.getUserFieldsByMunicipality(this.userMunicipality).subscribe(
        (userFields) => {
          this.userFieldsTable = userFields;
          const fieldIds = userFields.map(uf => uf.field);
          this.fieldService.getFieldsByFieldIds(fieldIds).subscribe({
            next: (fields) => {
              this.fields = fields;
              console.log(fields);
              if (fields.length > 0) {
                // Centreer de kaart op het eerste veld
                const firstField = fields[0];
                this.centerMapOnField(firstField);
              }
              this.drawFieldsOnMap();
            }
          });
        }
      );
    }
  }

  private centerMapOnField(field: FieldResponsetDto): void {
    if (!this.map) return;

    this.cornerService.getCornersByFieldId(field.id).subscribe(corners => {
      if (corners && corners.length > 0) {
        const firstCorner = corners[0];
        const lat = parseFloat(firstCorner.xCord);
        const lon = parseFloat(firstCorner.yCord);
        if (this.map)
          this.map.setView([lat, lon], 13);
      }
    });
  }

  // Teken de velden
  private drawFieldsOnMap(): void {
    if (!this.map) return;

    this.fields.forEach(field => {
      this.drawPolygonForField(field.id, 'green', 'lightgreen');
    });
  }

  private drawPolygonForField(fieldId: number, color: string, fillColor: string): void {
    if (!this.map || this.fieldPolygons.has(fieldId)) return;

    if (this.map) {
      this.cornerService.getCornersByFieldId(fieldId).subscribe(corners => {
        if (corners?.length && this.map) {
          const polygonCoords: [number, number][] = corners.map(corner => [
            parseFloat(corner.xCord),
            parseFloat(corner.yCord),
          ]);

          const polygon = L.polygon(polygonCoords, {
            color: color,
            fillColor: fillColor,
            fillOpacity: 0.5,
          }).addTo(this.map);

          this.fieldPolygons.set(fieldId, polygon);

          const fieldName = this.fields.find(field => field.id === fieldId)?.name || `Field ${fieldId}`;
          const fieldOwner = this.fields.find(field => field.id === fieldId)?.user_name || `Field ${fieldId}`;
          const fieldCrop = this.fields.find(field => field.id === fieldId)?.crop || `Field ${fieldId}`;
          polygon.bindTooltip(
            `${fieldName}<br>${fieldOwner}<br>${fieldCrop}`,
            { permanent: false, direction: 'center' }
          );

        } else {
          console.error(`Geen hoeken gevonden voor veld ${fieldId}`);
        }
      });
    }
  }
}
