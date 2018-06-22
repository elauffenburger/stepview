import { HeaderSegment } from '../../../../app/models/stepchart';
import { SmFileStepChartParser } from "../../../../app/services/stepchart-parser";

const fs = require('fs');
const path = require('path');

it('can parse header segment', done => {
    fs.readFile(path.resolve(__dirname, './files/Break Free.sm'), 'utf8', (err: any, file: string) => {
        if (err) {
            fail(err);

            return done();
        }

        const parser = new SmFileStepChartParser();
        const segments = parser.splitFileIntoSegments(file);

        // The header segment is the first segment
        const headerSegmentLines = segments[0];

        const titleLine = headerSegmentLines[0]; 
        expect(titleLine).toEqual('#TITLE:Break Free;');

        const parsedTitleLine = parser.parseHeaderLine(titleLine);
        expect(parsedTitleLine).toEqual({ tag: 'TITLE', value: 'Break Free' });

        const headerSegment = parser.parseHeaderSegment(headerSegmentLines);

        const fixture: HeaderSegment = {
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
        }

        expect(headerSegment).toEqual(fixture);

        done();
    });
});