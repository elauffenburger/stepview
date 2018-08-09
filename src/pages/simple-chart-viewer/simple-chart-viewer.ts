import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StepChart, NotesSegmentType, NotesSegment, DifficultyClass } from 'lib/stepview-lib/models';
import { DifficultyLevel } from '../../helpers';
import { NGXLogger } from 'ngx-logger';

export interface PageArgs {
  chart: StepChart;
  difficulty: DifficultyLevel;
  type: NotesSegmentType;
}

@IonicPage()
@Component({
  selector: 'page-simple-chart-viewer',
  templateUrl: 'simple-chart-viewer.html',
})
export class SimpleChartViewerPage {
  chart: StepChart;
  difficulty: DifficultyLevel;
  type: NotesSegmentType;

  notes: NotesSegment;

  constructor(public navCtrl: NavController, public navParams: NavParams, private logger: NGXLogger) {
    const args: PageArgs = navParams.data;

    this.chart = args.chart;
    this.difficulty = args.difficulty;
    this.type = args.type;

    this.notes = this.findNotesSegmentInChart(this.chart, this.difficulty, this.type);
    if (!this.notes) {
      this.logger.error('Failed to find a notes segment corresponding to chart, difficulty, and type: ', this.chart, this.difficulty, this.type);
      return;
    }
  }

  findNotesSegmentInChart(chart: StepChart, difficulty: DifficultyLevel, type: NotesSegmentType): NotesSegment {
    return chart.noteSegments.find(segment => segment.type == type && segment.difficultyClass == difficulty.class);
  }
}
