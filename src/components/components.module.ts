import { NgModule } from '@angular/core';
import { SongPackUploaderComponent } from './song-pack-uploader/song-pack-uploader';
import { IonicModule } from 'ionic-angular';
import { ChartDifficultyBadgesComponent } from './chart-difficulty-badges/chart-difficulty-badges';

@NgModule({
	declarations: [SongPackUploaderComponent,
    ChartDifficultyBadgesComponent],
	imports: [IonicModule],
	exports: [SongPackUploaderComponent,
    ChartDifficultyBadgesComponent]
})
export class ComponentsModule {}
