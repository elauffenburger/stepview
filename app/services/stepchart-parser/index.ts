import { StepChart } from '../../models';
export * from './sm-file-parser';

export interface StepChartParser {
    parse(file: string): StepChart;
}