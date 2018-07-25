import { StepChart, NotesSegment, LINES_PER_MEASURE, makeEmptyNote, ArrowType, NoteMeasureData, Note, Arrow, NoteDataArrows } from '../../models';
import _ from 'lodash';
export * from './sm-file-parser';

export interface StepChartParser {
    parse(file: string): StepChart;
}