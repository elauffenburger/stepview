import { StepChart, DifficultyClass, NotesSegmentType } from "lib/stepview-lib/models";

import * as _ from 'lodash';

// A helper type for working with chart difficulty levels
export interface DifficultyLevel {
    class: DifficultyClass,
    meter: number
}

export function getDifficultyLevelsForChart(chart: StepChart, segmentType: NotesSegmentType = null): DifficultyLevel[] {
    let segments = chart.noteSegments;
    if (segmentType) {
        segments = segments.filter(segment => segment.type == segmentType);
    }

    return segments
        .map(segment => {
            return {
                class: segment.difficultyClass,
                meter: segment.difficultyMeter
            }
        });
}

export function getColorForDifficultyClass(difficultyClass: DifficultyClass): string {
    switch (difficultyClass) {
        case 'beginner':
            return 'blue';
        case 'easy':
            return 'yellow';
        case 'medium':
            return 'red';
        case 'hard':
            return 'green';
        case 'challenge':
            return 'purple'
    }
}

export function isOneOf<T>(value: T, ...values: T[]) {
    return _.find(values, v => v == value) != null;
}