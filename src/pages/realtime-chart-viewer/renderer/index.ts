import { StepChart, NotesSegment } from '../../../../lib/stepview-lib/models';
import { AbstractStepChartRenderer } from '../../../../lib/stepview-lib/services/stepchart-renderer/abstract-renderer';
import { StepChartViewerScene } from './stepchart-scene';

import 'pixi'
import 'p2';
import 'phaser';

export const GAME_HEIGHT = 640;
export const GAME_WIDTH = 480;

export class RealtimeRenderer extends AbstractStepChartRenderer {
    private game: Phaser.Game;

    constructor(chart: StepChart, notes: NotesSegment, canvas: Element) {
        super();

        this.initGame(chart, notes, canvas);
    }

    async beforeStopDueToStopRequest() {
        this.game.destroy();
    }

    protected renderNoteToBeat(): Promise<void> {
        return new Promise(() => { });
    }

    private initGame(chart: StepChart, notes: NotesSegment, canvas: Element) {
        const game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, canvas);
        game.state.add(StepChartViewerScene.key, new StepChartViewerScene(chart, notes));

        game.state.start(StepChartViewerScene.key);

        this.game = game;
    }
}