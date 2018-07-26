import {
    BgChangeSegment,
    BpmSegment,
    HeaderSegment,
    Note,
    NoteMeasureData,
    StopSegment,
    StepChart,
    NotesSegment,
    BEATS_PER_MEASURE,
    NoteType,
    NoteData,
    ArrowType,
    ArrowDirection
} from '../../../models';
import { split, clampPrecision } from '../../../helpers';

import * as _ from 'lodash';
import { AbstractStepChartParser } from '../abstract-parser';

export class SmFileStepChartParser extends AbstractStepChartParser {
    protected doParse(file: string): StepChart {
        // Group lines by segment
        const segments = this.splitFileIntoSegments(file);

        // Validate file segments
        this.validateSegments(segments);

        // Get header info from header segment
        const header = this.parseHeaderSegment(segments[0]);

        // Build the notes segments (all the following segments should be notes segments)
        const notesSegments = this.parseNotesSegments(segments.slice(1));

        // Build the stepchart!
        return {
            headerSegment: header,
            noteSegments: notesSegments
        }
    }

    splitFileIntoSegments(file: string) {
        // Split the file into its constituent lines
        const lines = file.split(/\r*\n/);

        // Each file segment is delimited with an empty line
        return split(lines, line => line == '');
    }

    validateSegments(segments: string[][]): { result: boolean, errors: string[] } {
        if (!segments) {
            return { result: false, errors: ["'segments' was null or empty!"] };
        }

        if (segments.length == 1) {
            return { result: false, errors: [`Only one Segment was found, which indicates 0 step patterns!`] }
        }

        return { result: true, errors: [] };
    }

    parseHeaderSegment(lines: string[]): HeaderSegment {
        const result: HeaderSegment = {};

        let i = 0;
        while (i < lines.length) {
            let builtLine = '';

            // Consolidate multi-line statements into a single line
            do {
                const currentLine = lines[i++].trim();
                const sanitizedLine = this.stripCommentsFromLine(currentLine);

                builtLine += sanitizedLine;
            }
            // Keep looping while there are still lines to read
            //   and either: 
            //      the line still doesn't have any content
            //      or the line does have content but it's still not ';'
            while (i < lines.length && (builtLine.length == 0 || builtLine[builtLine.length - 1] != ';'))

            const { tag, value } = this.parseHeaderLine(builtLine);

            switch (tag) {
                case 'TITLE':
                    result.title = value;
                    break;
                case 'SUBTITLE':
                    result.subtitle = value;
                    break;
                case 'ARTIST':
                    result.artist = value;
                    break;
                case 'TITLETRANSLIT':
                    result.titleTransliteration = value;
                    break;
                case 'SUBTITLETRANSLIT':
                    result.subtitleTransliteration = value;
                    break;
                case 'ARTISTTRANSLIT':
                    result.artistTransliteration = value;
                    break;
                case 'CREDIT':
                    result.credit = value;
                    break;
                case 'BANNER':
                    result.bannerFileName = value;
                    break;
                case 'BACKGROUND':
                    result.backgroundFileName = value;
                    break;
                case 'CDTITLE':
                    result.cdTitle = value;
                    break;
                case 'MUSIC':
                    result.musicFileName = value;
                    break;
                case 'OFFSET':
                    result.offset = parseFloat(value);
                    break;
                case 'SAMPLESTART':
                    result.sampleStart = parseFloat(value);
                    break;
                case 'SAMPLELENGTH':
                    result.sampleLength = parseFloat(value);
                    break;
                case 'SELECTABLE':
                    result.selectable = value == 'YES';
                    break;
                case 'BPMS':
                    result.bpmSegments = this.parseBpmSegments(value);
                    break;
                case 'DISPLAYBPM':
                    result.displayBpm = value == '*' ? '*' : parseFloat(value);
                    break;
                case 'STOPS':
                    result.stopSegments = this.parseStopSegments(value);
                    break;
                case 'BGCHANGES':
                    result.bgChangeSegments = this.parseBgChangeSegments(value);
                    break;
                default:
                // Here's where I'd put my logging...IF I HAD ANY
            }
        }

        return result;
    }

    stripCommentsFromLine(line: string): string {
        const firstCommentIndex = line.indexOf('//');

        // If we didn't find a comment, just return the line;
        // otherwise, ignore everything after the comment
        return firstCommentIndex == -1
            ? line
            : line.substring(0, firstCommentIndex - 1);
    }

    parseHeaderLine(line: string): { tag: string, value: string } {
        if (!line || !line.length || line[0] != '#') {
            return { tag: '', value: '' };
        }

        const tagValueSeparator = line.indexOf(':');

        const tag = line.substring(1, tagValueSeparator);
        const value = line.substring(tagValueSeparator + 1, line.lastIndexOf(';'));

        return { tag, value };
    }

    parseBpmSegments(value: string): BpmSegment[] {
        return this.fromTagListValueToKvpList(value)
            .map(kvp => {
                return <BpmSegment>{
                    beat: parseInt(kvp[0]),
                    bpm: parseFloat(kvp[1])
                };
            });
    }

    parseStopSegments(value: string): StopSegment[] {
        return this.fromTagListValueToKvpList(value)
            .map(kvp => {
                return <StopSegment>{
                    beat: parseInt(kvp[0]),
                    duration: parseFloat(kvp[0])
                }
            });
    }

    parseBgChangeSegments(value: string): BgChangeSegment[] {
        return this.fromTagListValueToKvpList(value)
            .map(kvp => {
                return <BgChangeSegment>{
                    beat: parseInt(kvp[0]),
                    name: kvp[1]
                };
            });
    }

    fromTagListValueToKvpList(value: string): string[][] {
        return !value ? [] : value.split(',').map(segment => {
            const keyValueSeparatorIndex = segment.indexOf('=');

            const left = segment.substring(0, keyValueSeparatorIndex);
            const right = segment.slice(keyValueSeparatorIndex + 1);

            // So, it appears over time the standard "key=value" spec is no longer
            // valid due to extensions; as in: a value may now contain '=' characters 
            // for additional metadata that is meaningful only to the 
            // feature receiving the value
            return [left, right];
        });
    }

    parseNotesSegments(segments: string[][]): NotesSegment[] {
        // We need to sanitize the segments ahead of time to ensure we
        // don't try to parse zero-length "segments"
        return segments.map(segment => this.sanitizeNotesSegmentLines(segment))
            .filter(segment => segment.length)
            .map(segment => this.parseNotesSegment(segment));
    }

    parseNotesSegment(lines: string[]): NotesSegment {
        if (!lines || !lines.length) {
            // TODO: error
        }

        // Sanitize the segment
        const sanitizedLines = this.sanitizeNotesSegmentLines(lines);

        // Parse the first line to ensure this is actually a notes segment
        const { tag } = this.parseHeaderLine(sanitizedLines[0]);
        if (tag != 'NOTES') {
            // TODO: error
        }

        // Get the header data out of the textual data
        const headerData = sanitizedLines.slice(1, 6)
            .reduce((acc, line, i) => {
                const { value } = this.parseNotesSegmentHeaderLine(line);

                switch (i) {
                    case 0:
                        acc.type = <any>value.toLowerCase();
                        break;
                    case 1:
                        acc.description = value;
                        break;
                    case 2:
                        acc.difficultyClass = <any>value.toLowerCase();
                        break;
                    case 3:
                        acc.difficultyMeter = parseInt(value);
                        break;
                    case 4:
                        const values = value.split(',');

                        acc.radarValues = {
                            voltage: parseFloat(values[0]),
                            stream: parseFloat(values[1]),
                            chaos: parseFloat(values[2]),
                            freeze: parseFloat(values[3]),
                            air: parseFloat(values[4])
                        };

                        break;
                }

                return acc;
            }, <NotesSegment>{});

        // All measure line groups:
        // ex: 1001\n1001,\n1001,\n -> [['1001', '1001'], ['1001']]
        const measures = split(sanitizedLines.slice(6), line => line == ',');

        let beatNum = 0;
        const notes = measures.map((measureNotes, measureNum) => {
            const sanitizedMeasureNotes = measureNotes
                .filter(line => {
                    // If this is the end of a measure, ignore the line
                    return line != ';';
                });

            const numNotesInMeasure = sanitizedMeasureNotes.length;

            // We want to know how many beats each note takes for beat num and note type calculations
            const beatsPerNote = clampPrecision(BEATS_PER_MEASURE / sanitizedMeasureNotes.length);

            return <NoteMeasureData>{
                measure: measureNum,
                notes: sanitizedMeasureNotes.reduce((notes, line, noteNum) => {
                    const noteData: NoteData = {
                        arrows: {
                            left: { direction: ArrowDirection.Left, type: this.getArrowTypeAt(0, line) },
                            down: { direction: ArrowDirection.Down, type: this.getArrowTypeAt(1, line) },
                            up: { direction: ArrowDirection.Up, type: this.getArrowTypeAt(2, line) },
                            right: { direction: ArrowDirection.Right, type: this.getArrowTypeAt(3, line) },
                        }
                    };

                    const note: Note = {
                        beat: beatNum,
                        rawData: line,
                        type: this.getNoteType(noteNum, numNotesInMeasure),
                        data: noteData
                    };

                    // We need to calculate the beat the NEXT note will be on
                    beatNum += beatsPerNote;

                    notes.push(note);

                    return notes;
                }, <Note[]>[])
            };
        });

        return {
            ...headerData,
            measures: notes
        };
    }

    private getNoteType(noteNum: number, numNotesInMeasure: number): NoteType {
        const percentageOfMeasure = noteNum / numNotesInMeasure;

        // Find the first type of note for which percentageOfMeasure % type == 0
        const type = _.find(Object.keys(NoteType), t => percentageOfMeasure % <number><any>t == 0);

        // Parse the type as a number if we found it or default to 192nd notes
        return (type && parseFloat(type)) || NoteType.ONE_NINETY_SECOND;
    }

    private sanitizeNotesSegmentLines(lines: string[]) {
        return lines
            .map(this.stripCommentsFromLine)
            .map(line => line.trim())
            .filter(line => line != '');
    }

    parseNotesSegmentHeaderLine(line: string): { value: string } {
        if (!line) {
            return { value: '' };
        }

        const parts = line.split(':');
        if (!parts.length) {
            return { value: '' };
        }

        return { value: parts[0] };
    }

    private getArrowTypeAt(position: number, rawData: string): ArrowType {
        const typeCode = rawData[position];

        switch(typeCode) {
            case '0':
                return ArrowType.None;
            case '1':
                return ArrowType.Normal;
            case '2':
                return ArrowType.HoldHead;
            case '3':
                return ArrowType.HoldRollTail;
            case '4':
                return ArrowType.RollHead;
            case 'M':
                return ArrowType.Mine;
        }

        return ArrowType.Unknown;
    }
}