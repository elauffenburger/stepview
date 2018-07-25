import { BpmSegment } from "../models";
import _ from "lodash";

const MAX_PRECISION_DIGITS = 5;

export function toBpmChangesLookup(segments: BpmSegment[]): { [beat: number]: number } {
    return _(segments)
        .map(segment => [segment.beat, segment.bpm])
        .fromPairs()
        .value();
}

export function clampPrecision(num: number): number {
    return parseFloat(num.toPrecision(MAX_PRECISION_DIGITS));
}