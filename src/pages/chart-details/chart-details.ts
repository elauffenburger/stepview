import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { StepChart, NotesSegmentType, DifficultyClass } from 'lib/stepview-lib/models';

import * as _ from 'lodash';
import { DifficultyLevel, getDifficultyLevelsForChart, getColorForDifficultyClass } from '../../helpers';
import { SimpleChartViewerPage, PageArgs as SimpleChartViewerPageArgs } from '../simple-chart-viewer/simple-chart-viewer';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, private alert: AlertController) {
    const args: PageArgs = navParams.data;
    const chart = args.chart;

    // We need to reparse the chart to get its full contents
    const fullChart = chart.getParser()
      .parse(chart.getSourceContent(), { includeNotesSegments: true, normalizeChart: true });

    this.chart = fullChart;
  }

  getNotesSegmentTypes(): NotesSegmentType[] {
    return _(this.chart.noteSegments)
      .map(segment => segment.type)
      .uniq()
      .value();
  }

  onClickSelectDifficulty(type: NotesSegmentType, difficultyLevel: DifficultyLevel) {
    const args: SimpleChartViewerPageArgs = {
      chart: this.chart,
      difficulty: difficultyLevel,
      type: type
    };

    this.navCtrl.push(SimpleChartViewerPage, args)
  }

  getDifficultyLevelsForNotesSegmentType(type: NotesSegmentType): DifficultyLevel[] {
    return getDifficultyLevelsForChart(this.chart, type);
  }

  getColorForDifficultyClass(difficultyClass: DifficultyClass): string {
    return getColorForDifficultyClass(difficultyClass);
  }
}
