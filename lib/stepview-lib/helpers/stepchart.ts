import { BpmSegment } from "../models";
const _ = require("lodash");

const MAX_PRECISION_DIGITS = 8;

export function toBpmChangesLookup(segments: BpmSegment[]): { [beat: number]: number } {
    return _(segments)
        .map(segment => [segment.beat, segment.bpm])
        .fromPairs()
        .value();
}

export function clampPrecision(num: number): number {
    return parseFloat(num.toPrecision(MAX_PRECISION_DIGITS));
}

export function distributeInto<T>(items: T[], targetNum: number, makeFillerItemFn: (item: T, i: number) => T): T[] {
    const indicesToSkipPerItem = (targetNum / items.length) - 1;

    let skipAccumulator = 0.0 - indicesToSkipPerItem;
    for (let i = 0; i < targetNum; i++) {
        skipAccumulator += indicesToSkipPerItem;

        if (skipAccumulator < 1) {
            continue;
        }

        const toSkip = skipAccumulator;
        skipAccumulator = 0;

        const item = items[i-1];
        items.splice(i, 0, ...range(toSkip, rangeIndex => makeFillerItemFn(item, i + rangeIndex)))

        i += toSkip;
    }

    return items;
}

export function range<T>(to: number, makeItemFn: (i: number) => T): T[] {
    const result = [];
    for (let i = 0; i < to; i++) {
        result.push(makeItemFn(i));
    }

    return result;
}