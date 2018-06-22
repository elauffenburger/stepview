import { BgChangeSegment, BpmSegment, HeaderSegment, StopSegment } from '../../../models/stepchart';
import { split } from '../../../helpers';
import { StepChart } from '../../../models';
import { StepChartParser } from "../index";

export class SmFileStepChartParser implements StepChartParser {
    parse(file: string): StepChart {
        // Group lines by segment
        const segments = this.splitFileIntoSegments(file);

        // Validate file segments
        this.validateSegments(segments);

        // Get header info from header segment
        const header = this.parseHeaderSegment(segments[0]);

        // TODO: Build the notes segment
        // ...

        // Build the stepchart!
        return {
            header: header
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
}