import { NgModule } from '@angular/core';
import { SongPackUploaderComponent } from './song-pack-uploader/song-pack-uploader';
import { IonicModule } from 'ionic-angular';
import { ChartDifficultyBadgesComponent } from './chart-difficulty-badges/chart-difficulty-badges';
import { ChartDifficultyBadgeComponent } from './chart-difficulty-badge/chart-difficulty-badge';
import { SimpleChartMeasureComponent } from './simple-chart-measure/simple-chart-measure';

@NgModule({
	declarations: [SongPackUploaderComponent,
    ChartDifficultyBadgesComponent,
    ChartDifficultyBadgeComponent,
    SimpleChartMeasureComponent],
	imports: [IonicModule],
	exports: [SongPackUploaderComponent,
    ChartDifficultyBadgesComponent,
    ChartDifficultyBadgeComponent,
    SimpleChartMeasureComponent]
})
export class ComponentsModule {}
