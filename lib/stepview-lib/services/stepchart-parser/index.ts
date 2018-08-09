import { StepChart } from '../../models';
export * from './sm-file-parser';

export interface ParseOptions {
    normalizeChart?: boolean;
    includeNotesSegments?: boolean;
}

export interface StepChartParser {
    parse(rawChart: string, options: ParseOptions): StepChart;
}