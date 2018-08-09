import { StepChart, NoteType, ArrowType, ArrowDirection, makeEmptyArrows, NotesSegmentType, DifficultyClass } from '../../../../lib/stepview-lib/models/stepchart';
import { SmFileStepChartParser } from "../../../../lib/stepview-lib/services/stepchart-parser";
import { toLines } from '../../../../lib/stepview-lib/helpers';

const fs = require('fs');
const path = require('path');

function readFile(filePath: string) {
    const file = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
    const fileLines = toLines(file);

    return { file, fileLines };
}

const breakFree = readFile('./files/Break Free.sm');
const bendYourMind = readFile('./files/Bend Your Mind.sm');

const parser = new SmFileStepChartParser();

export const CHART_FIXTURE: StepChart = makeFixture();

describe('can parse the header', () => {
    it('can parse basic header info', () => {
        const titleLine = breakFree.fileLines[0];
        expect(titleLine).toEqual('#TITLE:Break Free;');

        const parsedTitleLine = parser.parseHeaderLine(titleLine);
        expect(parsedTitleLine).toEqual({ tag: 'TITLE', rawValue: 'Break Free', value: 'Break Free' });
    })

    it('can parse header segment', () => {
        const headerSegment = parser.parse(breakFree.file).headerSegment;

        expect(headerSegment).toEqual(CHART_FIXTURE.headerSegment);
    });
});

describe('can parse note segments', () => {
    it('can parse note segments', () => {
        const notesSegments = parser.parse(breakFree.file, { normalizeChart: false }).noteSegments;

        expect(notesSegments).toEqual(CHART_FIXTURE.noteSegments);
    });

    it('can parse dense note segments', () => {
        const notes = parser.parse(bendYourMind.file, { normalizeChart: true })
            .noteSegments
            .find(segment => segment.type == 'dance-single' && segment.difficultyClass == 'challenge');

        // Measure 43 is DEEENSE
        const measure = notes.measures[43];

        measure.notes.forEach((note, i) => {
            if (i == 0) {
                return;
            }

            const previousNote = measure.notes[i];
            if (note.beat <= previousNote.beat) {
                fail();
            }
        });
    });
})

function makeDenseMeasure(): string {
    return `
        0100
        0000
        0010
        0000
        1000
        0000
        0001
        1000
        0001
        0000
        0000
        0000
        0100
        0000
        0000
        0000
        0000
        0000
        0010
        1000
        0010
        0000
        1000
        0000
        0001
        0000
        0100
        0000
        0001
        0000
        0000
        0000
    `
        .trim();
}

function makeFixture(): StepChart {
    return <StepChart>{
        headerSegment: {
            title: 'Break Free',
            subtitle: '',
            artist: 'Ariana Grande feat. Zedd',
            titleTransliteration: '',
            subtitleTransliteration: '',
            artistTransliteration: '',
            credit: '',
            bannerFileName: 'Break Free.png',
            backgroundFileName: 'Break Free-bg.png',
            cdTitle: './CDTitles/DDR A.png',
            musicFileName: 'Break Free.ogg',
            offset: 0.000000,
            sampleStart: 53.536999,
            sampleLength: 15.000000,
            selectable: true,
            displayBpm: 130.000000,
            bpmSegments: [
                {
                    beat: 0,
                    bpm: 130.000000
                }
            ],
            stopSegments: [],
            bgChangeSegments: [
                {
                    beat: 0,
                    name: 'Break Free.avi=1.000=0=0=0=StretchNoLoop===='
                },
                {
                    beat: 99999,
                    name: '-nosongbg-=1.000=0=0=0'
                }
            ]
        },
        noteSegments: [{
            type: 'dance-single',
            description: '',
            difficultyClass: 'hard',
            difficultyMeter: 11,
            radarValues: {
                voltage: 0.478571,
                stream: 0.508646,
                chaos: 0.291667,
                freeze: 0.275000,
                air: 0.045833
            },
            measures: [
                {
                    measure: 0,
                    notes: [
                        {
                            beat: 0,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 1,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 2,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 3,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                    ]
                },
                {
                    measure: 1,
                    notes: [
                        {
                            beat: 4,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 5,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 6,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 7,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                    ]
                },
                {
                    measure: 2,
                    notes: [
                        {
                            beat: 8,
                            rawData: '0001',
                            data: {
                                arrows: {
                                    ...makeEmptyArrows(),
                                    right: { direction: ArrowDirection.Right, type: ArrowType.Normal }
                                }
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 8.5,
                            rawData: '0100',
                            data: {
                                arrows: {
                                    ...makeEmptyArrows(),
                                    down: { direction: ArrowDirection.Down, type: ArrowType.Normal }
                                }
                            },
                            type: NoteType.EIGHTH
                        },
                        {
                            beat: 9,
                            rawData: '0001',
                            data: {
                                arrows: {
                                    ...makeEmptyArrows(),
                                    right: { direction: ArrowDirection.Right, type: ArrowType.Normal }
                                }
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 9.5,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.EIGHTH
                        },
                        {
                            beat: 10,
                            rawData: '1000',
                            data: {
                                arrows: {
                                    ...makeEmptyArrows(),
                                    left: { direction: ArrowDirection.Left, type: ArrowType.Normal }
                                }
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 10.5,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.EIGHTH
                        },
                        {
                            beat: 11,
                            rawData: '1100',
                            data: {
                                arrows: {
                                    ...makeEmptyArrows(),
                                    left: { direction: ArrowDirection.Left, type: ArrowType.Normal },
                                    down: { direction: ArrowDirection.Down, type: ArrowType.Normal }
                                }
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 11.5,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.EIGHTH
                        }
                    ]
                },
                {
                    measure: 3,
                    notes: [
                        {
                            beat: 12,
                            rawData: '2002',
                            data: {
                                arrows: {
                                    ...makeEmptyArrows(),
                                    left: { direction: ArrowDirection.Left, type: ArrowType.HoldHead },
                                    right: { direction: ArrowDirection.Right, type: ArrowType.HoldHead }
                                }
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 13,
                            rawData: '3003',
                            data: {
                                arrows: {
                                    ...makeEmptyArrows(),
                                    left: { direction: ArrowDirection.Left, type: ArrowType.HoldRollTail },
                                    right: { direction: ArrowDirection.Right, type: ArrowType.HoldRollTail }
                                }
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 14,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 15,
                            rawData: '0000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        }
                    ]
                }
            ]
        },
        {
            type: 'dance-double',
            description: '',
            difficultyClass: 'medium',
            difficultyMeter: 9,
            radarValues: {
                voltage: 0.320238,
                stream: 0.320000,
                chaos: 0.050000,
                freeze: 0.100000,
                air: 0.025000
            },
            measures: [
                {
                    measure: 0,
                    notes: [
                        {
                            beat: 0,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 1,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 2,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 3,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                    ]
                },
                {
                    measure: 1,
                    notes: [
                        {
                            beat: 4,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 5,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 6,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 7,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                    ]
                }
            ]
        },
        {
            type: 'dance-double',
            description: '',
            difficultyClass: 'hard',
            difficultyMeter: 11,
            radarValues: {
                voltage: 0.439286,
                stream: 0.481875,
                chaos: 0.200000,
                freeze: 0.191667,
                air: 0.045833
            },
            measures: [
                {
                    measure: 0,
                    notes: [
                        {
                            beat: 0,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 1,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 2,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 3,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        }
                    ]
                },
                {
                    measure: 1,
                    notes: [
                        {
                            beat: 4,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 5,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 6,
                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 7,

                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        }
                    ]
                },
                {
                    measure: 2,
                    notes: [
                        {
                            beat: 8,

                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 9,

                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 10,

                            rawData: '00000000',
                            data: {
                                arrows: makeEmptyArrows()
                            },
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 11,

                            rawData: '10000001',
                            data: {
                                arrows: {
                                    ...makeEmptyArrows(),
                                    left: { direction: ArrowDirection.Left, type: ArrowType.Normal }
                                }
                            },
                            type: NoteType.QUARTER
                        }
                    ]
                }
            ]
        }]
    }
}