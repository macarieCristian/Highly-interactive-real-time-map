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
  descriptionLength = 80;
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
        });
    }
    // this.initialData = {id: 1, name: 'Name', location: {address: 'Iulius', city: 'Cluj', country: 'Romania'}};
    // this.picUrl = this.defaultUrl;
    // this.details = {
    //   likes: {count: 500}, url: 'https://example.com',
    //   contact: {twitter: 'ceva', phone: '+40753046160', formattedPhone: '+40 753 046 160'},
    //   description: 'Some loong description which needs see more button addded here unfortunaty salam was here batman'
    // };
  }

  private buildUrl(prefix: string, size: string, suffix: string): string {
    return `${prefix}${size}${suffix}`;
  }

  togglePreview() {

  }

}
