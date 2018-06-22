import { StepChart } from '../../models/stepchart';
export * from './sm-file-parser';

export interface StepChartParser {
    parse(file: string): StepChart;
}