import { Component, AfterContentInit, ViewChild, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, LoadingController, Content } from 'ionic-angular';
import { StepChart, NotesSegmentType, NotesSegment, Note } from '../../../lib/stepview-lib/models';
import { DifficultyLevel } from '../../helpers';
import { NGXLogger } from 'ngx-logger';
import { AbstractStepChartRenderer } from '../../../lib/stepview-lib/services/stepchart-renderer/abstract-renderer';
import { StepChartRenderer } from '../../../lib/stepview-lib/services/stepchart-renderer';

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
export class SimpleChartViewerPage implements AfterContentInit, OnDestroy {
  loader: Loading;
  renderer: StepChartRenderer;

  isPlaying: boolean;
  currentBeat: number;

  chart: StepChart;
  difficulty: DifficultyLevel;
  type: NotesSegmentType;
  notes: NotesSegment;

  @ViewChild('content')
  content: Content;

  constructor(public navCtrl: NavController, public navParams: NavParams, private loadingController: LoadingController, private logger: NGXLogger) {
    this.renderer = new SimpleRenderer(this, logger);

    const args: PageArgs = navParams.data;

    this.chart = args.chart;
    this.difficulty = args.difficulty;
    this.type = args.type;

    this.startChartLoaderNotification()
      .then(() => {
        this.notes = this.findNotesSegmentInChart(this.chart, this.difficulty, this.type);
        if (!this.notes) {
          this.logger.error('Failed to find a notes segment corresponding to chart, difficulty, and type: ', this.chart, this.difficulty, this.type);
          return;
        }
      })
  }

  findNotesSegmentInChart(chart: StepChart, difficulty: DifficultyLevel, type: NotesSegmentType): NotesSegment {
    return chart.noteSegments.find(segment => segment.type == type && segment.difficultyClass == difficulty.class);
  }

  ngAfterContentInit() {
    this.endChartLoaderNotification();
  }

  async startChartLoaderNotification() {
    this.loader = this.loadingController.create({
      content: 'Loading chart...'
    });

    await this.loader.present();
  }

  async endChartLoaderNotification() {
    if (!this.loader) {
      return;
    }

    this.loader.dismiss();
    this.loader = null;
  }

  onClickTogglePlay() {
    return this.isPlaying
      ? this.pause()
      : this.play();
  }

  onClickPause() {
    this.pause();
  }

  ngOnDestroy() {
    this.pause();
  }

  play() {
    this.renderer.render(this.chart, this.notes, {});
    this.isPlaying = true;
  }

  pause() {
    this.renderer.requestStop();
    this.isPlaying = false;
  }
}

class SimpleRenderer extends AbstractStepChartRenderer {
  constructor(private page: SimpleChartViewerPage, private logger: NGXLogger) {
    super();
  }

  protected renderNoteToBeat(noteInfo: { note: Note, measureNum: string, noteNum: string, totalNoteNum: number }, beatInfo: { lastBeatDelta: number; bpm: number; }): Promise<void> {
    const waitTime = this.calculateNoteRenderDelayInMs(beatInfo.lastBeatDelta, beatInfo.bpm);

    return new Promise((res) => {
      setTimeout(() => {
        try {
          this.logger.debug('scrolling to note ', noteInfo.totalNoteNum);
          this.logger.debug('wait time: ', waitTime);

          this.page.content.scrollTo(0, noteInfo.totalNoteNum * 15, 0);
        } catch (e) {
          // TODO: add logging
        } finally {
          res();
        }
      }, waitTime);
    });
  }
}