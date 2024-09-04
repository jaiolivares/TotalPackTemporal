import { API_ENDPOINT } from './../../config/config';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor() { }

  async getLogo(slugCustomer: string){
    const slugImages = API_ENDPOINT.slugImages;
    const slug = slugCustomer.toLowerCase();
    const logo = `${slugImages}/logo_${slug}.png`;

    return logo;
  }
}
