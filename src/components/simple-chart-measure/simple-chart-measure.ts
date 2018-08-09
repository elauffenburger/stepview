import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NoteMeasureData, ArrowDirection } from '../../../lib/stepview-lib/models';

@Component({
  selector: 'simple-chart-measure',
  templateUrl: 'simple-chart-measure.html'
})
export class SimpleChartMeasureComponent implements OnChanges {
  @Input()
  measure: NoteMeasureData;

  constructor() { }

  getImageUrlForDirection(direction: ArrowDirection): string {
    return `assets/img/arrows/${direction}`;
  }

  ngOnChanges(changes: SimpleChanges) {
    const measure = changes["measure"];
    if (measure) {
      console.log('new measure value: ', measure);
    }
  }
}
