import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgxGalleryImage, NgxGalleryOptions} from 'ngx-gallery';
import {TransportService} from '../../../service/transport.service';
import {HttpParams} from '@angular/common/http';
import {ServerUrls} from '../../../constants/server-urls';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-gallery-preview',
  templateUrl: './gallery-preview.component.html',
  styleUrls: ['./gallery-preview.component.scss']
})
export class GalleryPreviewComponent implements OnInit, OnDestroy {
  @ViewChild('galery') galery;

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  transportServiceSubscription: Subscription;

  constructor(private transportService: TransportService) {
  }

  ngOnInit() {
    this.galleryImages = [];

    this.galleryOptions = [
      {image: false, thumbnails: false, width: '0px', height: '0px'}
    ];

    this.transportServiceSubscription = this.transportService.photosPreviewStream()
      .subscribe(attachmentIds => {
        this.galleryImages = this.getUrlList(attachmentIds);
        setTimeout(() => {
          this.galery.openPreview(0);
        }, 0);
      });
  }

  ngOnDestroy(): void {
    this.transportServiceSubscription.unsubscribe();
  }

  private getUrlList(attachmentIds: number[]): any {
    return attachmentIds.map(id => {
      return {
        small: this.prepareUrl(id),
        medium: this.prepareUrl(id),
        big: this.prepareUrl(id)
      };
    });
  }

  private prepareUrl(idPicture: number): string {
    const httpParams = new HttpParams()
      .set('idPicture', `${idPicture}`);
    return `${ServerUrls.ATTACHMENT_PICTURE}?${httpParams.toString()}`;
  }

}
