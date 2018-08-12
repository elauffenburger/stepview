import { Component, AfterContentInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, LoadingController, Content } from 'ionic-angular';
import { StepChart, NotesSegmentType, NotesSegment, Note, Arrow, ArrowType, ArrowDirection, NoteType, BEATS_PER_MEASURE, LINES_PER_BEAT } from '../../../lib/stepview-lib/models';
import { DifficultyLevel, isOneOf } from '../../helpers';
import { toBpmChangesLookup, BpmChangesLookup } from '../../../lib/stepview-lib/helpers';
import { NGXLogger } from 'ngx-logger';
import { AbstractStepChartRenderer } from '../../../lib/stepview-lib/services/stepchart-renderer/abstract-renderer';
import { StepChartRenderer } from '../../../lib/stepview-lib/services/stepchart-renderer';

import * as _ from 'lodash';

import 'pixi'
import 'p2';
import 'phaser';

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

        this.renderer = new RealtimeRenderer(this, this.chart, this.notes, this.canvas.nativeElement, this.logger);
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

const GAME_HEIGHT = 640;
const GAME_WIDTH = 480;

class RealtimeRenderer extends AbstractStepChartRenderer {
  private game: Phaser.Game;

  constructor(private page: RealtimeChartViewerPage, chart: StepChart, notes: NotesSegment, canvas: Element, private logger: NGXLogger) {
    super();

    this.initGame(chart, notes, canvas);
  }

  async beforeStopDueToStopRequest() {
    this.game.destroy();
  }

  protected renderNoteToBeat(noteInfo: { note: Note, measureNum: string, noteNum: string, totalNoteNum: number }, beatInfo: { lastBeatDelta: number; bpm: number; }): Promise<void> {
    const waitTime = this.calculateNoteRenderDelayInMs(beatInfo.lastBeatDelta, beatInfo.bpm);

    return new Promise((res) => {

    });
  }

  private initGame(chart: StepChart, notes: NotesSegment, canvas: Element) {
    const game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, canvas);
    game.state.add(StepChartViewerScene.key, new StepChartViewerScene(chart, notes));

    game.state.start(StepChartViewerScene.key);

    this.game = game;
  }
}

const ARROW_HORIZONTAL_OFFSET = 50;
const ARROW_HORIZONTAL_SPACING = 100;
const NOTE_VERTICAL_SPACING = 1;

const ARROW_LEFT = 'arrow-left';
const ARROW_DOWN = 'arrow-down';
const ARROW_UP = 'arrow-up';
const ARROW_RIGHT = 'arrow-right';

const REMOVE_ARROW_THRESHOLD = -100;

class StepChartViewerScene extends Phaser.State {
  static key = 'StepChartViewerScene';

  private graphics: Phaser.Graphics;

  private arrowsGroup: Phaser.Group;
  private noteZone: Phaser.Sprite;

  private debugInfoGroup: Phaser.Group;
  private beatInfo: Phaser.Text;
  private elapsedTimeInfo: Phaser.Text;
  private beatsPerMinuteInfo: Phaser.Text;

  private notes: Note[];
  private bpmChanges: BpmChangesLookup;

  private tick: number;
  private beat: number;
  private currentBeatsPerMinute: number;
  private inSongTimeInMs: number;

  constructor(private chart: StepChart, private notesSegment: NotesSegment) {
    super();
  }

  preload() {
    this.load.image(ARROW_LEFT, 'assets/imgs/arrows/left.png');
    this.load.image(ARROW_DOWN, 'assets/imgs/arrows/down.png');
    this.load.image(ARROW_UP, 'assets/imgs/arrows/up.png');
    this.load.image(ARROW_RIGHT, 'assets/imgs/arrows/right.png');
  }

  create() {
    console.log('renderer started!');

    // Init state
    this.time.desiredFps = 60;
    this.time.advancedTiming = true;
    this.notes = _.flatMap(this.notesSegment.measures, measure => measure.notes);
    this.bpmChanges = toBpmChangesLookup(this.chart.headerSegment.bpmSegments);

    this.inSongTimeInMs = 0;
    this.beat = 0;
    this.currentBeatsPerMinute = this.getBpmChangeForBeat(this.beat);

    // Create game objects
    this.graphics = this.add.graphics(0, 0);
    this.noteZone = this.add.sprite(0, 45);
    this.createDebugInfo();
    this.createArrowsGroup();
  }

  update() {
    // Update state
    this.updateInSongTime();
    this.updateBeat();
    const bpmChanged = this.updateBpm();

    // Handle input requests
    this.handleGenArrowRequest();

    // Update objects
    this.graphics.clear();
    this.updateDebugInfo();
    this.updateArrows(bpmChanged);
  }

  createDebugInfo() {
    const debugInfoGroup = this.add.group();
    this.debugInfoGroup = debugInfoGroup;

    this.beatInfo = this.add.text(50, 50, '', { font: '32px Arial', fill: '#ff0044' }, debugInfoGroup);
    this.elapsedTimeInfo = this.add.text(50, 100, '', { font: '32px Arial', fill: '#ff0044' }, debugInfoGroup);
    this.beatsPerMinuteInfo = this.add.text(50, 150, '', { font: '32px Arial', fill: '#ff0044' }, debugInfoGroup);
  }

  createArrowsGroup() {
    const arrowsGroup = this.add.group();
    arrowsGroup.enableBody = true;
    arrowsGroup.physicsBodyType = Phaser.Physics.ARCADE;

    let noteNumber = 0;
    for (let noteIndex in this.notes) {
      const note = this.notes[noteIndex];
      const arrows = note.data.arrows;

      for (let arrowKey of Object.keys(arrows)) {
        const arrow: Arrow = arrows[arrowKey];
        if (!arrow || isOneOf(arrow.type, ArrowType.Unknown, ArrowType.None, ArrowType.Hold, ArrowType.HoldRollTail, ArrowType.Mine)) {
          continue;
        }

        const { xSpacingMultiplier, arrowSprite } = (function (): { xSpacingMultiplier: number, arrowSprite: string } {
          switch (arrow.direction) {
            case ArrowDirection.Left:
              return { xSpacingMultiplier: 0, arrowSprite: ARROW_LEFT };
            case ArrowDirection.Down:
              return { xSpacingMultiplier: 1, arrowSprite: ARROW_DOWN };
            case ArrowDirection.Up:
              return { xSpacingMultiplier: 2, arrowSprite: ARROW_UP };
            case ArrowDirection.Right:
              return { xSpacingMultiplier: 3, arrowSprite: ARROW_RIGHT };
          }

          throw 'Unknown arrow direction';
        })();

        const x = ARROW_HORIZONTAL_OFFSET + xSpacingMultiplier * ARROW_HORIZONTAL_SPACING;
        const y = NOTE_VERTICAL_SPACING * noteNumber;

        arrowsGroup.create(x, y, arrowSprite);
      }

      noteNumber++;
    }

    this.arrowsGroup = arrowsGroup;
  }

  updateDebugInfo() {
    this.beatInfo.setText(`Beat: ${this.beat.toPrecision(5)}`);
    this.elapsedTimeInfo.setText(`Elapsed: ${this.inSongTimeInMs.toPrecision(10)}ms`);
    this.beatsPerMinuteInfo.setText(`BPM: ${this.currentBeatsPerMinute}`)

    // Draw debug lines for each arrow
    this.arrowsGroup.forEachAlive((arrow: Phaser.Sprite) => {
      if (arrow.y < GAME_HEIGHT && arrow.y > 0) {
        const arrowCenterY = arrow.position.x + arrow.width / 2;
        this.drawDebugArrow(this.graphics, { x: arrowCenterY, y: arrow.position.y }, { x: arrowCenterY, y: this.noteZone.position.y });
      }
    }, {});
  }

  updateArrows(bpmChanged: boolean) {
    const noteZoneVerticalPositionInPx = GAME_HEIGHT - this.noteZone.position.y;

    // Draw note zone
    this.graphics
      .lineStyle(5, 0x00ff00)
      .moveTo(0, this.noteZone.position.y)
      .lineTo(GAME_WIDTH, this.noteZone.position.y);

    const beatsPerSec = this.currentBeatsPerMinute / 60;
    const arrowsScrollSpeedPixelsPerSec = (beatsPerSec * noteZoneVerticalPositionInPx) / LINES_PER_BEAT;

    this.arrowsGroup.forEachAlive((arrow: Phaser.Sprite) => {
      const body = <Phaser.Physics.Arcade.Body>arrow.body;

      if (bpmChanged) {
        body.velocity.y = -arrowsScrollSpeedPixelsPerSec;
      }

      if (body.position.y < REMOVE_ARROW_THRESHOLD) {
        console.log('killing arrow')
        arrow.kill();
      }
    }, {}, false);
  }

  drawDebugArrow(graphics: Phaser.Graphics, from: { x: number, y: number }, to: { x: number, y: number }) {
    graphics.lineStyle(1, 0x0088ff);

    graphics.beginFill();
    graphics.moveTo(from.x, from.y);
    graphics.lineTo(to.x, to.y);
    graphics.endFill();
  }

  sampleElapsedMs() {
    this.tick = this.tick || 0;

    if (this.tick % 100 != 0) {
      return;
    }

    console.log(this.time.physicsElapsedMS);
  }

  updateInSongTime() {
    this.inSongTimeInMs += this.time.physicsElapsedMS;
  }

  updateBeat() {
    const bpms = (this.currentBeatsPerMinute / 60) / 1000;

    this.beat = bpms * this.inSongTimeInMs;
  }

  updateBpm(): boolean {
    const maybeBpmChange = this.getBpmChangeForBeat(this.beat);
    if (maybeBpmChange) {
      this.currentBeatsPerMinute = maybeBpmChange;
      return true;
    }

    return false;
  }

  getBpmChangeForBeat(beat: number): number {
    const beatAsInt = Math.floor(beat);
    const maybeBpmChange = this.bpmChanges[beatAsInt];

    return maybeBpmChange;
  }

  handleGenArrowRequest() {
    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      const placementX = Math.random() * 400;
      const placementY = Math.random() * 1000;

      this.arrowsGroup.create(placementX, placementY, ARROW_LEFT);
    }
  }
}