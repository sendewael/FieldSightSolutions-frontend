import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

// Chart.js imports
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Services
import { UserService } from '../../../api/services/user/user.service';
import { InsuranceFormService } from '../../../api/services/insuranceForm/insurance-form.service';
import { FieldService } from '../../../api/services/field/field.service';

// Components
import { DashboardMapComponent } from '../../../components/dashboard-map/dashboard-map.component';

interface User {
  id: number;
  gemeente: string;
}

interface Field {
  id: number;
  name: string;
  crop: string;
  acreage: string;
}

interface Claims {
  id: number;
  damage_type?: string;  // optional if the API can omit it
  startDate?: string;
  endDate?: string;
  description?: string;
  insurance?: boolean;
  estimated_cost?: number;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    // other fields...
  };
}

interface Gemeente {
  name: string;
}

@Component({
  selector: 'app-dashboard-overheid',
  standalone: true,
  imports: [CommonModule, DashboardMapComponent, FormsModule],
  templateUrl: './dashboard-overheid.component.html',
  styleUrls: ['./dashboard-overheid.component.css']
})
export class DashboardOverheidComponent implements OnInit {
  // Canvas references
  @ViewChild('claimsBarChart') claimsBarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('damageBarChart') damageBarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('farmerChart') farmerChartRef!: ElementRef<HTMLCanvasElement>;

  user: User | null = null;
  fields: Field[] = [];
  claims: Claims[] = [];
  gemeentes: Gemeente[] = [];
  selectedGemeente: string = 'Geel';

  // Chart instances
  private barChart!: Chart;
  private damageChart!: Chart;
  private farmerChart!: Chart;

  constructor(
    private userService: UserService,
    private router: Router,
    private schadeclaimService: InsuranceFormService,
    private fieldService: FieldService
  ) {}

  ngOnInit(): void {
    // Gebruiker inladen uit localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      if (this.user) {
        this.selectedGemeente = this.user.gemeente || 'Geel';
        this.getFields(this.selectedGemeente);
      }
    }
    this.getGemeentes();
  }

  // Lijst van velden ophalen voor een bepaalde gemeente
  getFields(gemeentenaam: string) {
    this.fieldService.getFieldsByGemeente(gemeentenaam).subscribe(
      (fields: Field[]) => {
        this.fields = fields;
        console.log('Velden:', this.fields);
        // Claims voor elke veld ophalen
        this.getClaimsForAllFields();
      },
      (error) => {
        console.error('Fout bij ophalen van velden:', error);
      }
    );
  }

  // Alle mogelijke gemeentes ophalen
  getGemeentes() {
    this.fieldService.getFieldGemeentes().subscribe(
      (gemeentes: Gemeente[]) => {
        this.gemeentes = gemeentes;
        console.log('Gemeentes', this.gemeentes);
      },
      (error) => {
        console.error('Fout bij ophalen van gemeentes:', error);
      }
    );
  }

  // Wanneer gebruiker een andere gemeente kiest
  onGemeenteChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedGemeente = selectedValue;
    this.getFields(this.selectedGemeente);
  }

  // Voor elk veld de claims ophalen, dan samenvoegen
  getClaimsForAllFields() {
    if (this.fields.length === 0) {
      console.log('Geen velden gevonden');
      return;
    }

    const claimsRequests = this.fields.map(field =>
      this.schadeclaimService.getInsuranceClaimsByFieldId(field.id)
    );

    forkJoin(claimsRequests).subscribe(
      (claimsResponses) => {
        this.claims = claimsResponses.flat();
        console.log('Alle Claims:', this.claims);

        // Diagrammen aanmaken
        this.createBarChart();
        this.createDamageBarChart();
        this.createFarmerClaimsChart();
      },
      (error) => {
        console.error('Fout bij ophalen van claims:', error);
      }
    );
  }

  // 1) Staafdiagram (verticaal) voor Schadeclaims per Maand
createBarChart() {
  if (this.barChart) {
    this.barChart.destroy();
  }

  // Maandnamen in het Nederlands
  const maandNamen: { [key: string]: string } = {
    '01': 'Januari',
    '02': 'Februari',
    '03': 'Maart',
    '04': 'April',
    '05': 'Mei',
    '06': 'Juni',
    '07': 'Juli',
    '08': 'Augustus',
    '09': 'September',
    '10': 'Oktober',
    '11': 'November',
    '12': 'December',
  };

  // Tellen hoe vaak claims starten in elke maand
  const monthlyCounts: { [month: string]: number } = {
    '01': 0, '02': 0, '03': 0, '04': 0,
    '05': 0, '06': 0, '07': 0, '08': 0,
    '09': 0, '10': 0, '11': 0, '12': 0,
  };

  this.claims.forEach(claim => {
    if (claim.startDate) {
      // "YYYY-MM-DD" => split => [YYYY, MM, DD]
      const month = claim.startDate.split('-')[1];
      if (monthlyCounts[month] !== undefined) {
        monthlyCounts[month]++;
      }
    }
  });

  // Labels omzetten naar de maandnamen in het Nederlands
  const labels = Object.keys(monthlyCounts).map(m => maandNamen[m]);
  const data = Object.values(monthlyCounts);

  this.barChart = new Chart(this.claimsBarChartRef.nativeElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Aantal Schadeclaims',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Aantal Claims'
              },
              ticks: {
                stepSize: 1,
                precision: 0
              }
            },
            x: {
              title: {
                display: true,
                text: 'Maand'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
  });
}


  // 2) Horizontale Staafdiagram voor Schadetypes
  createDamageBarChart() {
    if (this.damageChart) {
      this.damageChart.destroy();
    }

    // Tellen hoe vaak elk schade_type voorkomt
    const damageTypeCounts: { [type: string]: number } = {};

    this.claims.forEach(claim => {
      const type = claim.damage_type || 'Onbekend';
      damageTypeCounts[type] = (damageTypeCounts[type] || 0) + 1;
    });

    const labels = Object.keys(damageTypeCounts);
    const data = Object.values(damageTypeCounts);

    this.damageChart = new Chart(this.damageBarChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Aantal Claims per Schadetype',
            data,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            barThickness: 20
          }
        ]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y', // behoudt horizontale oriëntatie
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Aantal Claims'
              },
              ticks: {
                stepSize: 1,
                precision: 0
              }
            },
            y: {
              title: {
                display: false, // y-as titel verbergen
                text: ''
              },
              ticks: {
                autoSkip: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
    });
  }

  // 3) Horizontale Staafdiagram voor Schadeclaims per Landbouwer
  createFarmerClaimsChart() {
    if (this.farmerChart) {
      this.farmerChart.destroy();
    }

    // Tellen hoe vaak elke landbouwer claims heeft ingediend
    const farmerCounts: { [farmerName: string]: number } = {};

    this.claims.forEach(claim => {
      let farmerName = 'Onbekende Landbouwer';
      if (claim.user) {
        const fName = claim.user.firstName || '';
        const lName = claim.user.lastName || '';
        farmerName = (fName + ' ' + lName).trim();
      }
      if (!farmerCounts[farmerName]) {
        farmerCounts[farmerName] = 0;
      }
      farmerCounts[farmerName]++;
    });

    const labels = Object.keys(farmerCounts);
    const data = Object.values(farmerCounts);

    this.farmerChart = new Chart(this.farmerChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Aantal Claims',
            data,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            barThickness: 20
          }
        ]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y', // behoudt horizontale oriëntatie
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Aantal Claims'
              },
              ticks: {
                stepSize: 1,
                precision: 0
              }
            },
            y: {
              title: {
                display: false, // y-as titel verbergen
                text: ''
              },
              ticks: {
                autoSkip: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
    });
  }
}
