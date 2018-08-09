import { Component, Input, OnChanges, SimpleChanges, AfterContentChecked } from '@angular/core';
import { NoteMeasureData, ArrowDirection, Note, NoteType, Arrow, ArrowType } from '../../../lib/stepview-lib/models';
import { LoadingController, Loading } from 'ionic-angular';

@Component({
  selector: 'simple-chart-measure',
  templateUrl: 'simple-chart-measure.html'
})
export class SimpleChartMeasureComponent implements OnChanges {
  @Input()
  measure: NoteMeasureData;

  constructor() { }

  getImageUrlForDirection(direction: ArrowDirection): string {
    return `./assets/imgs/arrows/${direction}.png`;
  }

  ngOnChanges(changes: SimpleChanges) { }

  isBlank(note: Note): boolean {
    return note.type == NoteType.UNKNOWN;
  }

  isEmptyArrow(arrow: Arrow): boolean {
    return arrow.type == ArrowType.None;
  }
}
