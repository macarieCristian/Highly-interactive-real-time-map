import {Component, Input, OnInit} from '@angular/core';
import {EventCustom} from '../../../model/event-custom';
import {TransportService} from '../../../service/transport.service';

@Component({
  selector: 'app-event-popup',
  templateUrl: './event-popup.component.html',
  styleUrls: ['./event-popup.component.scss']
})
export class EventPopupComponent implements OnInit {

  @Input()
  picUrl: string;

  @Input()
  event: EventCustom;

  more = false;
  descriptionLength = 56;

  constructor(private transportService: TransportService) {
  }

  ngOnInit() {
  }

  togglePreview() {
    if (this.existAttachments()) {
      this.transportService.photosPreviewSink(this.event.attachments.map(attachment => attachment.id));
    }
  }

  existAttachments(): boolean {
    return this.event.attachments && this.event.attachments.length > 0;
  }

  openEventChat() {
    this.transportService.openChatEventSink(this.event);
  }
}
