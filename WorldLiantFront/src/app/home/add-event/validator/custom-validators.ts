import {FormGroup, ValidatorFn} from '@angular/forms';

export class CustomValidators {
  static DateRangeValidator: ValidatorFn = (fg: FormGroup) => {
    const start = fg.get('startDate').value;
    const endControl = fg.get('endDate');
    const end = endControl.value;
    let res = null;
    if (start === null || end === null || start > end) {
      res = {rangeError: true};
      endControl.setErrors({incorrect: true});
    }
    return res;
  }
}
