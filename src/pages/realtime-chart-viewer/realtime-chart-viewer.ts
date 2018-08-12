import { Component, AfterContentInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, LoadingController, Content } from 'ionic-angular';
import { StepChart, NotesSegmentType, NotesSegment, Note, Arrow, ArrowType, ArrowDirection, NoteType, BEATS_PER_MEASURE, LINES_PER_BEAT, LINES_PER_MEASURE } from '../../../lib/stepview-lib/models';
import { DifficultyLevel, isOneOf } from '../../helpers';
import { toBpmChangesLookup, BpmChangesLookup } from '../../../lib/stepview-lib/helpers';
import { NGXLogger } from 'ngx-logger';
import { AbstractStepChartRenderer } from '../../../lib/stepview-lib/services/stepchart-renderer/abstract-renderer';
import { StepChartRenderer } from '../../../lib/stepview-lib/services/stepchart-renderer';

import * as _ from 'lodash';

import 'pixi'
import 'p2';
import 'phaser';
import { RealtimeRenderer } from './renderer';

export interface PageArgs {
  chart: StepChart;
  difficulty: DifficultyLevel;
  type: NotesSegmentType;
}

@IonicPage()
@Component({
  selector: 'page-realtime-chart-viewer',
  templateUrl: 'realtime-chart-viewer.html',
})
export class RealtimeChartViewerPage implements AfterContentInit, OnDestroy {
  loader: Loading;
  renderer: StepChartRenderer;

  isPlaying: boolean;
  currentBeat: number;

  chart: StepChart;
  difficulty: DifficultyLevel;
  type: NotesSegmentType;
  notes: NotesSegment;

  @ViewChild('gameCanvas')
  canvas: ElementRef;

  constructor(public navCtrl: NavController, public navParams: NavParams, private loadingController: LoadingController, private logger: NGXLogger) {
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

        this.renderer = new RealtimeRenderer(this.chart, this.notes, this.canvas.nativeElement);
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