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
import { forkJoin } from 'rxjs';
import { WeatherModalComponent } from '../../components/weather-modal/weather-modal.component';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    PerceelknopComponent,
    CommonModule,
    FormsModule,
    ModalComponent,
    ConfirmModalComponent,
    RouterModule,
    WeatherModalComponent,
    LoaderComponent,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {

  public map: L.Map | undefined;
  public polygons: L.Polygon[] = [];
  public highlightedPolygons: L.Polygon[] = [];
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
          this.allGrantedUsers = users.sort((a, b) => a.firstName.localeCompare(b.firstName));
        },
        error: (err) => {
          console.log(err)
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
        const fieldIds = userFields.map(uf => uf.field);
        this.fieldService.getFieldsByFieldIds(fieldIds).subscribe({
          next: (fields) => {
            this.userPercelen = fields;
            if (this.userPercelen.length < 1) {
              this.noUserFields = true;
              this.newField = true;
              this.drawFieldsOnMap();
            } else {
              this.noUserFields = false;
              if (!this.selectedField) {
                this.drawUserFieldsOnMap();
              } else {
                this.isLoading = false;
              }
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
        if (!fields || fields.length === 0) {
          this.isLoading = false;
        }
        this.percelen = fields;
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
    this.highlightedPolygons.forEach(polygon => polygon.remove());
    this.polygons = [];
    this.highlightedPolygons = [];
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
      console.log(this.selectedField)
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
          this.highlightedPolygons.push(this.highlightedPolygon);
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
        grantedEmails: [],
      };

      this.userFieldService.addUserField(userField).subscribe({
        next: (response) => {
          if (this.selectedNewField) {
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



  // -------------------------------------------------------------- //

  public removedGlobalEmails: string[] = []

  toggleToegangBeheren(): void {
    this.manageAccess = !this.manageAccess
    this.loadUserFields(this.userId)
    this.loadEmails()
  }

  addEmailToList(): void {
    if (this.emailPermissionUser && !this.globalEmailList.includes(this.emailPermissionUser)) {
      this.globalEmailList.push(this.emailPermissionUser);
      this.emailPermissionUser = '';
    }
  }

  removeEmail(index: number): void {
    const removedEmail = this.globalEmailList.splice(index, 1)[0];
    if (removedEmail && !this.removedGlobalEmails.includes(removedEmail)) {
      this.removedGlobalEmails.push(removedEmail); // Track the removed email
    }
  }

  public globalEmailList: string[] = [];

  loadEmails(): void {
    if (this.userFieldsTable.length > 0) {
      // Start with all grantedEmails from all userFields
      const allEmails = this.userFieldsTable
        .filter((userField) => userField.grantedEmails) // Ignore fields with no grantedEmails
        .map((userField) => userField.grantedEmails);

      if (allEmails.length > 0) {
        // Find the intersection of all grantedEmails arrays
        this.globalEmailList = allEmails.reduce((commonEmails, currentEmails) =>
          commonEmails.filter((email) => currentEmails.includes(email))
        );
      } else {
        this.globalEmailList = [];
      }
    } else {
      this.globalEmailList = [];
    }

    // Filter out any emails that were removed globally
    this.globalEmailList = this.globalEmailList.filter(
      (email) => !this.removedGlobalEmails.includes(email)
    );
  }

  giveGlobalPermission(): void {
    const updateObservables = this.userFieldsTable.map((userField) => {
      // 1. Keep only field-specific emails (emails not in globalEmailList or removedGlobalEmails)
      const fieldSpecificEmails = userField.grantedEmails?.filter(
        (email) => !this.globalEmailList.includes(email) && !this.removedGlobalEmails.includes(email)
      ) || [];

      // 2. Combine field-specific emails with globalEmailList (added or removed)
      const updatedEmails = Array.from(new Set([...fieldSpecificEmails, ...this.globalEmailList]));

      // 3. Update the user field with the new list of grantedEmails
      return this.userFieldService.updateUserField(userField.id, {
        ...userField,
        grantedEmails: updatedEmails,
      });
    });

    forkJoin(updateObservables).subscribe({
      next: () => {
        this.loadUserFields(this.userId);
        this.loadEmails();
        this.removedGlobalEmails = []; // Clear the removed emails after updating
        this.toggleToegangBeheren();
      },
      error: (err) => {
        console.error("Error updating user fields:", err);
      },
    });
  }






  // -------------------------------------------------------------- //

  public showFieldAccess: boolean = false
  public singleFieldEmailList: any[] = []
  public selectedUserField: UserFieldResponseDto | null = null;

  addEmailToSingleFieldList(): void {
    if (this.emailPermissionUser && !this.singleFieldEmailList.includes(this.emailPermissionUser)) {
      this.singleFieldEmailList.push(this.emailPermissionUser);
      this.emailPermissionUser = '';
    }
  }

  removeEmailSingleFieldList(index: number): void {
    this.singleFieldEmailList.splice(index, 1);
  }

  loadSingleFieldEmails(): void {
    if (this.selectedField) {
      this.userFieldService.getUserFieldByFieldId(this.selectedField.id).subscribe({
        next: (response) => {
          this.selectedUserField = response[0];
          this.singleFieldEmailList = response.flatMap(item => item.grantedEmails || []);
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
    }
  }

  toggleFieldAccess(): void {
    this.loadUserFields(this.userId)
    this.loadSingleFieldEmails()
    this.showFieldAccess = !this.showFieldAccess
  }

  giveSingleFieldPermission(): void {
    if (this.selectedUserField) {
      const updateObservable = this.userFieldService.updateUserField(
        this.selectedUserField.id,
        { ...this.selectedUserField, grantedEmails: this.singleFieldEmailList }
      );

      updateObservable.subscribe({
        next: () => {
          this.loadUserFields(this.userId);
          this.loadSingleFieldEmails();
          this.toggleFieldAccess();
        },
        error: (err) => {
          console.error("Error updating user field:", err);
        }
      });
    }
  }




  // -------------------------------------------------------------- //


  // -------------------------------------------------------------- //

  navigateToSchadeclaim(fieldId: number): void {
    this.router.navigate(['/schadeclaim'], { queryParams: { fieldId: fieldId } });
  }

  // -------------------------------------------------------------- //

  checkWeatherPrediction(): boolean {
    const weatherPredictions = ["Onweer", "Onweer met hagel", "Sneeuwbuien", "Regenbuien"];
    return this.userPercelen.some(perceel =>
      weatherPredictions.includes(perceel.prediction)
    );
  }

  toggleWarningFields(): void {
    this.warningFields = !this.warningFields
    this.loadUserFields(this.userId)
  }

  warningFields: boolean = false

  get filteredUserPercelen() {
    const filteredByText = this.userPercelen.filter(perceel =>
      perceel.name.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.municipality.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.postalcode.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.crop.toLowerCase().includes(this.filterText.toLowerCase())
    );

    if (this.warningFields) {
      return filteredByText.filter(perceel =>
        ['Onweer', 'Onweer met hagel', 'Sneeuwbuien', 'Regenbuien'].includes(perceel.prediction)
      );
    }

    return filteredByText;
  }

  // -------------------------------------------------------------- //
}
