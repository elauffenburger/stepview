import { StepChartParser, ParseOptions } from "../../services/stepchart-parser";

export const BEATS_PER_MEASURE = 4;

// Since 48 * 4 = 196, we can safely subdivide a measure by 48 lines
export const LINES_PER_MEASURE = 48;

export interface StepChart {
    headerSegment: HeaderSegment;
    noteSegments: NotesSegment[];

    getSourceContent(): string;
    getParser(): StepChartParser;
    getParseOptions(): ParseOptions
}

export interface NotesSegment {
    type: NotesSegmentType;

    description?: string;
    difficultyClass: DifficultyClass;
    difficultyMeter: number;
    radarValues: RadarValues

    measures: NoteMeasureData[];
}

export type NotesSegmentType = 
    'dance-single'
    | 'dance-double'
    | 'dance-solo'
    | 'pump-single'
    | 'pump-double'
    | 'pump-couple'
    | 'ez2-single'
    | 'ez2-double'
    | 'ez2-real'
    | 'para-single'
    | 'unknown';

export type DifficultyClass = 'beginner' | 'easy' | 'medium' | 'hard' | 'challenge';

export interface NoteMeasureData {
    measure: number;
    notes: Note[];
}

export type Note = {
    beat: number;
    type: NoteType;
    rawData: string;
    data: NoteData;
}

export interface NoteData {
    arrows: NoteDataArrows
}

export interface NoteDataArrows {
    left: Arrow;
    down: Arrow;
    up: Arrow;
    right: Arrow;
    left2?: Arrow;
    down2?: Arrow;
    up2?: Arrow;
    right2?: Arrow;
}

export interface Arrow {
    direction: ArrowDirection;
    type: ArrowType;
}

export enum ArrowDirection {
    Left = 'left',
    Down = 'down',
    Up = 'up',
    Right = 'right'
}

export enum ArrowType {
    Unknown,
    None,
    Normal,
    HoldHead,
    Hold,
    HoldRollTail,
    RollHead,
    Mine,
}

export enum NoteType {
    UNKNOWN = 0,
    QUARTER = 1 / 4,
    EIGHTH = 1 / 8,
    TWELFTH = 1 / 12,
    SIXTEENTH = 1 / 16,
    TWENTY_FOURTH = 1 / 24,
    THIRTY_SECOND = 1 / 32,
    FORTY_EIGHTH = 1 / 48,
    SIXTY_FOURTH = 1 / 64,
    ONE_NINETY_SECOND = 1 / 192
}

export interface RadarValues {
    voltage: number;
    stream: number;
    chaos: number;
    freeze: number;
    air: number;
}

export interface HeaderSegment {
    title?: string;
    subtitle?: string;
    artist?: string;
    credit?: string;

    titleTransliteration?: string;
    subtitleTransliteration?: string;
    artistTransliteration?: string;

    bannerFileName?: string;
    backgroundFileName?: string;
    cdTitle?: string;
    musicFileName?: string;

    // The amount of time in seconds before or after the music starts that beat 0 occurs
    offset?: number;

    // The time in seconds to start the music sample that plays on the select music screen
    sampleStart?: number;
    // The time in seconds to let the sample music play after starting 
    sampleLength?: number;

    // If 'NO', the song cannot be selected manually
    selectable?: boolean;

    // Represents a BPM segment in gampelay
    bpmSegments?: BpmSegment[];

    // Overrides the song's actual BPM display at ScreenSelectMusic
    displayBpm?: number | '*';

    // Represents Stops in gameplay.
    stopSegments?: StopSegment[];

    // Indicates background changes during gameplay
    bgChangeSegments?: BgChangeSegment[];
}

export interface BgChangeSegment {
    // The beat to change the background at
    beat: number;

    // The background name to change to
    name: string;
}

export interface BpmSegment {
    // The beat to change speed at
    beat: number;

    // The speed to change to
    bpm: number;
}

export interface StopSegment {
    // The beat to stop at
    beat: number;

    // The duration, in seconds, to stop for
    duration: number;
}

export function makeEmptyNote(): Note {
    return {
        beat: 0,
        rawData: '',
        type: NoteType.UNKNOWN,
        data: { arrows: makeEmptyArrows() }
    }
}

export function makeEmptyArrows(): NoteDataArrows {
    return {
        left: { type: ArrowType.None, direction: ArrowDirection.Left },
        down: { type: ArrowType.None, direction: ArrowDirection.Down },
        up: { type: ArrowType.None, direction: ArrowDirection.Up },
        right: { type: ArrowType.None, direction: ArrowDirection.Right },
    };
}