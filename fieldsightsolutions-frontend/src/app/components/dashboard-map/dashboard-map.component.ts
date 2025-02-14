import { Component, Input, SimpleChanges } from '@angular/core';
import "leaflet/dist/leaflet.css"
import * as L from 'leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { UserFieldService } from '../../api/services/userField/user-field.service';
import { UserFieldResponseDto } from '../../api/dtos/UserField/UserField-response-dto';
import { UserService } from '../../api/services/user/user.service';
import { FieldResponsetDto } from '../../api/dtos/Field/Field-response-dto';
import { FieldService } from '../../api/services/field/field.service';
import { CornerService } from '../../api/services/corner/corner.service';
import { NgClass } from '@angular/common';
import { InsuranceFormService } from '../../api/services/insuranceForm/insurance-form.service';
import { InsuranceFormResponseDto } from '../../api/dtos/InsuranceForm/InsuranceForm-response-dto';

@Component({
  selector: 'app-dashboard-map',
  standalone: true,
  imports: [NgClass],
  templateUrl: './dashboard-map.component.html',
  styleUrl: './dashboard-map.component.css'
})
export class DashboardMapComponent {

  constructor(
    private fieldService: FieldService,
    private cornerService: CornerService,
    private insuranceFormService: InsuranceFormService
  ) { }

  // Variablen
  public map: L.Map | undefined;
  public mapCenter: [number, number] = [51.1620, 4.9910];

  public userFieldsTable: UserFieldResponseDto[] = [];
  public fields: FieldResponsetDto[] = [];
  public insuranceClaims: InsuranceFormResponseDto[] = [];
  public fieldPolygons: Map<number, L.Polygon> = new Map();

  @Input() userMunicipality: string | null = null;

  public selectedField: FieldResponsetDto | null = null;



  // Opstart methode
  ngOnInit(): void {
    this.initMap()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userMunicipality']) {
      console.log("userMunicipality is veranderd:", this.userMunicipality);
      this.loadFields();
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
    if (this.userMunicipality) {
      this.clearPolygons();
      this.fieldService.getFieldsByGemeente(this.userMunicipality).subscribe(
        (fields) => {
          this.fields = fields;
          if (fields.length > 0) {
            const firstField = fields[0];
            this.centerMapOnField(firstField);
          }
          this.drawFieldsOnMap();
        }
      )
    }
  }

  private clearPolygons(): void {
    this.fieldPolygons.forEach((polygon) => {
      this.map?.removeLayer(polygon);
    });
    this.fieldPolygons.clear();
  }

  public clearSelectedField(): void {
    this.selectedField = null
    console.log(this.selectedField, "cleared")
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

          const field = this.fields.find(f => f.id === fieldId);
          const fieldName = this.fields.find(field => field.id === fieldId)?.name || `Field ${fieldId}`;
          const fieldOwner = this.fields.find(field => field.id === fieldId)?.user_name || `Field ${fieldId}`;
          const fieldCrop = this.fields.find(field => field.id === fieldId)?.crop || `Field ${fieldId}`;
          polygon.bindTooltip(
            `${fieldName}<br>${fieldOwner}<br>${fieldCrop}`,
            { permanent: false, direction: 'center' }
          );

          polygon.on('click', () => {
            this.selectedField = field || null;
            this.insuranceClaims = [];
            this.getInsuranceClaimsForField(fieldId);

            console.log("Geselecteerd veld:", this.selectedField);

          });

        } else {
          console.error(`Geen hoeken gevonden voor veld ${fieldId}`);
        }
      });
    }
  }

  private getInsuranceClaimsForField(fieldId: number): void {
    if (this.selectedField) {
      this.insuranceFormService.getInsuranceClaimsByFieldId(fieldId).subscribe(
        (insuranceClaims) => {
          if (insuranceClaims.length > 0) {
            this.insuranceClaims = insuranceClaims;
            console.log("Insurance claims", this.insuranceClaims)
          }
        }
      )
    }
  }
}