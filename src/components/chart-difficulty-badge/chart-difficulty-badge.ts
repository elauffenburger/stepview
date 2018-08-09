import { Component, Input } from '@angular/core';
import { DifficultyClass } from '../../../lib/stepview-lib/models';
import { getColorForDifficultyClass, DifficultyLevel } from '../../helpers';

@Component({
  selector: 'chart-difficulty-badge',
  templateUrl: 'chart-difficulty-badge.html'
})
export class ChartDifficultyBadgeComponent {
  @Input()
  level: DifficultyLevel;

  getColorForDifficultyClass(difficultyClass: DifficultyClass): string {
    return getColorForDifficultyClass(difficultyClass);
  }
}
