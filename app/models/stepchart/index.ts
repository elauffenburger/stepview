export interface StepChart {
    header: HeaderSegment
    notes: NotesSegment[]
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

    noteData: NoteMeasureData[];
}

export interface NoteMeasureData {
    measure: number;
    data: NoteData[];
}

export interface NoteData {
    beat: number;
    data: string;
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