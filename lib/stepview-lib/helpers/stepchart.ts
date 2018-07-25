import { BpmSegment } from "../models";
import _ from "lodash";

export function toBpmChangesLookup(segments: BpmSegment[]): { [beat: number]: number } {
    return _(segments)
        .map(segment => [segment.beat, segment.bpm])
        .fromPairs()
        .value();
}