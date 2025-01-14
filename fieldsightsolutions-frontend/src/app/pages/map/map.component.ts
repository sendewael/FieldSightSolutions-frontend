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
import { UserFieldService } from '../../api/services/userField/user-field.service';
import { UserService } from '../../api/services/user/user.service';
import { FormsModule } from '@angular/forms';
import { FieldCropService } from '../../api/services/fieldCrop/field-crop.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [PerceelknopComponent, CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {

  private map: L.Map | undefined;
  public isOpen: boolean = true;
  public messageModal: boolean = false;
  public nieuwPerceel: boolean = false;
  public geenPercelen: boolean = false;
  public geselecteerdPerceel: FieldResponsetDto | null = null;
  public geselecteerdNewPerceel: FieldResponsetDto | null = null;
  private highlightedPolygon: L.Polygon | null = null;

  // Hier moet dynamic userId ingestoken worden a.d.h.v. wie ingelogd is
  public userId = 1;


  crops: CropResponseDto[] = [];
  percelen: FieldResponsetDto[] = [];
  userPercelen: FieldResponsetDto[] = [];

  constructor(private fieldService: FieldService, private userFieldService: UserFieldService, private userService: UserService, private cornerService: CornerService, private cropService: CropService, private fieldCropService: FieldCropService) { }

  ngOnInit(): void {
    this.percelen = this.fieldService.getFields()
    this.crops = this.cropService.getCrops()
    this.loadUserFields(this.userId)
  }

  // Bij opstart wordt deze functie gerunned. Hier wordt de userId gecheckt en dan wordt er uit UserFields de rows gehaald met die userId
  // dan worden de fieldIds eruit gehaald, dan wordt via fieldService de fields opgehaald met die Id en in userPercelen gestoken 
  private loadUserFields(userId: number): void {
    const userFields = this.userFieldService.getUserFieldsByUserId(userId);
    const fieldIds = userFields.map(uf => uf.fieldId);
    this.userPercelen = this.fieldService.getFields().filter(field => fieldIds.includes(field.id));
    if (this.userPercelen.length < 1) {
      this.geenPercelen = true
    } else {
      this.geenPercelen = false
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
    if (this.userPercelen.length < 1) {
      this.nieuwPerceel = true
      this.geenPercelen = true
      this.drawFieldsOnMap()
    } else {
      this.drawUserFieldsOnMap();
    }
  }

  // deze functie maakt de map, zonder percelen. Puur de map
  private initMap(): void {
    this.map = L.map('map', {
      center: [51.1620, 4.9910],
      zoom: 16,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  // Deze functie tekent de polygons voor de percelen die bij de user horen
  private drawUserFieldsOnMap(): void {
    if (!this.map) return;
    console.log(this.userPercelen)

    this.userPercelen.forEach(field => {
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

        if (this.map) {
          polygon.on('click', () => {
            this.focusOnField(field.id);
          });
        }
      }
    });
  }

  // Deze functie tekent alle percelen die in de db staan.
  private drawFieldsOnMap(): void {
    if (!this.map) return;

    const userFields = this.userFieldService.getUserFields();

    this.percelen.forEach(field => {
      const isAssigned = userFields.some(uf => uf.fieldId === field.id);
      const fieldColor = isAssigned ? 'grey' : 'blue';
      const fillColor = isAssigned ? 'lightgrey' : 'lightblue';

      const corners = this.cornerService.getCornersByFieldId(field.id);

      if (corners && corners.length > 0) {
        const polygonCoords: [number, number][] = corners.map(corner => [
          parseFloat(corner.xCord),
          parseFloat(corner.yCord),
        ]);

        const polygon = L.polygon(polygonCoords, {
          color: fieldColor,
          fillColor: fillColor,
          fillOpacity: 0.5,
        });

        if (this.map) {
          polygon.addTo(this.map);
        }

        if (this.map) {
          polygon.on('click', () => {
            this.focusOnNewField(field.id);
          });
        }
      }
    });
  }

  // Deze functie zorgt ervoor als er op terug geklikt wordt vanuit "Nieuw perceel toevoegen" dat terug enkel de user percelen
  // getoond worden
  private resetToUserFields(): void {
    if (!this.map) return;

    this.map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        this.map?.removeLayer(layer);
      }
    });

    this.drawUserFieldsOnMap();
  }

  // Deze functie maakt de geselecteerde polygon (perceel) rood
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
  }

  // Deze functie gaat op de map naar het perceel dat geselecteerd is.
  focusOnField(fieldId: number): void {
    const corners = this.cornerService.getCornersByFieldId(fieldId);
    // if (corners.length > 0) {
    //   const firstCorner = corners[0];
    //   const x = parseFloat(firstCorner.xCord);
    //   const y = parseFloat(firstCorner.yCord);

    if (corners.length > 0) {
      let sumX = 0;
      let sumY = 0;

      corners.forEach(corner => {
        sumX += parseFloat(corner.xCord);
        sumY += parseFloat(corner.yCord);
      });

      const centerX = sumX / corners.length;
      const centerY = sumY / corners.length;

      if (this.map) {
        this.map.setView([centerX, centerY], 30);
      }
    }

    const geselecteerdPerceel = this.userPercelen.find(perceel => perceel.id === fieldId);
    if (geselecteerdPerceel) {
      this.geselecteerdPerceel = geselecteerdPerceel;
      this.highlightField(fieldId);
    }
    console.log(geselecteerdPerceel)

    this.isOpen = true
  }

  // Deze functie gaat op de map naar het perceel dat geselecteerd is voor nieuwe percelen.
  focusOnNewField(fieldId: number): void {
    const userFields = this.userFieldService.getUserFields();
    const isAssigned = userFields.some(uf => uf.fieldId === fieldId);
    if (!isAssigned) {
      const corners = this.cornerService.getCornersByFieldId(fieldId);
      if (corners.length > 0) {
        let sumX = 0;
        let sumY = 0;

        corners.forEach(corner => {
          sumX += parseFloat(corner.xCord);
          sumY += parseFloat(corner.yCord);
        });

        const centerX = sumX / corners.length;
        const centerY = sumY / corners.length;

        if (this.map) {
          this.map.setView([centerX, centerY], 30);
        }
      }

      const geselecteerdNewPerceel = this.percelen.find(perceel => perceel.id === fieldId);

      if (geselecteerdNewPerceel) {
        this.geselecteerdNewPerceel = geselecteerdNewPerceel;
        this.highlightField(fieldId);
      }
      console.log(geselecteerdNewPerceel)
    } else {
      this.openModal()
      console.log("Perceel is al toegewezen (fieldId in UserFields)")
    }
  }

  openModal() {
    this.messageModal = !this.messageModal
  }

  openPerceelToevoegen(): void {
    this.nieuwPerceel = !this.nieuwPerceel
    if (!this.nieuwPerceel) {
      this.resetToUserFields();
      this.wisGeselecteerdPerceel();
    } else {
      this.drawFieldsOnMap();
    }
  }

  wisGeselecteerdPerceel(): void {
    this.geselecteerdPerceel = null
    this.geselecteerdNewPerceel = null
    console.log(this.geselecteerdNewPerceel)
    if (this.highlightedPolygon) {
      if (this.map) {
        this.map.removeLayer(this.highlightedPolygon);
      }
      this.highlightedPolygon = null;
    }
  }

  perceelLandbouwerToevoeging(userId: number | undefined, fieldId: number | undefined): void {
    if (userId !== undefined && fieldId !== undefined) {
      this.userFieldService.addUserField(userId, fieldId);

      if (this.geselecteerdNewPerceel) {
        this.fieldService.updateField(fieldId, this.geselecteerdNewPerceel)
      }
      console.log(this.geselecteerdNewPerceel)

      this.openPerceelToevoegen()
      this.loadUserFields(this.userId)
      this.drawUserFieldsOnMap()
    }
  }


  deleteUserField(fieldId: number): void {
    const oneUserField = this.userFieldService.getUserFieldByFieldId(fieldId)
    if (oneUserField) {
      this.userFieldService.deleteUserField(oneUserField.id)
    }
    this.wisGeselecteerdPerceel()
    this.loadUserFields(this.userId)
    this.drawUserFieldsOnMap()
  }
}
