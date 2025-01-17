import { Injectable } from '@angular/core';
import { ImageResponseDto } from '../../dtos/Image/Image-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private httpClient: HttpClient) {
  }
  getImages(): ImageResponseDto[] {
    let images: ImageResponseDto[] = [
      {
        id: 1,
        insuranceFormId: 1,
        fileName: 'image1.jpg',
        xCord: '100',
        yCord: '200',
        date: new Date('2023-01-15')
      },
      {
        id: 2,
        insuranceFormId: 2,
        fileName: 'image2.jpg',
        xCord: '150',
        yCord: '250',
        date: new Date('2023-02-20')
      },
      {
        id: 3,
        insuranceFormId: 3,
        fileName: 'image3.jpg',
        xCord: '120',
        yCord: '220',
        date: new Date('2023-03-25')
      }
    ];

    return images;
  }

  getImageById(id: number): ImageResponseDto | null {
    const images = this.getImages();
    const image = images.find(img => img.id === id);
    return image ?? null;
  }

  getImagesByInsuranceFormId(insuranceFormId: number): ImageResponseDto[] {
    const images = this.getImages();
    const filteredImages = images.filter(img => img.insuranceFormId === insuranceFormId);
    return filteredImages;
  }

  getImagesByDateRange(startDate: Date, endDate: Date): ImageResponseDto[] {
    const images = this.getImages();
    const filteredImages = images.filter(img => img.date >= startDate && img.date <= endDate);
    return filteredImages;
  }

  postImage(formdata: File): Observable<ImageResponseDto[]> {
    return this.httpClient.post<ImageResponseDto[]>(`http://localhost:8000/api/images/`, formdata, { withCredentials: true });
  }
}
