import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DamageService } from '../../api/services/damage/damage.service';
import { FieldService } from '../../api/services/field/field.service';
import { UserService } from '../../api/services/user/user.service';
import { InsuranceFormService } from '../../api/services/insuranceForm/insurance-form.service';
import { FieldCropService } from '../../api/services/fieldCrop/field-crop.service';
import { RequestedImageService } from '../../api/services/requestedImage/requestedImage.service';
import { ImageService } from '../../api/services/image/image.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from '../toast/toast.component';
import * as piexif from 'piexifjs';
import { environment } from '../../../environments/environment.development';
import { PDFService } from '../../api/services/pdf/pdf.service';
import { UserFieldService } from '../../api/services/userField/user-field.service';

@Component({
  selector: 'app-schadeclaim-form',
  templateUrl: './schadeclaim-form.component.html',
  styleUrls: ['./schadeclaim-form.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ToastComponent],
})
export class SchadeclaimFormComponent implements OnInit {
  @ViewChild(ToastComponent) toast!: ToastComponent; // Reference to ToastComponent

  private apiUrl = `${environment.baseUrl}`;
  public confirmModal: boolean = false;

  userId: number | undefined;
  claimId: number | undefined;
  fieldId: number | undefined;
  fields: any[] = [];
  damages: any[] = [];
  uploadedImages: {
    file: File | null;
    url: string;
    xCord?: string | number;
    yCord?: string | number;
  }[] = [];

  requestedImages: {
    file: File | null;
    url: string;
    xCord?: string | number;
    yCord?: string | number;
    fulfilled: boolean | false;
  }[] = [];

  schadeclaimForm = {
    id: 0,
    damage: "0",
    field: 0,
    startDate: "",
    endDate: "",
    status: 0,
    estimated_cost: 0,
    photos: "",
    fieldArea: "",
    fieldPostcode: " ",
    crop: "",
    fieldName: "",
    fieldMunicipality: "",
    fieldOever: false,
    fieldRisico: false,
    description: "//",
    insurance: false,
    schade_nietverzekerd: false,
    percentage_teeltareaal: 0,
  };

  user = {
    farmerFirstname: '',
    farmerName: '',
    farmerStreet: '',
    farmerNumber: '',
    farmerMunicipality: '',
    farmerPostcode: '',
    farmerEmail: '',
  };

  postform = {
    damage: 0,
    field: 1,
    startDate: "",
    endDate: "",
    status: 0,
    estimated_cost: 0,
    description: "",
    insurance: false
  };

  uploadForm = new FormGroup({
    image: new FormControl(''),
    xCord: new FormControl('1'),
    yCord: new FormControl('1'),
    date: new FormControl(''),
    filename: new FormControl(''),
    insuranceform_id: new FormControl('1')
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private damageService: DamageService,
    private fieldService: FieldService,
    private userService: UserService,
    private insuranceformService: InsuranceFormService,
    private fieldcropService: FieldCropService,
    private imageService: ImageService,
    private requestedImageService: RequestedImageService,
    private pdfService: PDFService,
    private userFieldService: UserFieldService,
  ) { }

  ngOnInit(): void {
    this.fetchUserData();
    this.fetchDamages(); // Fetch available damage types
    this.onFieldSelect();
    // Check for claim ID in route parameters
    this.route.params.subscribe(params => {
      this.route.queryParams.subscribe(queryParams => {
        const fieldId = queryParams['fieldId'];
        if (fieldId) {
          this.schadeclaimForm.field = fieldId; // Set field ID from query parameter
          this.onFieldSelect()
        }
      });

      if (params['id']) {
        this.claimId = +params['id']; // Get claim ID from route
        this.fetchClaimData(this.claimId); // Fetch claim details
      }
    });
  }

  //load fields for dropdown
  loadFields(): void {
    // Ensure userId is set before making the API request
    if (this.userId !== undefined) {
      this.fieldService.getFieldsByUserId(this.userId)
        .subscribe(
          (fields: any[]) => {
            this.fields = fields;
          },
          (err) => {
            console.error('Error fetching fields:', err);
          }
        );
    } else {
      console.error('User ID is not set yet.');
    }
  }

  //fetch damages for dropdown and sort them alphabetically
  fetchDamages(): void {
    this.damageService.getAllDamages().subscribe(
      (damages: any[]) => {
        this.damages = damages.sort((a, b) => {
          if (a.id === 0) return -1; // Keep "none" damage at the top
          if (b.id === 0) return 1;
          return a.type.localeCompare(b.type); // Sort alphabetically otherwise
        });
      },
      (err) => {
        console.error('Error fetching damages:', err);
      }
    );
  }


  public noUserAccess: boolean = false
  // change field info when selecting field in dropdown
  onFieldSelect(): void {
    const selectedFieldId = this.schadeclaimForm.field;
    if (!selectedFieldId || selectedFieldId == 0) {
      return;
    }

    // Fetch field data based on the selected field ID
    this.fieldService.getFieldById(selectedFieldId).subscribe({
      next: (field: any) => {
        if (field && field.length > 0) {
          // Update the form fields based on the selected field data
          const selectedField = field[0];
          this.schadeclaimForm.fieldArea = selectedField.acreage || '';
          this.schadeclaimForm.fieldPostcode = selectedField.postalcode || '';
          this.schadeclaimForm.fieldName = selectedField.name || '';
          this.schadeclaimForm.fieldMunicipality = selectedField.municipality || '';
          this.schadeclaimForm.fieldOever = selectedField.risico || false;
          this.schadeclaimForm.fieldRisico = selectedField.risico || false;
          this.schadeclaimForm.crop = selectedField.crop || '';
        }



      },
      error: (err) => {
        console.error('Error fetching field data:', err);
      },
    });


  }

  //fetch the user
  fetchUserData(): void {
    this.userService.getUser()
      .subscribe({
        next: (data: any) => {
          this.userId = data.id;
          const adres = data.adres || '';
          const [street, ...numberParts] = adres.split(/(?=\d)/);
          const number = numberParts.join('') || '';
          this.user.farmerFirstname = data.firstName || '';
          this.user.farmerName = data.lastName || '';
          this.user.farmerStreet = street.trim();
          this.user.farmerNumber = number.trim();
          this.user.farmerMunicipality = data.gemeente || '';
          this.user.farmerEmail = data.email || '';
          this.loadFields();

        },
        error: (err) => {
          console.error('Error fetching user data:', err);
        },
      });
  }

  claimHasEOPlazaImages: { [key: number]: boolean } = {};

  checkEOPlazaImages(claimId: number): void {
    this.imageService.getEOplazaImages(claimId).subscribe({
      next: (eoplazaResponse: any) => {
        this.claimHasEOPlazaImages[claimId] = eoplazaResponse.images.length > 0;
      },
      error: (err) => {
        console.error(`Error fetching EOPlaza images for claim ${claimId}:`, err);
        this.claimHasEOPlazaImages[claimId] = false;
      },
    });
  }


  //fetch claim data when form is aready created
  fetchClaimData(claimId: number): void {
    this.imageService.getImages(claimId).subscribe({
      next: (images: any[]) => {
        images.forEach((image: any) => {
          // If the API returns a URL, push it to uploadedImages
          this.uploadedImages.push({
            file: null,
            url: `${this.apiUrl}${image.image}` // Prepending the correct URL to the relative path
          });
        });
      },
      error: (err) => {
        console.error('Error fetching images:', err);
      },
    });

    if (this.schadeclaimForm.status > 1) {
      this.checkEOPlazaImages(claimId);
    }


    //requested Images
    this.requestedImageService.getImages(claimId)
      .subscribe({
        next: (images: any[]) => {
          images
            .filter((image: any) => !image.fulfilled) // Only keep unfulfilled images
            .forEach((image: any) => {
              this.requestedImages.push({
                file: null,
                url: "no url",
                xCord: image.xCord,
                yCord: image.yCord,
                fulfilled: image.fulfilled
              });
            });
        },
        error: (err) => {
          console.error('Error fetching requested image data:', err);
        },
      });


    this.insuranceformService.getInsuranceformByClaimId(claimId)
      .subscribe({
        next: (claim: any) => {
          // Map claim data to the form
          this.schadeclaimForm.damage = String(claim[0].damage) || "0";
          this.schadeclaimForm.field = claim[0].id || 1;
          this.schadeclaimForm.startDate = claim[0].startDate || '';
          this.schadeclaimForm.endDate = claim[0].endDate || '';
          this.schadeclaimForm.status = claim[0].status || true;
          this.schadeclaimForm.estimated_cost = claim[0].estimated_cost || 0;
          this.schadeclaimForm.field = claim[0].field.id || 0;
          this.fieldId = claim[0].field.id || 1; // Ensure fieldId is set
          this.schadeclaimForm.id = claim[0].id || undefined
          this.schadeclaimForm.description = claim[0].description || "",
            this.schadeclaimForm.insurance = claim[0].insurance || false,
            this.schadeclaimForm.schade_nietverzekerd = claim[0].schade_nietverzekerd || false,
            this.schadeclaimForm.percentage_teeltareaal = claim[0].percentage_teeltareaal || 0


          // Only proceed with fetching field data if fieldId is defined
          if (this.fieldId !== undefined) {
            this.fieldService.getFieldById(this.fieldId)
              .subscribe({
                next: (field: any) => {
                  this.schadeclaimForm.fieldArea = field[0].acreage || '';
                  this.schadeclaimForm.fieldPostcode = field[0].postalcode || '';
                  this.schadeclaimForm.crop = field[0].crop || '';
                  this.schadeclaimForm.fieldName = field[0].name || '';
                  this.schadeclaimForm.fieldMunicipality = field[0].municipality || '';
                  this.schadeclaimForm.fieldOever = field[0].oever || false;
                  this.schadeclaimForm.fieldRisico = field[0].risico || false;
                  this.schadeclaimForm.crop = field[0].crop || '';

                },
                error: (err) => {
                  console.error('Error fetching field data:', err);
                }
              });
          } else {
            console.error('Field ID is undefined');
          }
          const selectedFieldId = this.schadeclaimForm.field;

        },
        error: (err) => {
          console.error('Error fetching claim data:', err);
        },
      });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file: File) => {
        if (!file.type.match('image/jpeg')) {
          alert('Alleen JPG-bestanden zijn toegestaan.');
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = reader.result as string;
            const exif = piexif.load(data);
            const gps = exif['GPS'];

            let xCord, yCord;
            if (gps) {
              const latitude = gps[piexif.GPSIFD.GPSLatitude];
              const latitudeRef = gps[piexif.GPSIFD.GPSLatitudeRef];
              const longitude = gps[piexif.GPSIFD.GPSLongitude];
              const longitudeRef = gps[piexif.GPSIFD.GPSLongitudeRef];

              xCord = this.convertDMSToDecimal(latitude, latitudeRef);
              yCord = this.convertDMSToDecimal(longitude, longitudeRef);
            }

            this.uploadedImages.push({
              file,
              url: reader.result as string,
              xCord: xCord?.toString() || '',
              yCord: yCord?.toString() || '',
            });

          } catch (error) {
            console.error('Error parsing EXIF data:', error);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }


  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
  }

  //submit
  onSubmit(): void {
    if (this.schadeclaimForm.status === 2) {
      alert('Claim is closed and cannot be edited');
      return;
    }
    // Step 1: Submit the insurance form and get the insuranceform_id
    const insuranceFormData = {
      ...this.postform,
      damage: Number(this.schadeclaimForm.damage),
      field: this.schadeclaimForm.field,
      estimated_cost: this.schadeclaimForm.estimated_cost || 0,
      startDate: this.schadeclaimForm.startDate,
      endDate: this.schadeclaimForm.endDate,
      description: this.schadeclaimForm.description,
      insurance: this.schadeclaimForm.insurance,
      schade_nietverzekerd: this.schadeclaimForm.schade_nietverzekerd,
      percentage_teeltareaal: this.schadeclaimForm.percentage_teeltareaal,
      status: 1,
    };

    this.insuranceformService.postInsuranceformById(this.userId, insuranceFormData)
      .subscribe({
        next: (response: any) => {
          this.router.navigate(['/edit-schadeclaim', response.id]); // Navigate to edit page after submission
        },
        error: (err) => {
          console.error('Error creating insurance form:', err);
          this.toast.message = 'Vul correcte datums in en selecteer een veld.'; // Set toast message
          this.toast.toastClass = 'bg-red-500'; // Optional: set error styling
          this.toast.showToast(); // Show toast
        },
      });
  }



  onUpdate(): void {
    if (this.schadeclaimForm.status === 2) {
      alert('Claim is closed and cannot be edited');
      return;
    }

    const insuranceFormData = {
      ...this.postform,
      damage: Number(this.schadeclaimForm.damage),
      field: this.schadeclaimForm.field,
      estimated_cost: this.schadeclaimForm.estimated_cost || 0,
      startDate: this.schadeclaimForm.startDate,
      endDate: this.schadeclaimForm.endDate,
      description: this.schadeclaimForm.description,
      insurance: this.schadeclaimForm.insurance,
      schade_nietverzekerd: this.schadeclaimForm.schade_nietverzekerd,
      percentage_teeltareaal: this.schadeclaimForm.percentage_teeltareaal,
      status: 2,
    };

    this.insuranceformService.putInsuranceform(this.schadeclaimForm.id, insuranceFormData)
      .subscribe({
        next: (response: any) => {
          const insuranceformId = this.schadeclaimForm.id; // Retrieve the form ID for the image upload

          // If there are images to upload, proceed
          if (this.uploadedImages.length > 0) {
            const uploadPromises = this.uploadedImages.map((image) => {
              // Check if the file is not null before proceeding
              if (image.file) {
                const formData = new FormData();
                formData.append('insuranceform', insuranceformId.toString());
                formData.append('image', image.file);
                formData.append('filename', image.file.name);
                formData.append('date', new Date(image.file.lastModified).toISOString().split('T')[0]);
                formData.append('xCord', String(image.xCord) || '');
                formData.append('yCord', String(image.yCord) || '');

                return this.http.post(`${this.apiUrl}/images/`, formData).toPromise();
              } else {
                console.warn('Image file is null, skipping upload.');
                return Promise.resolve();
              }
            });

            Promise.all(uploadPromises)
              .then((responses) => {
                this.router.navigate(['/schadeclaims']);
              })
              .catch((err) => {
                console.error('Error uploading one or more images:', err);
              });
          } else {
            this.router.navigate(['/schadeclaims']);
          }
        },
        error: (err) => {
          console.error('Error updating insurance form:', err);
        },
      });
  }

  private convertDMSToDecimal(dms: number[][], direction: string): number {
    if (!dms || dms.length !== 3) {
      console.warn('Invalid DMS format:', dms);
      return NaN;
    }

    const degrees = dms[0][0];
    const minutes = dms[1][0];
    const seconds = dms[2][0] / dms[2][1];

    let decimal = degrees + minutes / 60 + seconds / 3600;

    if (direction === 'S' || direction === 'W') {
      decimal *= -1;
    }

    return decimal;
  }


  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmCreate(): void {
    this.confirmModal = true
    this.userFieldService.getUserFieldByFieldId(this.schadeclaimForm.field).subscribe({
      next: (response: any[]) => {
        if (response.length > 0 && response[0].grantedEmails.length === 0) {
          this.noUserAccess = true;
        } else {
          this.noUserAccess = false;
        }
      },
      error: (err) => {
        console.error('Error fetching user field data:', err);
        this.noUserAccess = true;
      }
    });
  }

  cancelCreate(): void {
    this.confirmModal = false;
  }

  generateEOPlazaPDF(claimId: number): void {
    this.pdfService.getEOplazaPDF(claimId)
      .subscribe({
        next: (response) => {
          // Create a downloadable link for the PDF
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `claim_${claimId}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Failed to generate PDF', err);
        }
      });
  }
}
