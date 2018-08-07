import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StepChart, NotesSegmentType } from 'lib/stepview-lib/models';

import * as _ from 'lodash';

export interface PageArgs {
  chart: StepChart
}

@IonicPage()
@Component({
  selector: 'page-chart-details',
  templateUrl: 'chart-details.html',
})
export class ChartDetailsPage {
  chart: StepChart;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    const args: PageArgs = navParams.data;

    this.chart = args.chart;
  }

  getNotesSegmentTypes(): NotesSegmentType[] {
    return _(this.chart.noteSegments)
      .map(segment => segment.type)
      .uniq()
      .value();
  }
}
