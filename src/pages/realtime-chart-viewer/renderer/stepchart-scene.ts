import { StepChart, NotesSegment, Note, Arrow, ArrowType, ArrowDirection, BEATS_PER_MEASURE, LINES_PER_BEAT, LINES_PER_MEASURE } from '../../../../lib/stepview-lib/models';
import { isOneOf } from '../../../helpers';
import { toBpmChangesLookup, BpmChangesLookup } from '../../../../lib/stepview-lib/helpers';
import { GAME_HEIGHT, GAME_WIDTH } from '.';

import * as _ from 'lodash';

const ARROW_HORIZONTAL_OFFSET = 50;
const ARROW_HORIZONTAL_SPACING = 100;
const NOTE_VERTICAL_SPACING = 7;

const REMOVE_ARROW_THRESHOLD = -100;

const SPRITES = {
    arrows: {
        left: 'arrow-left',
        down: 'arrow-down',
        up: 'arrow-up',
        right: 'arrow-right',
    }
}

export class StepChartViewerScene extends Phaser.State {
    static key = 'StepChartViewerScene';

    private notes: Note[];
    private bpmChanges: BpmChangesLookup;

    private graphics: Phaser.Graphics;

    // Ops
    private arrows: ArrowOps = new ArrowOps(this, () => this.graphics);
    private debug: DebugOps = new DebugOps(this, () => this.graphics, this.arrows);

    private tick: number;

    beat: number;
    currentBeatsPerMinute: number;
    inSongTimeInMs: number;

    constructor(private chart: StepChart, private notesSegment: NotesSegment) {
        super();
    }

    preload() {
        const arrowSprites = SPRITES.arrows;

        this.load.image(arrowSprites.left, 'assets/imgs/arrows/left.png');
        this.load.image(arrowSprites.down, 'assets/imgs/arrows/down.png');
        this.load.image(arrowSprites.up, 'assets/imgs/arrows/up.png');
        this.load.image(arrowSprites.right, 'assets/imgs/arrows/right.png');
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
        this.arrows.create(this.notes);
        this.debug.create();

        this.debug.enabled = true;

        // Setup key bindings
        this.game.input.keyboard.addKey(Phaser.Keyboard.D).onDown.add(() => {
            this.debug.enabled = !this.debug.enabled;
        });
    }

    update() {
        // Update state
        this.updateInSongTime();
        this.updateBeat();
        const bpmChanged = this.updateBpm();

        // Update objects
        this.graphics.clear();
        this.arrows.update(bpmChanged);
        this.debug.update({
            beat: this.beat,
            elapsedMs: this.inSongTimeInMs,
            bpm: this.currentBeatsPerMinute,
            velocity: this.arrows.calculateArrowVelocity()
        });
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
}

class ArrowOps {
    arrowsGroup: Phaser.Group;
    noteZone: Phaser.Sprite;

    constructor(private scene: StepChartViewerScene, private graphics: () => Phaser.Graphics) { }

    create(notes: Note[]) {
        // Create Note Zone
        this.noteZone = this.scene.add.sprite(0, 45);

        // Create Arrows Group
        const arrowsGroup = this.scene.add.group();
        arrowsGroup.enableBody = true;
        arrowsGroup.physicsBodyType = Phaser.Physics.ARCADE;

        let noteNumber = 0;
        for (let noteIndex in notes) {
            const note = notes[noteIndex];
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

        console.log('created arrowsGroup')
        this.arrowsGroup = arrowsGroup;
    }

    createArrowSprite(direction: ArrowDirection, noteNumber: number): Phaser.Sprite {
        const { xSpacingMultiplier, arrowSpriteName } = (function (): {
            xSpacingMultiplier: number;
            arrowSpriteName: string;
        } {
            switch (direction) {
                case ArrowDirection.Left:
                    return { xSpacingMultiplier: 0, arrowSpriteName: SPRITES.arrows.left };
                case ArrowDirection.Down:
                    return { xSpacingMultiplier: 1, arrowSpriteName: SPRITES.arrows.down };
                case ArrowDirection.Up:
                    return { xSpacingMultiplier: 2, arrowSpriteName: SPRITES.arrows.up };
                case ArrowDirection.Right:
                    return { xSpacingMultiplier: 3, arrowSpriteName: SPRITES.arrows.right };
            }
            throw 'Unknown arrow direction';
        })();

        const x = ARROW_HORIZONTAL_OFFSET + xSpacingMultiplier * ARROW_HORIZONTAL_SPACING;
        const y = NOTE_VERTICAL_SPACING * noteNumber;

        return this.scene.add.sprite(x, y, arrowSpriteName);
    }

    update(bpmChanged: boolean) {
        const arrowsScrollSpeedPixelsPerSec = this.calculateArrowVelocity();

        // Draw note zone
        this.graphics()
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

    calculateArrowVelocity() {
        // beats per second
        const beatsPerSec = this.scene.currentBeatsPerMinute / 60;

        // px taken up by a measure
        const pxPerMeasure = LINES_PER_MEASURE * NOTE_VERTICAL_SPACING;

        // px we need to travel per beat
        const pxPerBeat = pxPerMeasure / BEATS_PER_MEASURE;

        const pxPerSec = pxPerBeat * beatsPerSec;

        return pxPerSec;
    }
}

class DebugOps {
    enabled: boolean;

    private debugInfoGroup: Phaser.Group;
    private beatInfo: Phaser.Text;
    private elapsedTimeInfo: Phaser.Text;
    private beatsPerMinuteInfo: Phaser.Text;
    private arrowVelocityInfo: Phaser.Text;

    constructor(private scene: StepChartViewerScene, private graphics: () =>Phaser.Graphics, private arrows: ArrowOps) { }

    create() {
        const debugInfoGroup = this.scene.add.group();
        this.debugInfoGroup = debugInfoGroup;

        const debugTextStyle = { font: '32px Arial', fill: '#ff0044' };
        this.beatInfo = this.scene.add.text(50, 50, '', debugTextStyle, debugInfoGroup);
        this.elapsedTimeInfo = this.scene.add.text(50, 100, '', debugTextStyle, debugInfoGroup);
        this.beatsPerMinuteInfo = this.scene.add.text(50, 150, '', debugTextStyle, debugInfoGroup);
        this.arrowVelocityInfo = this.scene.add.text(50, 200, '', debugTextStyle, debugInfoGroup);

        this.scene.game.input.keyboard.addKey(Phaser.Keyboard.T).onDown.add(() => {
            this.spawnTimedArrow();
        });
    }

    update(info: { beat: number, elapsedMs: number, bpm: number, velocity: number }) {
        this.debugInfoGroup.visible = this.enabled;

        if (!this.enabled) {
            return;
        }

        this.beatInfo.setText(`Beat: ${info.beat.toPrecision(5)}`);
        this.elapsedTimeInfo.setText(`Elapsed: ${info.elapsedMs.toPrecision(10)}ms`);
        this.beatsPerMinuteInfo.setText(`BPM: ${info.bpm}`)
        this.arrowVelocityInfo.setText(`px/s: ${info.velocity}`)

        // Draw debug lines for each arrow
        this.arrows.arrowsGroup.forEachAlive((arrow: Phaser.Sprite) => {
            if (arrow.y < GAME_HEIGHT && arrow.y > 0) {
                const arrowCenterY = arrow.position.y + arrow.height / 2;

                // Draw horizontal guideline
                this.drawDebugArrow(this.graphics(), { x: 0, y: arrowCenterY }, { x: GAME_HEIGHT, y: arrowCenterY });
            }
        }, {});

        // Handle input requests
        this.handleGenArrowRequest();
    }

    handleGenArrowRequest() {
        if (this.scene.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            const placementX = Math.random() * 400;
            const placementY = Math.random() * 1000;

            this.arrows.arrowsGroup.create(placementX, placementY, SPRITES.arrows.left);
        }
    }

    spawnTimedArrow() {
        const arrow = this.arrows.createArrowSprite(ArrowDirection.Left, 0);
        arrow.position.y = GAME_HEIGHT;

        this.arrows.arrowsGroup.add(arrow);
        const body: Phaser.Physics.Arcade.Body = arrow.body;

        const velocity = this.arrows.calculateArrowVelocity();

        body.velocity.y = -velocity;
    }

    drawDebugArrow(graphics: Phaser.Graphics, from: { x: number, y: number }, to: { x: number, y: number }) {
        graphics.lineStyle(1, 0x0088ff);

        graphics.beginFill();
        graphics.moveTo(from.x, from.y);
        graphics.lineTo(to.x, to.y);
        graphics.endFill();
    }
}