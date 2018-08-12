import { StepChart, NotesSegment, Note, Arrow, ArrowType, ArrowDirection, BEATS_PER_MEASURE, LINES_PER_BEAT, LINES_PER_MEASURE } from '../../../../lib/stepview-lib/models';
import { isOneOf } from '../../../helpers';
import { toBpmChangesLookup, BpmChangesLookup } from '../../../../lib/stepview-lib/helpers';
import { GAME_HEIGHT, GAME_WIDTH } from '.';

import * as _ from 'lodash';

const ARROW_HORIZONTAL_OFFSET = 50;
const ARROW_HORIZONTAL_SPACING = 100;
const NOTE_VERTICAL_SPACING = 7;

const ARROW_LEFT = 'arrow-left';
const ARROW_DOWN = 'arrow-down';
const ARROW_UP = 'arrow-up';
const ARROW_RIGHT = 'arrow-right';

const REMOVE_ARROW_THRESHOLD = -100;

export class StepChartViewerScene extends Phaser.State {
    static key = 'StepChartViewerScene';

    private graphics: Phaser.Graphics;

    private arrowsGroup: Phaser.Group;
    private noteZone: Phaser.Sprite;

    private debugMode: boolean;
    private debugInfoGroup: Phaser.Group;
    private beatInfo: Phaser.Text;
    private elapsedTimeInfo: Phaser.Text;
    private beatsPerMinuteInfo: Phaser.Text;
    private arrowVelocityInfo: Phaser.Text;

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

        this.debugMode = true;
        this.inSongTimeInMs = 0;
        this.beat = 0;
        this.currentBeatsPerMinute = this.getBpmChangeForBeat(this.beat);

        // Create game objects
        this.graphics = this.add.graphics(0, 0);
        this.noteZone = this.add.sprite(0, 45);
        this.createDebugInfo();
        this.createArrowsGroup();

        // Setup key bindings
        this.game.input.keyboard.addKey(Phaser.Keyboard.D).onDown.add(() => {
            this.debugMode = !this.debugMode;
        });

        this.game.input.keyboard.addKey(Phaser.Keyboard.T).onDown.add(() => {
            this.spawnTimedArrow();
        });
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

        const debugTextStyle = { font: '32px Arial', fill: '#ff0044' };
        this.beatInfo = this.add.text(50, 50, '', debugTextStyle, debugInfoGroup);
        this.elapsedTimeInfo = this.add.text(50, 100, '', debugTextStyle, debugInfoGroup);
        this.beatsPerMinuteInfo = this.add.text(50, 150, '', debugTextStyle, debugInfoGroup);
        this.arrowVelocityInfo = this.add.text(50, 200, '', debugTextStyle, debugInfoGroup);
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

                const arrowSprite: Phaser.Sprite = this.createArrowSprite(arrow.direction, noteNumber);

                arrowsGroup.add(arrowSprite);
                arrowSprite.visible = false;
            }

            noteNumber++;
        }

        this.arrowsGroup = arrowsGroup;
    }

    private createArrowSprite(direction: ArrowDirection, noteNumber: number): Phaser.Sprite {
        const { xSpacingMultiplier, arrowSpriteName } = (function (): {
            xSpacingMultiplier: number;
            arrowSpriteName: string;
        } {
            switch (direction) {
                case ArrowDirection.Left:
                    return { xSpacingMultiplier: 0, arrowSpriteName: ARROW_LEFT };
                case ArrowDirection.Down:
                    return { xSpacingMultiplier: 1, arrowSpriteName: ARROW_DOWN };
                case ArrowDirection.Up:
                    return { xSpacingMultiplier: 2, arrowSpriteName: ARROW_UP };
                case ArrowDirection.Right:
                    return { xSpacingMultiplier: 3, arrowSpriteName: ARROW_RIGHT };
            }
            throw 'Unknown arrow direction';
        })();

        const x = ARROW_HORIZONTAL_OFFSET + xSpacingMultiplier * ARROW_HORIZONTAL_SPACING;
        const y = NOTE_VERTICAL_SPACING * noteNumber;

        return this.add.sprite(x, y, arrowSpriteName);
    }

    updateDebugInfo() {
        this.debugInfoGroup.visible = this.debugMode;

        if (!this.debugMode) {
            return;
        }

        this.beatInfo.setText(`Beat: ${this.beat.toPrecision(5)}`);
        this.elapsedTimeInfo.setText(`Elapsed: ${this.inSongTimeInMs.toPrecision(10)}ms`);
        this.beatsPerMinuteInfo.setText(`BPM: ${this.currentBeatsPerMinute}`)
        this.arrowVelocityInfo.setText(`px/s: ${this.calculateArrowVelocity()}`)

        // Draw debug lines for each arrow
        this.arrowsGroup.forEachAlive((arrow: Phaser.Sprite) => {
            if (arrow.y < GAME_HEIGHT && arrow.y > 0) {
                const arrowCenterY = arrow.position.y + arrow.height / 2;

                // Draw horizontal guideline
                this.drawDebugArrow(this.graphics, { x: 0, y: arrowCenterY }, { x: GAME_HEIGHT, y: arrowCenterY });
            }
        }, {});
    }

    updateArrows(bpmChanged: boolean) {
        const arrowsScrollSpeedPixelsPerSec = this.calculateArrowVelocity();

        // Draw note zone
        this.graphics
            .lineStyle(5, 0x00ff00)
            .moveTo(0, this.noteZone.position.y)
            .lineTo(GAME_WIDTH, this.noteZone.position.y);

        this.arrowsGroup.forEachAlive((arrow: Phaser.Sprite) => {
            const body = <Phaser.Physics.Arcade.Body>arrow.body;

            if (bpmChanged) {
                body.velocity.y = -arrowsScrollSpeedPixelsPerSec;
            }

            if (body.position.y > 0) {
                arrow.visible = true;
            }

            if (body.position.y < REMOVE_ARROW_THRESHOLD) {
                console.log('killing arrow')
                arrow.kill();
            }
        }, {}, false);
    }

    private calculateArrowVelocity() {
        const noteZoneVerticalHeightPx = GAME_HEIGHT - this.noteZone.position.y;

        const beatsPerSec = this.currentBeatsPerMinute / 60;
        const secPerLine = 1 / (beatsPerSec * LINES_PER_BEAT);

        const arrowsScrollSpeedPixelsPerSec = noteZoneVerticalHeightPx;

        return arrowsScrollSpeedPixelsPerSec;
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

    spawnTimedArrow() {
        const arrow = this.createArrowSprite(ArrowDirection.Left, 0);
        arrow.position.y = GAME_HEIGHT;

        this.arrowsGroup.add(arrow);
        const body: Phaser.Physics.Arcade.Body = arrow.body;

        const velocity = this.calculateArrowVelocity();

        body.velocity.y = -velocity;
    }
}