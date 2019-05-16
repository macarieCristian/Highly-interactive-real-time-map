import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {UserService} from '../../shared/service/user.service';
import {LocalStorageConstants} from '../../shared/constants/local-storage-constants';
import {Scan} from '../../shared/model/scan';
import {ToastrUtilService} from '../../shared/service/toastr-util.service';
import {UtilityService} from '../../shared/service/utility.service';
import {ScanAreaRepository} from '../../shared/repository/scan-area-repository';
import {ScanAreaService} from '../../shared/service/scan-area.service';
import {ScanAreaNotificationStatusType} from '../../shared/model/enums/scan-area-notification-status-type';

@Component({
  selector: 'app-scan-area',
  templateUrl: './scan-area.component.html',
  styleUrls: ['./scan-area.component.scss']
})
export class ScanAreaComponent implements OnInit, AfterViewInit {
  @ViewChild('confirmModal') confirmModal;
  @ViewChild('nameModal') nameModal;
  @ViewChild('scanAreas') scanAreasModal;
  rememberChoice: boolean;
  saveArea: boolean;
  name: string;
  notification: boolean;
  scanArea: any;
  scanAreasDisplay: Scan[];

  @Output() doScan: EventEmitter<Scan> = new EventEmitter<Scan>();

  constructor(private userService: UserService,
              private scanAreaService: ScanAreaService,
              private utilityService: UtilityService,
              private scanAreaRepo: ScanAreaRepository,
              private toastrUtilService: ToastrUtilService) {
  }

  ngOnInit() {
    const saveOption = localStorage.getItem(LocalStorageConstants.REMEMBER_SAVE_CHOICE);
    this.rememberChoice = !!saveOption;
    this.saveArea = saveOption === 'save';
    this.notification = false;
  }

  ngAfterViewInit() {
    // this.scanAreasModal.show();
  }

  cleanUp() {
    this.rememberChoice = false;
    this.saveArea = false;
    this.notification = false;
    this.name = '';
    this.scanArea = undefined;
  }

  openConfirmModal() {
    this.confirmModal.show();
  }

  closeConfirmModal() {
    this.confirmModal.hide();
  }

  openNameModal() {
    this.nameModal.show();
  }

  closeNameModal() {
    this.name = '';
    this.scanArea = undefined;
    this.notification = false;
    this.nameModal.hide();
  }

  startSaveProcess(layer: any) {
    if (!this.rememberChoice) {
      this.openConfirmModal();
    } else {
      if (this.saveArea) {
        if (layer) {
          this.openNameModal();
        } else {
          this.toastrUtilService.displayWarningToastr('No scan area', 'There is no active scan area.');
        }
      }
    }
    this.scanArea = layer;
  }

  affirmativeConfirm() {
    if (this.rememberChoice) {
      this.saveArea = true;
      localStorage.setItem(LocalStorageConstants.REMEMBER_SAVE_CHOICE, 'save');
    }
    this.closeConfirmModal();
    if (this.scanArea) {
      this.openNameModal();
    }
  }

  negativeConfirm() {
    if (this.rememberChoice) {
      this.saveArea = false;
      localStorage.setItem(LocalStorageConstants.REMEMBER_SAVE_CHOICE, 'dont_save');
    }
    this.closeConfirmModal();
  }

  saveScanArea() {
    if (this.scanArea && this.name) {
      const id = +localStorage.getItem(LocalStorageConstants.ID);
      const latlng = this.scanArea.getLatLng();
      const scan = new Scan();
      scan.latitude = latlng.lat;
      scan.longitude = latlng.lng;
      scan.radius = this.scanArea.getRadius();
      scan.name = this.name;
      scan.notificationStatus = this.notification === true ?
        ScanAreaNotificationStatusType.ENABLED : ScanAreaNotificationStatusType.DISABLED;
      this.closeNameModal();
      this.utilityService.getLocationDetailsReverseGeocoding(latlng.lat, latlng.lng)
        .subscribe(res => {
          scan.country = res.address.country;
          scan.county = res.address.county;
          scan.city = res.address.city ? res.address.city : res.address.village;
          scan.scanOptions = this.scanAreaRepo.getSelectedScanAreaOptionIds();
          this.scanAreaService.saveScanArea(id, scan)
            .subscribe(result => {
              console.log(result);
              this.toastrUtilService.displaySuccessToastr('Scan saved', 'The scan area was saved successfully!');
            });
        });
    }
  }

  openScanAreasModal() {
    this.scanAreasModal.show();
    this.userService.getScanAreas(localStorage.getItem(LocalStorageConstants.USERNAME))
      .subscribe(res => {
        this.scanAreasDisplay = res;
      });
  }

  deleteScanArea(scan: Scan, index: number) {
    this.scanAreaService.deleteScanArea(localStorage.getItem(LocalStorageConstants.USERNAME), scan.id)
      .subscribe(res => {
        if (res) {
          this.scanAreasDisplay.splice(index, 1);
          this.toastrUtilService.displaySuccessToastr('Scan deleted', 'The scan area was deleted successfully!');
        }
      });
  }

  circleArea(radius: number): number {
    return Math.trunc(Math.PI * Math.pow(radius, 2) / 1000);
  }

  scanGivenArea(scan: Scan) {
    this.scanAreasModal.hide();
    this.doScan.emit(scan);
  }

  radiusPreDisplay(radius: number) {
    return Math.trunc(radius) / 1000;
  }
}
