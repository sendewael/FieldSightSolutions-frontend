import { Component, ViewChild } from '@angular/core';
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
import { InsuranceFormService } from '../../api/services/insuranceForm/insurance-form.service';
import { InsuranceFormResponseDto } from '../../api/dtos/InsuranceForm/InsuranceForm-response-dto';
import { ClaimKnopComponent } from '../../components/claim-knop/claim-knop.component';
import { RequestedImageService } from '../../api/services/requestedImage/requestedImage.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { WeatherComponent } from '../../components/weather-vis/weather-vis.component';


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
    ClaimKnopComponent,
    ToastComponent,
    WeatherComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {

  // Map variablen
  public map: L.Map | undefined;
  public polygons: L.Polygon[] = [];
  public highlightedPolygon: L.Polygon | null = null;
  public highlightedPolygons: L.Polygon[] = [];
  public markers: L.Marker[] = [];
  public mapCenter: [number, number] = [51.1620, 4.9910];
  public firstCorner: [number, number] | null = null;
  private totalFieldsToDraw: number = 0;
  private fieldsDrawn: number = 0;
  public mapIsClickable = false;
  public blockMap: boolean = false;

  // Perceel variablen
  public newField: boolean = false;
  public noUserFields: boolean = false;
  public selectedField: FieldResponsetDto | null = null;
  public selectedNewField: FieldResponsetDto | null = null;
  public tempField: any;
  public userFieldsTable: UserFieldResponseDto[] = [];
  percelen: FieldResponsetDto[] = [];
  userPercelen: FieldResponsetDto[] = [];

  // Modal variablen
  public isOpen: boolean = true;
  public isEdit: boolean = false;
  public messageModal: boolean = false;
  public confirmMessageModal: boolean = false;
  public modalMessage: string = "";
  public confirmModalMessage: string = "";

  // User variablen
  public userId: number = 0
  public userRole: number = 0;
  public loggedInUser: UserResponseDto | null = null;

  // Variablen
  public filterText: string = '';
  public isLoading: boolean = true;
  public manageAccess: boolean = false;
  public emailPermissionUser: string = ""
  allGrantedUsers: UserResponseDto[] = [];
  insuranceClaimsForSingleField: InsuranceFormResponseDto[] = [];
  public removedGlobalEmails: string[] = []
  public globalEmailList: string[] = [];
  public showFieldAccess: boolean = false
  public singleFieldEmailList: any[] = []
  public selectedUserField: UserFieldResponseDto | null = null;
  warningFields: boolean = false

  public requestPhotoForClaim: boolean = false;
  public clickCoordinates: { x: string; y: string; description: string }[] = [];
  public selectedClaim: InsuranceFormResponseDto | null = null;

  // Toast
  @ViewChild('toast') toast!: ToastComponent;
  toastMessage: string = '';
  toastClass: string = 'bg-green-500';
  toastHover: string = 'bg-green-400';

  // Zelf perceel tekenen
  public controlsDrawn: boolean = false
  private drawControl: L.Control.Draw | null = null;
  private drawnItems: L.FeatureGroup = new L.FeatureGroup();
  private allowDrawing = false;

  public navigationState: any = {};

  constructor(
    private fieldService: FieldService,
    private userFieldService: UserFieldService,
    private cornerService: CornerService,
    private userService: UserService,
    private insuranceFormService: InsuranceFormService,
    private requestImageService: RequestedImageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  // --------------------------- ng Methodes ---------------------------- //

  // Start op app run, check of user ingelogd is
  // Ja: loadUserFields
  //     Haal user op via API call
  //     Steek user en zijn rol (landbouwer,verzekeraar,...) in variables
  //     Voer methode loadUserFields uit met ingelogde user als parameter
  //     Haal de users met een rol die !landbouwer is op via API call en steek in variable
  // Nee: ga naar login pagina
  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      this.userId = user.id;
      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.loggedInUser = user
          this.userRole = user.userRole_id
          this.loadUserFields(this.userId)
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

    this.navigationState = history.state;
    console.log(this.navigationState)
  }

  // Wordt 1x gerunned na component render en initialiseert de kaart
  ngAfterViewInit(): void {
    this.initMap();
  }

  // Wordt gerunned als er genavigeerd wordt naar andere route en verwijderd de kaart
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  // -------------------------- Initialisatie --------------------------- //

  private mapMoveTimeout: any;
  // Deze functie maakt de kaart (zonder polygons)
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
        console.log(this.mapCenter)
      }

      if (this.newField && !this.selectedNewField) {
        clearTimeout(this.mapMoveTimeout);
        this.mapMoveTimeout = setTimeout(() => {
          this.drawFieldsOnMap();
        }, 1000);
      }
    });

    // Als de "mapIsClickable" variable "true" is, kan er op de kaart geklikt worden
    // Elke klik plaatst een marker op de kaart, en stopt de x-y coordinaat in de clickCoordinates lijst
    // Dit wordt gebruikt bij het aanvragen van foto's op specifieke locaties
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      if (this.mapIsClickable && this.map) {
        const { lat, lng } = event.latlng;
        const newCoordinate = { x: lat.toString(), y: lng.toString(), description: '' };
        this.clickCoordinates.push(newCoordinate);

        const marker = L.marker([lat, lng]).addTo(this.map);
        marker.bindTooltip(`X: ${lat.toFixed(4)}, Y: ${lng.toFixed(4)}`).openTooltip();
        this.markers.push(marker);
      }
    });
  }

  // Deze functie checkt of de ingelogde user percelen heeft
  // Afhankelijk van welk type gebruiker ingelogd is, veranderd de functie
  // Als de ingelogde gebruiker een landbouwer is:
  //      Haal via een API call zijn percelen op
  //            Geen percelen: drawFieldsOnMap
  //            Wel percelen: steek deze in een lijst, drawUserFieldsOnMap
  // Als de ingelogde gebruiker geen landbouwer is:
  //      Haal via een API call percelen op waar hij toegang tot heeft
  //            Geen percelen: melding dat hij nog geen toegang tot percelen heeft
  //            Wel percelen: steek deze in een lijst, drawUserFieldsOnMap
  private loadUserFields(userId: number): void {
    this.isLoading = true;
    if (this.userRole === 1) {
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
                this.drawControls(true);
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
    } else if (this.userRole > 1) {
      if (this.loggedInUser) {
        this.userFieldService.getUserFieldsByEmail(this.loggedInUser.email).subscribe({
          next: (userFields) => {
            const fieldIds = userFields.map(uf => uf.field);
            this.fieldService.getFieldsByFieldIds(fieldIds).subscribe({
              next: (fields) => {
                this.userPercelen = fields;
                if (this.userPercelen.length < 1) {
                  this.noUserFields = true;
                  this.isLoading = false;
                } else {
                  this.noUserFields = false;
                  if (!this.selectedField) {
                    this.drawUserFieldsOnMap();
                  } else {
                    this.isLoading = false;
                  }
                }


                if (this.navigationState) {
                  const { fieldId, claimId, requestPhotos } = this.navigationState;
                  if (fieldId) {
                    this.isLoading = true;
                    this.focusOnField(fieldId).then(() => {
                      if (claimId) {
                        // Wait for selectClaim to finish before continuing
                        this.selectClaim(claimId).then(() => {
                          // After selectClaim is done
                          if (requestPhotos) {
                            this.requestPhoto();
                          }
                          this.isLoading = false; // Hide loading spinner after everything is completed
                        }).catch(error => {
                          console.error(error);
                          this.isLoading = false; // Hide loading spinner in case of error
                        });
                      } else {
                        this.isLoading = false; // Hide loading spinner if no claimId
                      }
                    }).catch(error => {
                      console.error("Error in focusOnField", error);
                      this.isLoading = false; // Hide loading spinner in case of error
                    });
                  }
                };
              },
              error: (error) => {
                console.error('getFields() returned niks', error);
              }
            });
          }
        })
      }
    }
  }

  // ------------------------- Polygons tekenen ------------------------- //
  private drawnPolygons: Map<number, L.Polygon> = new Map();
  private userFieldPolygons: Map<number, L.Polygon> = new Map();
  private allFieldPolygons: Map<number, L.Polygon> = new Map();

  private drawPolygonForField(
    fieldId: number,
    color: string,
    fillColor: string,
    onClickHandler: (id: number) => void,
    isUserField: boolean
  ): void {
    const targetMap = isUserField ? this.userFieldPolygons : this.allFieldPolygons;

    if (targetMap.has(fieldId)) {
      console.log(`Polygon for field ${fieldId} already drawn.`);
      this.fieldsDrawn++;
      return;
    }

    this.cornerService.getCornersByFieldId(fieldId).subscribe(corners => {
      if (this.map && corners && corners.length > 0) {
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
        targetMap.set(fieldId, polygon);

        const fieldName = this.userPercelen.find(field => field.id === fieldId)?.name || `Field ${fieldId}`;
        polygon.bindTooltip(fieldName, {
          permanent: false,
          direction: 'center',
        });

        polygon.on('click', () => onClickHandler(fieldId));

        this.fieldsDrawn++;

        if (this.fieldsDrawn === this.totalFieldsToDraw) {
          this.isLoading = false;
        }
      } else {
        console.error('Error loading map or corners:', corners, this.map);
      }
    });
  }

  private clearUserFieldPolygons(): void {
    this.userFieldPolygons.forEach(polygon => polygon.remove());
    this.userFieldPolygons.clear();
  }

  private clearAllFieldPolygons(): void {
    this.allFieldPolygons.forEach(polygon => polygon.remove());
    this.allFieldPolygons.clear();
  }

  private drawUserFieldsOnMap(): void {
    this.clearAllFieldPolygons();
    this.clearUserFieldPolygons() // Clear only user fields
    this.userPercelen.forEach(field => {
      this.drawPolygonForField(
        field.id,
        'green',
        'lightgreen',
        id => this.focusOnField(id),
        true // true indicates user field
      );
    });
    this.isLoading = false;
  }

  private drawFieldsOnMap(): void {
    console.log("!!! Draw fields on map called !!!");
    this.clearUserFieldPolygons(); // Clear only non-user fields
    this.isLoading = true;
    this.fieldsDrawn = 0;
    this.totalFieldsToDraw = 0;
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
              const fieldColor = isAssigned ? 'grey' : 'green';
              const fillColor = isAssigned ? 'lightgrey' : 'lightgreen';

              this.drawPolygonForField(
                field.id,
                fieldColor,
                fillColor,
                id => this.focusOnNewField(id),
                false // false indicates general field
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


  // ------------------------- Perceel Focus --------------------------- //

  // Deze functie gaat op de kaart naar het perceel dat geselecteerd is
  // Haal de hoeken van het perceel op, en gebruik deze coordinaten om de kaart hier naartoe te brengen
  focusOnField(fieldId: number): Promise<void> {
    return new Promise<void>((resolve) => {
      // Fetch corners for the map
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

      // Fetch insurance claims for user roles > 1
      if (this.userRole > 1) {
        this.isLoading = true;
        this.insuranceFormService.getInsuranceClaimsByFieldAndStatus(fieldId, 4).subscribe({
          next: (insuranceClaims) => {
            this.insuranceClaimsForSingleField = insuranceClaims;
            console.log(this.insuranceClaimsForSingleField);
            this.isLoading = false;
            resolve(); // Resolve when data is ready
          },
          error: (error) => {
            console.error(error);
            resolve(); // Resolve even on error
          }
        });
      } else {
        resolve(); // Resolve immediately for other roles
      }

      const selectedField = this.userPercelen.find(perceel => perceel.id === fieldId);
      if (selectedField) {
        this.selectedField = selectedField;
        this.highlightField(fieldId);
      }

      this.isOpen = true;
    });
  }


  // Deze functie gaat op de map naar het perceel dat geselecteerd is voor nieuwe percelen
  // Hetzelfde principe als bovenstaande functie
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
          this.blockMap = true;
          this.modalMessage = "Dit perceel is al toegewezen! Gelieve een ander perceel te selecteren.";
          this.openModal();
        }
      },
      error: (error) => {
        console.error('Error loading user fields', error);
      }
    });
  }

  // Deze functie zorgt ervoor dat de polygon van het geselecteerde perceel rood wordt
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

  // Deze functie zorgt voor de logica om de kaart naar het perceel te brengen
  // Het berekent het middelpunt van het geselecteerd perceel door een formule, en centreert de map hierop
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

  // Deze functie deselecteerd een perceel (bijv. als er op terug geklikt wordt)
  // De variables worden dan gereset
  wisGeselecteerdPerceel(): void {
    this.selectedField = null
    this.selectedNewField = null
    if (this.highlightedPolygon) {
      if (this.map) {
        this.map.removeLayer(this.highlightedPolygon);
      }
      this.highlightedPolygon = null;
    }
    if (this.userRole > 1) {
      this.insuranceClaimsForSingleField = [];
    }
  }

  // Deze functie opent de modal indien de gebruiker bij het toevoegen van een nieuw perceel
  // een perceel selecteerd dat al toegewezen is aan een landbouwer
  openModal() {
    this.messageModal = true;
  }

  closeModal() {
    this.messageModal = false;
    this.blockMap = false;
  }

  // ------------------------- Perceel tekenen ------------------------- //

  public newDrawnField: FieldRequestDto | null = null;
  public newDrawnCorners: CornerRequestDto[] = [];

  drawControls(add: boolean): void {
    if (this.map) {
      if (!this.map.hasLayer(this.drawnItems)) {
        this.map.addLayer(this.drawnItems);
      }

      if (add) {
        this.addDrawControl(true); // Initial control setup with polygon allowed
        this.allowDrawing = true;
      } else {
        if (this.drawControl) {
          this.map.removeControl(this.drawControl);
        }
        this.allowDrawing = false;
        this.drawnItems.clearLayers();
      }

      if (!this.map.hasEventListeners(L.Draw.Event.CREATED)) {
        this.map.on(L.Draw.Event.CREATED, (event: any) => {
          if (this.allowDrawing) {
            const layer = event.layer;
            this.drawnItems.addLayer(layer);
            this.handleDrawnPolygon(layer);

            layer.on('click', () => {
              this.wisGeselecteerdPerceel();
              const bounds = layer.getBounds();
              if (this.map) {
                this.map.fitBounds(bounds, {
                  padding: [50, 50],
                  maxZoom: 16,
                });
              }
              console.log('Polygon clicked and centered.');
            });

            // Remove the current draw control and re-add with polygon disabled
            if (this.drawControl && this.map) {
              this.map.removeControl(this.drawControl);
            }
            this.addDrawControl(false);
          }
        });

        // Handle polygon edits and update corners
        this.map.on(L.Draw.Event.EDITED, (event: any) => {
          event.layers.eachLayer((layer: any) => {
            this.handleDrawnPolygon(layer);
            console.log('Polygon edited and corners updated.');
          });
        });

        // Handle polygon deletions and allow drawing a new one
        this.map.on(L.Draw.Event.DELETED, () => {
          console.log('Polygon deleted. Drawing re-enabled.');
          this.addDrawControl(true); // Re-enable polygon drawing
          this.allowDrawing = true;
        });
      }
    }
  }

  private addDrawControl(enablePolygon: boolean): void {
    if (this.drawControl && this.map) {
      this.map.removeControl(this.drawControl);
    }

    this.drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polygon: enablePolygon ? {} : false,
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true, // Enable delete option
      },
    });

    if (this.map)
      this.map.addControl(this.drawControl);
  }

  private handleDrawnPolygon(layer: any): void {
    const latLngs = layer.getLatLngs();

    // Reset corners
    this.newDrawnCorners = latLngs[0].map((latLng: any, index: number) => ({
      field: 0,
      index: index,
      xCord: latLng.lat.toString(),
      yCord: latLng.lng.toString(),
    }));

    this.newDrawnField = {
      name: '',
      acreage: '',
      municipality: '',
      postalcode: '',
      crop: '',
    };

    console.log('Updated polygon corners:', this.newDrawnCorners);
  }


  addNewDrawnField(): void {
    if (this.newDrawnField) {
      this.fieldService.createField(this.newDrawnField).subscribe({
        next: (response) => {
          console.log("field created ", response)
          console.log(response.id)

          if (this.newDrawnCorners && this.newDrawnCorners.length > 0) {
            // Set the fieldId to the response.id (field ID from the newly created field)
            this.newDrawnCorners.forEach((corner) => {
              corner.field = response.id; // Assign the fieldId from the response
            });
            console.log(this.newDrawnCorners)

            // Send all corners in one request
            this.cornerService.createCorner(this.newDrawnCorners).subscribe({
              next: (cornerResponse) => {
                console.log("Corners created:", cornerResponse);
                const userField: UserFieldRequestDto = {
                  user: this.userId,
                  field: response.id,
                  grantedEmails: [],
                };

                this.userFieldService.addUserField(userField).subscribe({
                  next: (response) => {
                    console.log(response)
                    this.newDrawnField = null
                    this.newDrawnCorners = []
                    this.newField = false
                    this.loadUserFields(this.userId)
                    this.drawnItems.clearLayers();
                    this.drawControls(false);
                  },
                  error: (error) => {
                    console.error(error)
                  }
                })
              },
              error: (error) => {
                console.error("Error creating corners:", error);
              }
            });
          }


        },
        error: (error) => {
          console.error(error)
        }
      })
    }
  }

  // ------------------------ Perceel toevoegen ------------------------ //

  // Deze functie zorgt voor het kunnen toevoegen van een nieuw perceel
  openPerceelToevoegen(): void {
    this.newField = !this.newField
    if (!this.newField) {
      this.drawUserFieldsOnMap();
      this.wisGeselecteerdPerceel();
      // Zelf perceel tekenen
      this.drawControls(false);
      this.newDrawnField = null
      this.newDrawnCorners = []
    } else {
      this.drawFieldsOnMap();
      // Zelf perceel tekenen
      this.drawControls(true);
    }

  }

  // Als de user een nieuw perceel gekozen heeft en dit toevoegd, wordt deze functie gebruikt
  // Hierin wordt een API call gedaan om een nieuwe UserField aan te maken
  // Er wordt ook een API call gedaan om het perceel te updaten, als de landbouwer bijv. een naam geeft aan het perceel
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
          // this.drawUserFieldsOnMap();
        },
        error: (error) => {
          console.error('Error adding user field', error);
        }
      });
    }
  }

  // ------------------------ Perceel bewerken ------------------------- //

  // Deze functie zorgt voor het kunnen bewerken van een perceel
  editPerceel(): void {
    this.tempField = { ...this.selectedField };
    this.isEdit = true;
    this.blockMap = true;
  }

  cancelEditPerceel() {
    this.isEdit = false;
    this.blockMap = false;
  }

  // Als de user zijn perceel bewerkt heeft en hij slaat dit op, wordt deze methode gebruikt
  // Het bewerkte perceel wordt tijdelijk opgeslagen in de "tempField" variable
  // Deze wordt dan in "selectedField" gestoken en een API call wordt gedaan met "selectedField" als body
  // loadUserFields wordt opnieuw uitgevoerd om de actuele en upgedate percelen op te halen
  confirmEditPerceel(): void {
    this.selectedField = { ...this.tempField };
    this.isEdit = false;
    if (this.selectedField) {
      this.fieldService.updateField(this.selectedField.id, this.selectedField).subscribe({
        next: (updatedField) => {
          console.log('Field updated successfully:', updatedField);
          this.toastMessage = "Uw perceel is bijgewerkt."
          this.toastClass = 'bg-green-500'
          this.toast.showToast()
        },
        error: (error) => {
          console.error('Error updating field:', error);
        }
      });
    }
    this.loadUserFields(this.userId)
    this.isEdit = false;
    this.blockMap = false;
  }

  // ----------------------- Perceel verwijderen ----------------------- //

  // Deze functie laat de bevestigings modal zien vooraleer een perceel verwijderd wordt
  deleteUserField(): void {
    this.confirmMessageModal = true;
    this.blockMap = true;
  }

  // Bij het bevestigen van verwijderen wordt deze functie uitgevoerd
  // Aangezien we niet het perceel willen verwijderen, maar wel de verbinding tussen landbouwer en perceel
  // wordt eerst de UserField opgehaald (relatie tussen landbouwer en perceel) en deze wordt verwijderd via een API call
  // De UserFields worden terug opgehaald om actuele percelen te tonen
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
    this.blockMap = false;
  }

  // ----------------------- Algemene toegang ------------------------- //

  // Deze functie maakt het mogelijk om algemene toegang tot percelen te beheren
  toggleToegangBeheren(): void {
    this.manageAccess = true;
    this.blockMap = true;
    this.loadUserFields(this.userId)
    this.loadEmails()
  }

  cancelGlobalFieldAccess(): void {
    this.manageAccess = false;
    this.blockMap = false;
  }

  // Deze functie haalt alle emails van gebruikers op die voorkomen in elke UserField
  loadEmails(): void {
    if (this.userFieldsTable.length > 0) {
      const allEmails = this.userFieldsTable
        .filter((userField) => userField.grantedEmails)
        .map((userField) => userField.grantedEmails);

      if (allEmails.length > 0) {
        this.globalEmailList = allEmails.reduce((commonEmails, currentEmails) =>
          commonEmails.filter((email) => currentEmails.includes(email))
        );
      } else {
        this.globalEmailList = [];
      }
    } else {
      this.globalEmailList = [];
    }

    this.globalEmailList = this.globalEmailList.filter(
      (email) => !this.removedGlobalEmails.includes(email)
    );
  }

  // Indien er een email toegevoegd wordt via de dropdown in de UI, zal deze functie de email toevoegen
  // aan de globalEmailList
  addEmailToList(): void {
    if (this.emailPermissionUser && !this.globalEmailList.includes(this.emailPermissionUser)) {
      this.globalEmailList.push(this.emailPermissionUser);
      this.emailPermissionUser = '';
    }
  }

  // Indien er een email verwijderd wordt uit de algemene toegang lijst in de UI, zal deze functie
  // de email verwijderen uit de globalEmailList en toevoegen aan de removedGlobalEmails lijst
  removeEmail(index: number): void {
    const removedEmail = this.globalEmailList.splice(index, 1)[0];
    if (removedEmail && !this.removedGlobalEmails.includes(removedEmail)) {
      this.removedGlobalEmails.push(removedEmail);
    }
  }

  // Bij het opslaan van de algemene toegang lijst, wordt deze functie uitgevoerd
  // Eerst worden de field specific emails eruit gehaald, zodat we deze niet overschrijven
  // De globalEmailList wordt dan gemerged met deze field specific emails
  // Hierna wordt voor elk UserField, de grantedEmails geupdate
  giveGlobalPermission(): void {
    const updateObservables = this.userFieldsTable.map((userField) => {
      const fieldSpecificEmails = userField.grantedEmails?.filter(
        (email) => !this.globalEmailList.includes(email) && !this.removedGlobalEmails.includes(email)) || [];

      const updatedEmails = Array.from(new Set([...fieldSpecificEmails, ...this.globalEmailList]));

      return this.userFieldService.updateUserField(userField.id, {
        ...userField,
        grantedEmails: updatedEmails,
      });
    });

    // Dit zorgt ervoor dat de API call gecomplete is vooraleer door te gaan
    // Dit om bugs in de UI te voorkomen
    forkJoin(updateObservables).subscribe({
      next: () => {
        this.loadUserFields(this.userId);
        this.loadEmails();
        this.removedGlobalEmails = [];
        this.toggleToegangBeheren();
        this.cancelGlobalFieldAccess()
        this.toastMessage = "Algemene toegang is aangepast."
        this.toastClass = 'bg-green-500'
        this.toast.showToast()
      },
      error: (err) => {
        console.error("Error updating user fields:", err);
      },
    });


  }

  // ----------------------- Specifieke toegang ------------------------ //

  // Deze functie maakt het mogelijk om toegang voor een specifiek perceel te beheren
  toggleFieldAccess(): void {
    this.loadUserFields(this.userId)
    this.loadSingleFieldEmails()
    this.showFieldAccess = true;
    this.blockMap = true;
  }

  cancelSingleFieldAccess(): void {
    this.showFieldAccess = false;
    this.blockMap = false;
  }

  // Voor het geselecteerde perceel worden de emails van gebruikers die toegang hebben opgehaald
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

  // Indien er een email toegevoegd wordt via de dropdown in de UI, zal deze functie de email toevoegen
  // aan de singleFieldEmailList
  addEmailToSingleFieldList(): void {
    if (this.emailPermissionUser && !this.singleFieldEmailList.includes(this.emailPermissionUser)) {
      this.singleFieldEmailList.push(this.emailPermissionUser);
      this.emailPermissionUser = '';
    }
  }

  // Indien er een email verwijderd wordt uit de algemene toegang lijst in de UI, zal deze functie
  // de email verwijderen uit de singleFieldEmailList
  removeEmailSingleFieldList(index: number): void {
    this.singleFieldEmailList.splice(index, 1);
  }

  // Bij het opslaan van de specifieke toegang lijst, wordt deze functie uitgevoerd
  // Via een API call wordt de singleFieldEmailList in het UserField gestoken
  giveSingleFieldPermission(): void {
    if (this.selectedUserField) {
      const updateObservable = this.userFieldService.updateUserField(
        this.selectedUserField.id,
        { ...this.selectedUserField, grantedEmails: this.singleFieldEmailList }
      );

      // Dit zorgt ervoor dat de API call gecomplete is vooraleer door te gaan
      // Dit om bugs in de UI te voorkomen
      updateObservable.subscribe({
        next: () => {
          this.loadUserFields(this.userId);
          this.loadSingleFieldEmails();
          this.toggleFieldAccess();
          this.cancelSingleFieldAccess();
          this.toastMessage = "Specifieke toegang is aangepast."
          this.toastClass = 'bg-green-500'
          this.toast.showToast()
        },
        error: (err) => {
          console.error("Error updating user field:", err);
        }
      });
    }
  }

  // ----------------------------- Filter ------------------------------ //

  // Deze functie gaat voor elk perceel kijken of er een weersvoorschijnsel voorspeld wordt
  // dat voor problem zou kunnen zorgen
  checkWeatherPrediction(): boolean {
    const weatherPredictions = ["onweer", "onweer met hagel", "sneeuwbuien", "regenbuien"];
    return this.userPercelen.some(perceel =>
      weatherPredictions.includes(perceel.prediction)
    );
  }

  // Indien bovenstaande functie positief uitkomt, zal er een waarschuwingsicoon in de UI zichtbaar zijn
  // Deze functie zorgt ervoor dat een klik op dit icoon enkel de percelen met waarschuwing toont
  toggleWarningFields(): void {
    this.warningFields = !this.warningFields
    this.loadUserFields(this.userId)
  }

  // Deze functie zorgt voor de functionaliteit van de filter in het percelenbeheer
  get filteredUserPercelen() {
    const filteredByText = this.userPercelen.filter(perceel =>
      perceel.name.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.municipality.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.postalcode.toLowerCase().includes(this.filterText.toLowerCase()) ||
      perceel.id.toString().toLowerCase().includes(this.filterText.toLowerCase()) ||
      (this.userRole < 2
        ? perceel.crop.toLowerCase().includes(this.filterText.toLowerCase())
        : perceel.user_name?.toLowerCase().includes(this.filterText.toLowerCase()))
    );

    if (this.warningFields) {
      return filteredByText.filter(perceel =>
        ['onweer', 'onweer met hagel', 'sneeuwbuien', 'regenbuien'].includes(perceel.prediction)
      );
    }

    return filteredByText;
  }

  // Deze functie maakt de filter leeg
  clearFilterText(): void {
    this.filterText = ''
  }

  // -------------------------- Foto's aanvragen ------------------------ //

  // Deze functie zorgt voor het kunnen aanvragen van foto's
  // Deze functie zoomt de map ook in
  requestPhoto(): void {
    this.requestPhotoForClaim = !this.requestPhotoForClaim
    // if (this.map) {
    //   this.map.setZoom(17)
    // }
  }

  // Deze functie zorgt voor het bijhouden van de geselecteerde schadeclaim, en maakt de kaart clickable
  selectClaim(claimId: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const selectedClaim = this.insuranceClaimsForSingleField.find(claim => claim.id === claimId);

      if (selectedClaim) {
        this.selectedClaim = selectedClaim;
        console.log(this.selectedClaim);
        this.mapIsClickable = true;
        resolve(); // Resolve the promise when the claim is selected successfully
      } else {
        reject(new Error("Claim not found"));
      }
    });
  }

  // Indien er vanuit het "Foto's aanvragen" scherm terug of opslaan geklikt wordt
  // zal deze functie de variables reseten, de map unclickable maken, en de markers verwijderen
  clearSelectedClaim(): void {
    this.selectedClaim = null;
    this.mapIsClickable = false;
    this.clickCoordinates = [];

    this.markers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });

    this.markers = [];
  }

  // Deze functie zorgt voor het kunnen verwijderen van een geplaatste marker
  removeCoordinate(index: number): void {
    const removedCoordinate = this.clickCoordinates.splice(index, 1)[0];
    if (this.map && removedCoordinate && this.markers[index]) {
      this.map.removeLayer(this.markers[index]);
      this.markers.splice(index, 1);
    }
  }

  // Bij het bevestigen van de aanvrag van foto's wordt deze functie uitgevoerd
  // De clickCoordinates lijst wordt doorlopen, en voor elk object wordt een API call uitgevoerd
  // om een RequestImage aan te maken
  submitRequestPhotos(): void {
    if (!this.selectedClaim) {
      console.error('No claim selected');
      return;
    }

    this.toast.message = ""
    this.toastClass = 'bg-green-500'

    const currentDate = new Date().toISOString().split('T')[0];
    console.log(currentDate)
    console.log(this.selectedClaim.id)

    this.clickCoordinates.forEach(coord => {
      if (this.selectedClaim) {
        console.log(this.selectedClaim)
        console.log(this.selectedClaim.id)
        const requestBody = {
          insuranceform: this.selectedClaim.id,
          date: currentDate,
          xCord: coord.x,
          yCord: coord.y,
          description: coord.description,
        };

        this.requestImageService.addRequestImage(requestBody).subscribe(
          response => {
            console.log('Request submitted successfully', response);
            this.toast.message = "Foto's op locatie aangevraagd."
            this.toastClass = 'bg-green-500'
          },
          error => {
            console.error('Error submitting request', error);
            this.toast.message = "Foto's aanvragen mislukt."
            this.toastClass = 'bg-red-500'
          }
        );
      }
    });

    this.toast.showToast()
    this.clearSelectedClaim();
  }

  // -------------------------------------------------------------- //

  // Als er bij een perceel op "Schadeclaim maken" geklikt wordt, zal deze functie
  // navigeren naar de schadeclaim pagina en de fieldId doorgeven
  navigateToSchadeclaim(fieldId: number): void {
    this.router.navigate(['/schadeclaim'], { queryParams: { fieldId: fieldId } });
  }

  // Deze functie zorgt voor het openen en sluiten van het percelenbeheer
  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }
}
