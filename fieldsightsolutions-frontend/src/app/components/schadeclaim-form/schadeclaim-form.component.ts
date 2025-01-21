import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DamageService } from '../../api/services/damage/damage.service';
import { FieldService } from '../../api/services/field/field.service';
import { UserService } from '../../api/services/user/user.service';
import { InsuranceFormService } from '../../api/services/insuranceForm/insurance-form.service';
import { FieldCropService } from '../../api/services/fieldCrop/field-crop.service';
import { ImageService } from '../../api/services/image/image.service';
import { ReactiveFormsModule } from '@angular/forms';
import * as piexif from 'piexifjs';

@Component({
  selector: 'app-schadeclaim-form',
  templateUrl: './schadeclaim-form.component.html',
  styleUrls: ['./schadeclaim-form.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
})
export class SchadeclaimFormComponent implements OnInit {
  userId: number | undefined;
  claimId: number | undefined;
  fieldId: number | undefined;
  fields: any[] = []; // Array to store fields
  damages: any[] = []; // Array to store fields
  uploadedImages: {
    file: File | null;
    url: string;
    xCord?: string | number;
    yCord?: string | number;
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
    description: "no description",
    insurance: false,
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
    private imageService: ImageService
  ) { }

  ngOnInit(): void {
    this.fetchUserData();
    this.fetchDamages(); // Fetch available damage types
    this.onFieldSelect();
    // Check for claim ID in route parameters
    this.route.params.subscribe(params => {
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

  //fetch damages for dropdown
  fetchDamages(): void {
    this.damageService.getAllDamages()
      .subscribe(
        (damages: any[]) => {
          this.damages = damages; // Populate damages array
        },
        (err) => {
          console.error('Error fetching damages:', err);
        }
      );
  }


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


  //fetch claim data when form is aready created
  fetchClaimData(claimId: number): void {

    this.imageService.getImages(claimId).subscribe({
      next: (images: any[]) => {
        images.forEach((image: any) => {
          // If the API returns a URL, push it to uploadedImages
          this.uploadedImages.push({
            file: null,
            url: `http://localhost:8000/api${image.image}` // Prepending the correct URL to the relative path
          });
        });

      },
      error: (err) => {
        console.error('Error fetching images:', err);
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
          this.schadeclaimForm.field = claim[0].field || 0;
          this.fieldId = claim[0].field || 1; // Ensure fieldId is set
          this.schadeclaimForm.id = claim[0].id || undefined
          this.schadeclaimForm.description = claim[0].description || "",
            this.schadeclaimForm.insurance = claim[0].insurance || false,

            console.log(claim[0])

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
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = reader.result as string;
            const exif = piexif.load(data);

            const gps = exif['GPS'];
            if (gps) {
              const latitude = gps[piexif.GPSIFD.GPSLatitude];
              const latitudeRef = gps[piexif.GPSIFD.GPSLatitudeRef];
              const longitude = gps[piexif.GPSIFD.GPSLongitude];
              const longitudeRef = gps[piexif.GPSIFD.GPSLongitudeRef];


              // Convert to decimal
              const xCord = this.convertDMSToDecimal(latitude, latitudeRef);
              const yCord = this.convertDMSToDecimal(longitude, longitudeRef);


              // Add the image with the coordinates
              this.uploadedImages.push({
                file,
                url: reader.result as string,
                xCord: xCord.toString(),
                yCord: yCord.toString(),
              });
            } else {
              console.warn('No GPS data found in EXIF metadata');
            }
          } catch (error) {
            console.error('Error parsing EXIF data with piexifjs:', error);
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
      status: 1,
    };

    this.insuranceformService.postInsuranceformById(this.userId, insuranceFormData)
      .subscribe({
        next: (response: any) => {
          this.router.navigate(['/edit-schadeclaim', response.id]); // Navigate to edit page after submission
        },
        error: (err) => {
          console.error('Error creating insurance form:', err);
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
                formData.append('xCord', String(image.xCord) || ''); // Use extracted xCord or default to an empty string
                formData.append('yCord', String(image.yCord) || '');

                return this.http.post('http://localhost:8000/api/images/', formData).toPromise();
              } else {
                console.warn('Image file is null, skipping upload.');
                return Promise.resolve(); // Skip the upload if there is no file
              }
            });

            // Wait for all image uploads to finish
            Promise.all(uploadPromises)
              .then((responses) => {
                this.router.navigate(['/schadeclaims']); // Navigate to another page after uploads
              })
              .catch((err) => {
                console.error('Error uploading one or more images:', err);
              });
          } else {
            this.router.navigate(['/schadeclaims']); // Navigate if no images
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

    // Convert the degrees, minutes, and seconds to a proper format
    const degrees = dms[0][0]; // The first value in the array represents degrees
    const minutes = dms[1][0]; // The second value represents minutes
    const seconds = dms[2][0] / dms[2][1]; // The third array represents seconds (fractional part)

    // Convert DMS to decimal degrees
    let decimal = degrees + minutes / 60 + seconds / 3600;

    // Apply direction (S or W would make the value negative)
    if (direction === 'S' || direction === 'W') {
      decimal *= -1;
    }

    return decimal;
  }



}


