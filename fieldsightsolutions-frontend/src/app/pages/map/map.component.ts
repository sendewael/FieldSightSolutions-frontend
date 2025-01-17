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
import { ModalComponent } from '../../components/modal/modal.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { SearchControl, OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { UserFieldResponseDto } from '../../api/dtos/UserField/UserField-response-dto';
import { UserFieldRequestDto } from '../../api/dtos/UserField/UserField-request-dto';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [PerceelknopComponent, CommonModule, FormsModule, ModalComponent, ConfirmModalComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {

  private map: L.Map | undefined;
  private polygons: L.Polygon[] = [];
  public isOpen: boolean = true;
  public isEdit: boolean = false;
  public messageModal: boolean = false;
  public confirmMessageModal: boolean = false;
  public nieuwPerceel: boolean = false;
  public geenPercelen: boolean = false;
  public geselecteerdPerceel: FieldResponsetDto | null = null;
  public geselecteerdNewPerceel: FieldResponsetDto | null = null;
  private highlightedPolygon: L.Polygon | null = null;
  public filterText: string = '';


  public modalMessage: string = "";
  public confirmModalMessage: string = "";


  // Hier moet dynamic userId ingestoken worden a.d.h.v. wie ingelogd is
  public userId = 2;

  public isLoading: boolean = true;



  crops: CropResponseDto[] = [];
  percelen: FieldResponsetDto[] = [];
  userPercelen: FieldResponsetDto[] = [];

  constructor(private fieldService: FieldService, private userFieldService: UserFieldService, private userService: UserService, private cornerService: CornerService, private cropService: CropService, private fieldCropService: FieldCropService) { }

  ngOnInit(): void {
    this.fieldService.getFields().subscribe(fields => {
      this.percelen = fields;
      console.log("lijn 59 = This percelen = ", this.percelen)
      this.loadUserFields(this.userId)
    });
  }

  get filteredUserPercelen() {
    return this.userPercelen.filter(perceel =>
      perceel.name.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.municipality.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.postalcode.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  // Bij opstart wordt deze functie gerunned. Hier wordt de userId gecheckt en dan wordt er uit UserFields de rows gehaald met die userId
  // dan worden de fieldIds eruit gehaald, dan wordt via fieldService de fields opgehaald met die Id en in userPercelen gestoken 
  private loadUserFields(userId: number): void {
    this.isLoading = true;

    this.userFieldService.getUserFieldsByUserId(userId).subscribe(
      (userFields) => {
        console.log("lijn 77 userFields", userFields);

        const fieldIds = userFields.map(uf => uf.field);

        this.fieldService.getFields().subscribe(fields => {
          this.userPercelen = fields.filter(field => fieldIds.includes(field.id));

          if (this.userPercelen.length < 1) {
            this.geenPercelen = true;
            this.nieuwPerceel = true;
            this.drawFieldsOnMap();
          } else {
            this.geenPercelen = false;
            this.drawUserFieldsOnMap();
          }

          this.isLoading = false;

          console.log("lijn 94 length ", this.userPercelen.length);
        }, (error) => {
          console.error('Error loading fields', error);
        });

      },
      (error) => {
        console.error('Error loading user fields', error);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }


  // deze functie maakt de map, zonder percelen. Puur de map
  private initMap(): void {
    this.map = L.map('map', {
      center: [51.1620, 4.9910],
      zoom: 16,
      zoomControl: false
    });

    L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg', {
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    L.control.zoom({
      position: 'topleft'
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

  // Deze functie tekent de polygons voor de percelen die bij de user horen
  private drawUserFieldsOnMap(): void {
    if (!this.map) return;

    this.polygons.forEach(polygon => polygon.remove());
    this.polygons = [];

    console.log("lijn 182", this.userPercelen);

    this.userPercelen.forEach(field => {
      this.cornerService.getCornersByFieldId(field.id).subscribe(corners => {
        console.log("lijn 196 corners ", corners);

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

          this.polygons.push(polygon);

          if (this.map) {
            polygon.on('click', () => {
              this.focusOnField(field.id);
            });
          }
        }
      });
    });
  }

  // Deze functie tekent alle percelen die in de db staan.
  private drawFieldsOnMap(): void {
    if (!this.map) return;

    this.polygons.forEach(polygon => polygon.remove());
    this.polygons = [];

    // Subscribe to the userFields Observable to get the data
    this.userFieldService.getUserFields().subscribe(
      (userFields) => {
        console.log("lijn 184 - ", this.percelen);

        // Now that we have the actual userFields array, we can use 'some'
        this.percelen.forEach(field => {
          const isAssigned = userFields.some(uf => uf.field === field.id);
          const fieldColor = isAssigned ? 'grey' : 'blue';
          const fillColor = isAssigned ? 'lightgrey' : 'lightblue';

          // Subscribe to the Observable returned by getCornersByFieldId
          this.cornerService.getCornersByFieldId(field.id).subscribe(corners => {
            console.log("ik zoek corner", field.id)
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

              this.polygons.push(polygon);

              if (this.map) {
                polygon.on('click', () => {
                  this.focusOnNewField(field.id);
                });
              }
            }
          });
        });
      },
      (error) => {
        console.error('Error loading user fields', error);
      }
    );
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

  highlightField(fieldId: number): void {
    if (!this.map) return;

    if (this.highlightedPolygon) {
      this.map.removeLayer(this.highlightedPolygon);
      this.highlightedPolygon = null;
    }

    this.cornerService.getCornersByFieldId(fieldId).subscribe(corners => {
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

        if (this.map) {
          this.highlightedPolygon.addTo(this.map);
        }
      }

    });
  }




  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  // Deze functie gaat op de map naar het perceel dat geselecteerd is.
  focusOnField(fieldId: number): void {
    this.cornerService.getCornersByFieldId(fieldId).subscribe(
      (corners) => {
        // Ensure there are corners available
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
      },
      (error) => {
        console.error('Error fetching corners', error);
      }
    );

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
    this.userFieldService.getUserFields().subscribe(
      (userFields) => {
        const isAssigned = userFields.some(uf => uf.field === fieldId);
        if (!isAssigned) {
          this.cornerService.getCornersByFieldId(fieldId).subscribe(
            (corners) => {
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
            }
          )

          const geselecteerdNewPerceel = this.percelen.find(perceel => perceel.id === fieldId);

          if (geselecteerdNewPerceel) {
            this.geselecteerdNewPerceel = geselecteerdNewPerceel;
            this.highlightField(fieldId);
          }
          console.log(geselecteerdNewPerceel);
        } else {
          this.modalMessage = "Dit perceel is al toegewezen! Gelieve een ander perceel te selecteren.";
          this.openModal();
          console.log("Perceel is al toegewezen (fieldId in UserFields)");
        }
      },
      (error) => {
        console.error('Error loading user fields', error);
      }
    );
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
      const userField: UserFieldRequestDto = {
        user: userId,
        field: fieldId,
        is_active: true
      };

      this.userFieldService.addUserField(userField).subscribe(
        (response) => {
          console.log('User field added:', response);

          if (this.geselecteerdNewPerceel) {
            this.fieldService.updateField(fieldId, this.geselecteerdNewPerceel);
          }

          console.log(this.geselecteerdNewPerceel);

          this.openPerceelToevoegen();
          this.loadUserFields(this.userId);
          this.drawUserFieldsOnMap();
        },
        (error) => {
          console.error('Error adding user field', error);
        }
      );
    }
  }

  deleteUserField(): void {
    this.confirmMessageModal = true;
  }

  confirmDeleteUserField(fieldId: number): void {
    this.userFieldService.getUserFieldByFieldId(fieldId).subscribe(
      (userFields) => {

        const oneUserField = userFields[0];
        if (oneUserField) {
          console.log("lijn 551 ", oneUserField)
          this.userFieldService.deleteUserField(oneUserField.id).subscribe(
            () => {
              console.log(`User field with id ${oneUserField.id} deleted successfully`);
              this.wisGeselecteerdPerceel();
              this.loadUserFields(this.userId);
              this.closeConfirmModal();

              console.log("User field deleted and map updated");
            },
            (error) => {
              console.error('Error deleting user field', error);
            }
          );
        } else {
          console.log('No user field found with that fieldId');
        }
      },
      (error) => {
        console.error('Error fetching user field', error);
      }
    );
  }

  closeConfirmModal(): void {
    this.confirmMessageModal = false;
  }

  editPerceel(): void {
    this.isEdit = !this.isEdit
    console.log(this.isEdit)
    console.log(this.geselecteerdPerceel)
  }

  confirmEditPerceel(): void {
    console.log(this.geselecteerdPerceel)
    if (this.geselecteerdPerceel) {
      this.fieldService.updateField(this.geselecteerdPerceel.id, this.geselecteerdPerceel).subscribe(
        (updatedField) => {
          console.log('Field updated successfully:', updatedField);
        },
        (error) => {
          console.error('Error updating field:', error);
        }
      );
    }
    this.isEdit = false;
  }
}
