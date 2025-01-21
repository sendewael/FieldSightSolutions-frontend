import { Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import "leaflet/dist/leaflet.css"
import { PerceelknopComponent } from '../../components/perceelknop/perceelknop.component';
import { FieldResponsetDto } from '../../api/dtos/Field/Field-response-dto';
import { FieldService } from '../../api/services/field/field.service';
import { CornerService } from '../../api/services/corner/corner.service';
import { CommonModule } from '@angular/common';
import { UserFieldService } from '../../api/services/userField/user-field.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { UserFieldRequestDto } from '../../api/dtos/UserField/UserField-request-dto';
import { Router, RouterModule } from '@angular/router';
import { UserFieldResponseDto } from '../../api/dtos/UserField/UserField-response-dto';
import { UserResponseDto } from '../../api/dtos/User/User-response-dto';
import { UserService } from '../../api/services/user/user.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [PerceelknopComponent, CommonModule, FormsModule, ModalComponent, ConfirmModalComponent, RouterModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {

  public map: L.Map | undefined;
  public polygons: L.Polygon[] = [];
  public isOpen: boolean = true;
  public isEdit: boolean = false;
  public messageModal: boolean = false;
  public confirmMessageModal: boolean = false;
  public newField: boolean = false;
  public noUserFields: boolean = false;
  public selectedField: FieldResponsetDto | null = null;
  public selectedNewField: FieldResponsetDto | null = null;
  public highlightedPolygon: L.Polygon | null = null;
  public filterText: string = '';
  public userId: number = 0
  public modalMessage: string = "";
  public confirmModalMessage: string = "";
  public isLoading: boolean = true;
  public mapCenter: [number, number] = [51.1620, 4.9910];
  public firstCorner: [number, number] | null = null;
  private totalFieldsToDraw: number = 0;
  private fieldsDrawn: number = 0;
  public tempField: any;
  public manageAccess: boolean = false;
  public emailPermissionUser: string = ""


  public userFieldsTable: UserFieldResponseDto[] = [];
  public loggedInUser: UserResponseDto | null = null;
  public userRole: number = 0;

  percelen: FieldResponsetDto[] = [];
  userPercelen: FieldResponsetDto[] = [];
  allGrantedUsers: UserResponseDto[] = [];

  constructor(
    private fieldService: FieldService,
    private userFieldService: UserFieldService,
    private cornerService: CornerService,
    private userService: UserService,
    private router: Router
  ) { }

  // -------------------------------------------------------------- //

  // Start op app run, check of user ingelogd is
  // Ja: loadUserFields
  // Nee: ga naar login pagina
  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      this.userId = user.id;
      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.userRole = user.userRole_id
        }
      })
      this.userService.getUsersByRoleIds([2, 3, 4]).subscribe({
        next: (users) => {
          this.allGrantedUsers = users;
          console.log(this.allGrantedUsers)
        }
      })
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Wordt 1x gerunned na component render
  ngAfterViewInit(): void {
    this.initMap();
    this.loadUserFields(this.userId)
  }

  // Wordt gerunned als er genavigeerd wordt naar andere route
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  // -------------------------------------------------------------- //

  // Deze functie maakt de map (Geen percelen)
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

    this.map.on('move', () => {
      const center = this.map?.getCenter();
      if (center) {
        this.mapCenter = [center.lat, center.lng];
      }
    });
  }

  // Deze functie checkt of de ingelogde user percelen heeft
  // Ja: drawUserFieldsOnMap
  // Nee: drawFieldsOnMap
  private loadUserFields(userId: number): void {
    this.isLoading = true;
    this.userFieldService.getUserFieldsByUserId(userId).subscribe(
      (userFields) => {
        this.userFieldsTable = userFields
        console.log("UserFields ", this.userFieldsTable)
        const fieldIds = userFields.map(uf => uf.field);
        this.fieldService.getFieldsByFieldIds(fieldIds).subscribe({
          next: (fields) => {
            console.log(fields)
            this.userPercelen = fields;
            if (this.userPercelen.length < 1) {
              console.log("er zijn geen velden");
              this.noUserFields = true;
              this.newField = true;
              this.drawFieldsOnMap();
            } else {
              console.log("er zijn velden");
              this.noUserFields = false;
              this.drawUserFieldsOnMap();
            }
          },
          error: (error) => {
            console.error('getFields() returned niks', error);
          }
        });
      },
      (error) => {
        console.error('getUserFieldsByUserId() returned niks', error);
      }
    );
  }

  // -------------------------------------------------------------- //

  // Deze functie zet de polygons op de map voor de userFields
  private drawUserFieldsOnMap(): void {
    this.clearPolygonsOffMap()
    this.userPercelen.forEach(field => {
      this.drawPolygonForField(
        field.id,
        'blue',
        'lightblue',
        id => this.focusOnField(id)
      );
    });
    this.isLoading = false;
  }

  // Deze functie zet de polygons voor alle fields op de map
  private drawFieldsOnMap(): void {
    this.clearPolygonsOffMap()
    this.isLoading = true;
    this.fieldsDrawn = 0;
    this.totalFieldsToDraw = 0;
    // Deze code moet veranderd worden met de getFieldsInRadius()
    const [lat, lng] = this.mapCenter;
    this.fieldService.getFieldsInRadius(lat, lng, 1).subscribe({
      next: (fields) => {
        this.percelen = fields;
        console.log(this.percelen)
        this.totalFieldsToDraw = this.percelen.length;
        this.userFieldService.getUserFields().subscribe({
          next: (userFields) => {
            this.percelen.forEach(field => {
              const isAssigned = userFields.some(uf => uf.field === field.id);
              const fieldColor = isAssigned ? 'grey' : 'blue';
              const fillColor = isAssigned ? 'lightgrey' : 'lightblue';

              this.drawPolygonForField(
                field.id,
                fieldColor,
                fillColor,
                id => this.focusOnNewField(id)
              );

            });
          },
          error: (err) => {
            console.error('Error loading user fields', err);
          },
        });
      },
      error: (err) => {
        console.error('Error loading fields in radius', err);
      },
    });
  }

  // Deze functie tekent de polygons voor de map
  private drawPolygonForField(fieldId: number, color: string, fillColor: string, onClickHandler: (id: number) => void): void {
    this.cornerService.getCornersByFieldId(fieldId).subscribe(corners => {
      if (this.map && corners && corners.length > 0) {

        if (this.firstCorner == null && this.userPercelen.length > 0) {
          this.firstCorner = [
            parseFloat(corners[0].xCord),
            parseFloat(corners[0].yCord)
          ];
          this.map.setView(this.firstCorner, 13);
        }

        const polygonCoords: [number, number][] = corners.map(corner => [
          parseFloat(corner.xCord),
          parseFloat(corner.yCord),
        ]);

        const polygon = L.polygon(polygonCoords, {
          color: color,
          fillColor: fillColor,
          fillOpacity: 0.5,
        });

        polygon.addTo(this.map);
        this.polygons.push(polygon);

        polygon.on('click', () => onClickHandler(fieldId));

        this.fieldsDrawn++;

        if (this.fieldsDrawn === this.totalFieldsToDraw) {
          this.isLoading = false;
        }

      } else {
        console.error('Error bij het laden van de map, of corners:\ncorners:\n', corners, '\nmap:\n', this.map);
      }
    });
  }

  // Deze functie verwijderd alle polygons van de map
  private clearPolygonsOffMap() {
    this.polygons.forEach(polygon => polygon.remove());
    this.polygons = [];
  }

  // -------------------------------------------------------------- //

  // Deze functie gaat op de map naar het perceel dat geselecteerd is.
  focusOnField(fieldId: number): void {
    this.cornerService.getCornersByFieldId(fieldId).subscribe({
      next: (corners) => {
        if (corners.length > 0) {
          this.setMapCenterFromCorners(corners);
        }
      },
      error: (error) => {
        console.error('Error fetching corners', error);
      }
    });


    const selectedField = this.userPercelen.find(perceel => perceel.id === fieldId);
    if (selectedField) {
      this.selectedField = selectedField;
      this.highlightField(fieldId);
    }

    this.isOpen = true;
  }

  // Deze functie gaat op de map naar het perceel dat geselecteerd is voor nieuwe percelen.
  focusOnNewField(fieldId: number): void {
    this.userFieldService.getUserFields().subscribe({
      next: (userFields) => {
        const isAssigned = userFields.some(uf => uf.field === fieldId);
        if (!isAssigned) {
          this.cornerService.getCornersByFieldId(fieldId).subscribe({
            next: (corners) => {
              if (corners.length > 0) {
                this.setMapCenterFromCorners(corners);
              }
            },
            error: (error) => {
              console.error('Error fetching corners', error);
            }
          });

          const selectedNewField = this.percelen.find(perceel => perceel.id === fieldId);
          if (selectedNewField) {
            this.selectedNewField = selectedNewField;
            this.highlightField(fieldId);
          }
        } else {
          this.modalMessage = "Dit perceel is al toegewezen! Gelieve een ander perceel te selecteren.";
          this.openModal();
        }
      },
      error: (error) => {
        console.error('Error loading user fields', error);
      }
    });
  }

  highlightField(fieldId: number): void {
    if (this.map) {
      if (this.highlightedPolygon) {
        this.map.removeLayer(this.highlightedPolygon);
        this.highlightedPolygon = null;
      }
      this.cornerService.getCornersByFieldId(fieldId).subscribe(corners => {
        if (this.map && corners && corners.length > 0) {
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
      });
    }
  }

  private setMapCenterFromCorners(corners: { xCord: string, yCord: string }[]): void {
    let sumX = 0;
    let sumY = 0;

    corners.forEach(corner => {
      sumX += parseFloat(corner.xCord);
      sumY += parseFloat(corner.yCord);
    });

    const centerX = sumX / corners.length;
    const centerY = sumY / corners.length;

    if (this.map) {
      this.map.setView([centerX, centerY], 16);
    }
  }

  openModal() {
    this.messageModal = !this.messageModal
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  // -------------------------------------------------------------- //

  openPerceelToevoegen(): void {
    this.newField = !this.newField
    if (!this.newField) {
      this.drawUserFieldsOnMap();
      this.wisGeselecteerdPerceel();
    } else {
      this.drawFieldsOnMap();
    }
  }

  perceelLandbouwerToevoeging(userId: number | undefined, fieldId: number | undefined): void {
    if (userId !== undefined && fieldId !== undefined) {
      const userField: UserFieldRequestDto = {
        user: userId,
        field: fieldId,
        is_active: false
      };

      this.userFieldService.addUserField(userField).subscribe({
        next: (response) => {
          console.log(response);
          if (this.selectedNewField) {
            console.log(this.selectedNewField);
            this.fieldService.updateField(fieldId, this.selectedNewField).subscribe({
              next: (updatedField) => {
                console.log("Field updated successfully:", updatedField);
              },
              error: (error) => {
                console.error("Error updating field:", error);
              }
            });
          }

          this.openPerceelToevoegen();
          this.loadUserFields(this.userId);
          this.drawUserFieldsOnMap();
        },
        error: (error) => {
          console.error('Error adding user field', error);
        }
      });
    }
  }

  wisGeselecteerdPerceel(): void {
    this.selectedField = null
    this.selectedNewField = null
    if (this.highlightedPolygon) {
      if (this.map) {
        this.map.removeLayer(this.highlightedPolygon);
      }
      this.highlightedPolygon = null;
    }
  }

  // -------------------------------------------------------------- //

  editPerceel(): void {
    this.tempField = { ...this.selectedField };
    this.isEdit = true;
  }

  cancelEditPerceel() {
    this.isEdit = false;
  }

  confirmEditPerceel(): void {
    this.selectedField = { ...this.tempField };
    this.isEdit = false;
    if (this.selectedField) {
      this.fieldService.updateField(this.selectedField.id, this.selectedField).subscribe({
        next: (updatedField) => {
          console.log('Field updated successfully:', updatedField);
        },
        error: (error) => {
          console.error('Error updating field:', error);
        }
      });
    }
    this.loadUserFields(this.userId)
    this.isEdit = false;
  }

  // -------------------------------------------------------------- //

  deleteUserField(): void {
    this.confirmMessageModal = true;
  }

  confirmDeleteUserField(fieldId: number): void {
    this.userFieldService.getUserFieldByFieldId(fieldId).subscribe({
      next: (userFields) => {
        const oneUserField = userFields[0];
        if (oneUserField) {
          this.userFieldService.deleteUserField(oneUserField.id).subscribe({
            next: () => {
              this.wisGeselecteerdPerceel();
              this.loadUserFields(this.userId);
              this.closeConfirmModal();
            },
            error: (error) => {
              console.error('Error deleting user field', error);
            }
          });
        } else {
          console.log('No user field found with that fieldId');
        }
      },
      error: (error) => {
        console.error('Error fetching user field', error);
      }
    });
  }

  closeConfirmModal(): void {
    this.confirmMessageModal = false;
  }

  // -------------------------------------------------------------- //

  // Deze functie wordt gebruikt bij de "Mijn percelen" filter
  get filteredUserPercelen() {
    return this.userPercelen.filter(perceel =>
      perceel.name.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.municipality.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.postalcode.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.crop.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  // -------------------------------------------------------------- //

  toggleToegangBeheren(): void {
    this.manageAccess = !this.manageAccess
  }

  // giveGlobalPermission(): void {
  //   this.userPercelen.forEach((userField) => {
  //     const updatedEmailList = [...userField.email, this.emailPermissionUser];

  //     this.userFieldService.updateUserField(userField.id, { ...userField, email: updatedEmailList }).subscribe({
  //       next: () => {
  //         console.log(`User field with id ${userField.id} updated successfully.`);
  //       },
  //       error: (error) => {
  //         console.error(`Failed to update user field with id ${userField.id}.`);
  //       },
  //     });
  //   });
  // }

  // -------------------------------------------------------------- //

  navigateToSchadeclaim(fieldId: number): void {
    this.router.navigate(['/schadeclaim'], { queryParams: { fieldId: fieldId } });
  }
}
