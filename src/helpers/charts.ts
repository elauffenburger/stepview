import { StepChart, DifficultyClass } from "lib/stepview-lib/models";

// A helper type for working with chart difficulty levels
export interface DifficultyLevel {
    class: DifficultyClass,
    meter: number
}

export function getDifficultyLevelsForChart(chart: StepChart): DifficultyLevel[] {
    return chart.noteSegments.map(segment => {
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