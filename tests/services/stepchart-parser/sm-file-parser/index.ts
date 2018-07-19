import { HeaderSegment, StepChart, NoteType } from '../../../../app/models/stepchart';
import { SmFileStepChartParser } from "../../../../app/services/stepchart-parser";
import { NotesSegment } from '../../../../app/models';

const fs = require('fs');
const path = require('path');

const file = fs.readFileSync(path.resolve(__dirname, './files/Break Free.sm'), 'utf8');

const parser = new SmFileStepChartParser();
const segments = parser.splitFileIntoSegments(file);

const fixture: StepChart = makeFixture();

describe('can parse the header', () => {
    // The header segment is the first segment
    const headerSegmentLines = segments[0];

    it('can parse basic header info', () => {
        const titleLine = headerSegmentLines[0];
        expect(titleLine).toEqual('#TITLE:Break Free;');

        const parsedTitleLine = parser.parseHeaderLine(titleLine);
        expect(parsedTitleLine).toEqual({ tag: 'TITLE', value: 'Break Free' });
    })

    it('can parse header segment', () => {
        const headerSegment = parser.parseHeaderSegment(headerSegmentLines);

        expect(headerSegment).toEqual(fixture.header);
    });
});

it('can parse data segments', () => {
    // The notes segments are the segments other than the first
    const notesSegments = parser.parseNotesSegments(segments.slice(1));

    expect(notesSegments).toEqual(fixture.notes);
});

it('can parse the whole file', () => {
    const chart = parser.parse(file);

    expect(chart).toEqual(fixture);
})

function makeFixture(): StepChart {
    return <StepChart>{
        header: {
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
        notes: [{
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
            noteData: [
                {
                    measure: 0,
                    notes: [
                        {
                            beat: 0,
                            data: '0000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 1,
                            data: '0000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 2,
                            data: '0000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 3,
                            data: '0000',
                            type: NoteType.QUARTER
                        },
                    ]
                },
                {
                    measure: 1,
                    notes: [
                        {
                            beat: 4,
                            data: '0000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 5,
                            data: '0000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 6,
                            data: '0000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 7,
                            data: '0000',
                            type: NoteType.QUARTER
                        },
                    ]
                },
                {
                    measure: 2,
                    notes: [
                        {
                            beat: 8,
                            data: '0001',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 8.5,
                            data: '0100',
                            type: NoteType.EIGHTH
                        },
                        {
                            beat: 9,
                            data: '0001',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 9.5,
                            data: '0000',
                            type: NoteType.EIGHTH
                        },
                        {
                            beat: 10,
                            data: '1000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 10.5,
                            data: '0000',
                            type: NoteType.EIGHTH
                        },
                        {
                            beat: 11,
                            data: '1100',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 11.5,
                            data: '0000',
                            type: NoteType.EIGHTH
                        }
                    ]
                },
                {
                    measure: 3,
                    notes: [
                        {
                            beat: 12,
                            data: '2002',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 13,
                            data: '3003',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 14,
                            data: '0000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 15,
                            data: '0000',
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
            noteData: [
                {
                    measure: 0,
                    notes: [
                        {
                            beat: 0,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 1,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 2,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 3,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                    ]
                },
                {
                    measure: 1,
                    notes: [
                        {
                            beat: 4,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 5,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 6,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 7,
                            data: '00000000',
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
            noteData: [
                {
                    measure: 0,
                    notes: [
                        {
                            beat: 0,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 1,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 2,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 3,
                            data: '00000000',
                            type: NoteType.QUARTER
                        }
                    ]
                },
                {
                    measure: 1,
                    notes: [
                        {
                            beat: 4,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 5,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 6,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 7,
                            data: '00000000',
                            type: NoteType.QUARTER
                        }
                    ]
                },
                {
                    measure: 2,
                    notes: [
                        {
                            beat: 8,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 9,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 10,
                            data: '00000000',
                            type: NoteType.QUARTER
                        },
                        {
                            beat: 11,
                            data: '10000001',
                            type: NoteType.QUARTER
                        }
                    ]
                }
            ]
        }]
    }
}