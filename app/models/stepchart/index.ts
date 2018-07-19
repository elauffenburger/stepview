export const BEATS_PER_MEASURE = 4;

export interface StepChart {
    headerSegment: HeaderSegment
    noteSegments: NotesSegment[]
}

export interface NotesSegment {
    type: 'dance-single'
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

    description?: string;
    difficultyClass: 'beginner' | 'easy' | 'medium' | 'hard' | 'challenge';
    difficultyMeter: number;
    radarValues: RadarValues

    measures: NoteMeasureData[];
}

export interface NoteMeasureData {
    measure: number;
    notes: Note[];
}

export interface Note {
    beat: number;
    type: NoteType;
    rawData: string;
    data: NoteData;
}

export interface NoteData {
    arrows: {
        left: ArrowType;
        down: ArrowType;
        up: ArrowType;
        right: ArrowType;
        left2?: ArrowType;
        down2?: ArrowType;
        up2?: ArrowType;
        right2?: ArrowType;
    }
}

export enum ArrowType {
    None = 0,
    Normal = 1,
    HoldHead = 2,
    HoldRollTail = 3,
    RollHead = 4,
    Mine = 'M'
}

export enum NoteType {
    QUARTER = 1 / 4,
    EIGHTH = 1 / 8,
    TWELFTH = 1 / 12,
    SIXTEENTH = 1 / 16,
    TWENTY_FOURTH = 1 / 24,
    THIRTY_SECOND = 1 / 32,
    FOURTY_EIGHTH = 1 / 48,
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