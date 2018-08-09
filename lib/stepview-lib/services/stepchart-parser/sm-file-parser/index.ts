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
import { split, toLines, clampPrecision, NEWLINE_REGEX } from '../../../helpers';

import * as _ from 'lodash';
import { AbstractStepChartParser } from '../abstract-parser';
import { ParseOptions } from '..';

export class SmFileStepChartParser extends AbstractStepChartParser {
    protected doParse(chartData: string, options: ParseOptions): StepChart {
        // Validate file segments
        this.validateChartData(chartData);

        // Build the stepchart!
        return this.doParseInternal(chartData, options);
    }

    private validateChartData(chartData: string): { result: boolean, errors: string[] } {
        // TODO: actually do this
        return { result: true, errors: [] };
    }

    private doParseInternal(chartData: string, options: ParseOptions): StepChart {
        const lines = toLines(chartData);

        const header: HeaderSegment = {};
        const noteSegmentsLines: string[][] = [];

        let lineNum = 0;
        while (lineNum < lines.length) {
            let builtLineParts: string[] = [];

            // Consolidate multi-line statements into a single line:
            // Keep looping while there are still lines to read
            //   and either: 
            //      the line still doesn't have any content
            //      or the line does have content but it's still not ';'
            do {
                const currentLine = lines[lineNum++].trim();
                const sanitizedLine = this.stripCommentsFromLine(currentLine);

                builtLineParts.push(sanitizedLine);
            }
            while (lineNum < lines.length && (builtLineParts.length == 0 || _.last(_.last(builtLineParts)) != ';'))

            const builtLine = builtLineParts.join('\n').trim();
            const { tag, rawValue, value } = this.parseHeaderLine(builtLine);

            switch (tag) {
                case 'TITLE':
                    header.title = value;
                    break;
                case 'SUBTITLE':
                    header.subtitle = value;
                    break;
                case 'ARTIST':
                    header.artist = value;
                    break;
                case 'TITLETRANSLIT':
                    header.titleTransliteration = value;
                    break;
                case 'SUBTITLETRANSLIT':
                    header.subtitleTransliteration = value;
                    break;
                case 'ARTISTTRANSLIT':
                    header.artistTransliteration = value;
                    break;
                case 'CREDIT':
                    header.credit = value;
                    break;
                case 'BANNER':
                    header.bannerFileName = value;
                    break;
                case 'BACKGROUND':
                    header.backgroundFileName = value;
                    break;
                case 'CDTITLE':
                    header.cdTitle = value;
                    break;
                case 'MUSIC':
                    header.musicFileName = value;
                    break;
                case 'OFFSET':
                    header.offset = parseFloat(value);
                    break;
                case 'SAMPLESTART':
                    header.sampleStart = parseFloat(value);
                    break;
                case 'SAMPLELENGTH':
                    header.sampleLength = parseFloat(value);
                    break;
                case 'SELECTABLE':
                    header.selectable = value == 'YES';
                    break;
                case 'BPMS':
                    header.bpmSegments = this.parseBpmSegments(value);
                    break;
                case 'DISPLAYBPM':
                    header.displayBpm = value == '*' ? '*' : parseFloat(value);
                    break;
                case 'STOPS':
                    header.stopSegments = this.parseStopSegments(value);
                    break;
                case 'BGCHANGES':
                    header.bgChangeSegments = this.parseBgChangeSegments(value);
                    break;
                case 'NOTES':
                    const segment = rawValue.split(':').map(line => line.trim());

                    noteSegmentsLines.push(segment);
                default:
                // Here's where I'd put my logging...IF I HAD ANY
            }
        }

        // Only parse the notes segments if we're supposed to
        const noteSegments = this.parseNotesSegments(noteSegmentsLines, options);

        return {
            headerSegment: header,
            noteSegments: noteSegments,
            getSourceContent: () => chartData,
            getParser: () => this,
            getParseOptions: () => options
        }
    }

    private stripCommentsFromLine(line: string): string {
        const firstCommentIndex = line.indexOf('//');

        // If we didn't find a comment, just return the line;
        // otherwise, ignore everything after the comment
        return firstCommentIndex == -1
            ? line
            : line.substring(0, firstCommentIndex - 1);
    }

    parseHeaderLine(line: string): { tag: string, rawValue: string, value: string } {
        if (!line || !line.length || line[0] != '#') {
            return { tag: '', value: '', rawValue: '' };
        }

        const tagValueSeparator = line.indexOf(':');

        const tag = line.substring(1, tagValueSeparator);
        const rawValue = line.substring(tagValueSeparator + 1, line.lastIndexOf(';'));
        const value = rawValue.replace(NEWLINE_REGEX, '').trim();

        return { tag, rawValue, value };
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

    private fromTagListValueToKvpList(value: string): string[][] {
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

    parseNotesSegments(segments: string[][], options: ParseOptions): NotesSegment[] {
        return segments.map(segment => this.parseNotesSegment(segment, options));
    }

    parseNotesSegment(lines: string[], options: ParseOptions): NotesSegment {
        if (!lines || !lines.length) {
            // TODO: error
        }

        // Parse the first line to ensure this is actually a notes segment
        const { tag } = this.parseHeaderLine(lines[0]);
        if (tag != 'NOTES') {
            // TODO: error
        }

        // Get the header data out of the textual data
        const result = lines.slice(0, 5)
            .reduce((acc, value, i) => {
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

        // If we're not supposed to do any further parsing, bail early
        if (!options.includeNotesSegments) {
            return {
                ...result,
                measures: []
            };
        }

        // All measure line groups:
        // ex: 1001\n1001,\n1001,\n -> [['1001', '1001'], ['1001']]
        const nonEmptySanitizedLines = this.sanitizeNotesSegmentLines(toLines(lines[5])).filter(line => line.length);
        const measures = split(nonEmptySanitizedLines, line => line == ',');

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
            ...result,
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
        return lines.map(this.stripCommentsFromLine).map(line => line.trim());
    }

    private getArrowTypeAt(position: number, rawData: string): ArrowType {
        const typeCode = rawData[position];

        switch (typeCode) {
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