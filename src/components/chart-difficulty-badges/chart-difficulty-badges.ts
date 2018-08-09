import { Component, Input } from '@angular/core';
import { StepChart, NotesSegmentType, DifficultyClass } from '../../../lib/stepview-lib/models';

import { getDifficultyLevelsForChart, getColorForDifficultyClass, DifficultyLevel } from '../../helpers';

import * as _ from 'lodash';

@Component({
  selector: 'chart-difficulty-badges',
  templateUrl: 'chart-difficulty-badges.html'
})
export class ChartDifficultyBadgesComponent {
  @Input()
  limitsOnly: boolean;

  @Input()
  chart: StepChart;

  @Input()
  segmentType: NotesSegmentType;

  constructor() { }

  getDifficultyLevelsForChart(): DifficultyLevel[] {
    const levels = _(getDifficultyLevelsForChart(this.chart, this.segmentType))
      .sortBy(level => level.meter)
      .value();

    if (this.limitsOnly) {
      const limits = levels.length == 1
        ? levels
        : [_.first(levels), _.last(levels)];

      return limits;
    }

    return levels;
  }
}
