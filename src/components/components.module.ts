import { NgModule } from '@angular/core';
import { SongPackUploaderComponent } from './song-pack-uploader/song-pack-uploader';
import { IonicModule } from 'ionic-angular';

@NgModule({
	declarations: [SongPackUploaderComponent],
	imports: [IonicModule],
	exports: [SongPackUploaderComponent]
})
export class ComponentsModule {}
