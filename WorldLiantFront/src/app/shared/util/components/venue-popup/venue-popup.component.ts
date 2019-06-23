import {Component, Input, OnInit} from '@angular/core';
import {MapService} from '../../../../home/service/map.service';

@Component({
  selector: 'app-venue-popup',
  templateUrl: './venue-popup.component.html',
  styleUrls: ['./venue-popup.component.scss']
})
export class VenuePopupComponent implements OnInit {

  @Input()
  initialData: any;
  // {id, name, location{address, city, country}}

  picUrl;
  more = false;
  linkLength = 30;
  details: any;
  defaultUrl = '../../../../../assets/img/no-image-placeholder.png';

  constructor(private mapService: MapService) {
  }

  ngOnInit() {
    if (this.initialData.id) {
      this.mapService.getVenueDetails(this.initialData.id)
        .subscribe(details => {
          this.details = details.response.venue;
          this.picUrl = this.details.bestPhoto ?
            this.buildUrl(this.details.bestPhoto.prefix, '300x300', this.details.bestPhoto.suffix) :
            this.defaultUrl;
          console.log(this.details.contact);
        });
    }
    // this.initialData = {id: 1, name: 'Name', location: {address: 'Iulius', city: 'Cluj', country: 'Romania'}};
    // this.picUrl = this.defaultUrl;
    // this.details = {likes: {count: 500}, url: 'https://example.com', contact: {twitter: 'ceva'}};
  }

  private buildUrl(prefix: string, size: string, suffix: string): string {
    return `${prefix}${size}${suffix}`;
  }

  togglePreview() {

  }

}
