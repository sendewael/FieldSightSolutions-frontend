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
  uploadedImages: { file: File; url: string }[] = []; // Array to store files and preview URLs


  schadeclaimForm = {
    damage: "0",
    field: 0,
    startDate: "",
    endDate: "",
    active: true,
    estimated_cost: 0,
    additionalInfo: "",
    photos: "",
    weatherInsurance: false,
    fieldArea: "",
    fieldPostcode: " ",
    fieldCrop: "",
    fieldName: "",
    fieldMunicipality: ""
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
    active: true,
    estimated_cost: 0
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

    if (!selectedFieldId || selectedFieldId <= 0) {
      return;
    }

    // Fetch field data based on the selected field ID
    this.fieldService.getFieldById(selectedFieldId).subscribe({
      next: (field: any) => {
        console.log(this.schadeclaimForm.field)
        if (field && field.length > 0) {
          // Update the form fields based on the selected field data
          const selectedField = field[0];
          this.schadeclaimForm.fieldArea = selectedField.acreage || '';
          this.schadeclaimForm.fieldPostcode = selectedField.postalcode || '';
          this.schadeclaimForm.fieldName = selectedField.name || '';
          this.schadeclaimForm.fieldMunicipality = selectedField.municipality || '';
        }


      },
      error: (err) => {
        console.error('Error fetching field data:', err);
      },
    });

    // Fetch field crop data for the selected field ID
    this.fieldcropService.getFieldCropsByFieldId(selectedFieldId).subscribe({
      next: (fieldCrops: any) => {
        if (fieldCrops && fieldCrops.length > 0) {
          this.schadeclaimForm.fieldCrop = fieldCrops[0].crop_name || '';
          console.log('Field crop data:', fieldCrops[0].crop_name);
        } else {
          this.schadeclaimForm.fieldCrop = 'geen teelt toegewezen';
          console.warn('Field crop data not found for the selected field ID.');
        }
      },
      error: (err) => {
        console.error('Error fetching field crop data:', err);
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
    this.insuranceformService.getInsuranceformByClaimId(claimId)
      .subscribe({
        next: (claim: any) => {
          // Map claim data to the form
          this.schadeclaimForm.damage = String(claim[0].damage) || "0";
          this.schadeclaimForm.field = claim[0].id || 1;
          this.schadeclaimForm.startDate = claim[0].startDate || '';
          this.schadeclaimForm.endDate = claim[0].endDate || '';
          this.schadeclaimForm.active = claim[0].active || true;
          this.schadeclaimForm.estimated_cost = claim[0].estimated_cost || 0;
          this.schadeclaimForm.field = claim[0].field || 0;
          this.fieldId = claim[0].field || 1; // Ensure fieldId is set
          this.schadeclaimForm.active = claim[0].active || false


          // Only proceed with fetching field data if fieldId is defined
          if (this.fieldId !== undefined) {
            this.fieldService.getFieldById(this.fieldId)
              .subscribe({
                next: (field: any) => {
                  this.schadeclaimForm.fieldArea = field[0].acreage || '';
                  this.schadeclaimForm.fieldPostcode = field[0].postalcode || '';
                  this.schadeclaimForm.fieldCrop = field[0].fieldCrop || '';
                  this.schadeclaimForm.fieldName = field[0].name || '';
                  this.schadeclaimForm.fieldMunicipality = field[0].municipality || '';

                },
                error: (err) => {
                  console.error('Error fetching field data:', err);
                }
              });
          } else {
            console.error('Field ID is undefined');
          }
          const selectedFieldId = this.schadeclaimForm.field;

          // Fetch field crop data for the selected field ID
          this.fieldcropService.getFieldCropsByFieldId(selectedFieldId).subscribe({
            next: (fieldCrops: any) => {
              if (fieldCrops && fieldCrops.length > 0) {
                this.schadeclaimForm.fieldCrop = fieldCrops[0].crop_name || '';
                console.log('Field crop data:', fieldCrops[0].crop_name);
              } else {
                this.schadeclaimForm.fieldCrop = 'geen teelt toegewezen';
                console.warn('Field crop data not found for the selected field ID.');
              }
            },
            error: (err) => {
              console.error('Error fetching field crop data:', err);
            },
          });
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
          this.uploadedImages.push({ file, url: reader.result as string });
        };
        reader.readAsDataURL(file);
        console.log(file)
      });
    }
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
  }

  //submit
  onSubmit(): void {
    if (!this.schadeclaimForm.active) {
      alert('Claim is closed and cannot be edited');
      return;
    }
  
    // Step 1: Submit the insurance form and get the insuranceform_id
    const insuranceFormData = {
      ...this.postform,
      damage: Number(this.schadeclaimForm.damage), // Convert to number for backend
      field: this.schadeclaimForm.field,
      estimated_cost: this.schadeclaimForm.estimated_cost || 0,
      startDate: this.schadeclaimForm.startDate,
      endDate: this.schadeclaimForm.endDate,
    };
  
    this.insuranceformService.postInsuranceformById(this.userId, insuranceFormData)
      .subscribe({
        next: (response: any) => {
          console.log('Insurance form created successfully', response);
  
          // Get the newly created insuranceform_id from the response
          if (this.uploadedImages.length > 0) {
            const insuranceformId = response.id; // From Step 1
          
            const uploadPromises = this.uploadedImages.map((image) => {
              const formData = new FormData();
          
              // Add necessary data for each image
              formData.append('insuranceform', insuranceformId.toString());
              formData.append('image', image.file);
              formData.append('filename', image.file.name);
              formData.append('date', new Date(image.file.lastModified).toISOString().split('T')[0]); // Format to YYYY-MM-DD
              formData.append('xCord', '1'); // Replace with actual value if available
              formData.append('yCord', '1'); // Replace with actual value if available
          
              // Make an HTTP POST request for this image
              return this.http.post('http://localhost:8000/api/images/', formData).toPromise();
            });
          
            // Wait for all image uploads to finish
            Promise.all(uploadPromises)
              .then((responses) => {
                console.log('All images uploaded successfully:', responses);
                this.router.navigate(['/schadeclaims']); // Navigate to another page
              })
              .catch((err) => {
                console.error('Error uploading one or more images:', err);
              });
          } else {
            console.log('No images to upload');
            this.router.navigate(['/schadeclaims']);
          }
        },
        error: (err) => {
          console.error('Error creating insurance form:', err);
        },
      });
  }
}
