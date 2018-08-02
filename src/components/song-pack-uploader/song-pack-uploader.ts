import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FileProvider } from '../../providers/file/file';
import { SongPacksProvider } from '../../providers/song-packs/song-packs';
import { AlertController, LoadingController, Loading } from 'ionic-angular';
import { ZIP_MIME_TYPE, SPINNER_TYPE } from '../../helpers/constants';
import { parseDataUri } from '../../helpers';

@Component({
  selector: 'song-pack-uploader',
  templateUrl: 'song-pack-uploader.html'
})
export class SongPackUploaderComponent {
  songPackName = '';

  constructor(
    private logger: NGXLogger,
    private fileService: FileProvider,
    private songPacksService: SongPacksProvider,
    private alert: AlertController,
    private loader: LoadingController) { }

  async onClickChooseSongPack() {
    let fileDataUrl: string;

    let loader: Loading;

    try {
      this.logger.info('Preparing to choose song pack file...')
      fileDataUrl = await this.fileService.chooseFileAsDataUrl(async () => {
        loader = this.loader.create({
          content: 'Loading song pack file...',
          spinner: SPINNER_TYPE
        });

        await loader.present();
      });

      this.logger.info('Chose file: ', fileDataUrl);
    } catch (e) {
      this.logger.error('Something went wrong while choosing song pack file: ', e);

      return this.alert
        .create({ message: 'Something went wrong while choosing song pack file!' })
        .present();
    } finally {
      loader.dismiss();
    }

    const file = parseDataUri(fileDataUrl);
    if (file.mimeType != ZIP_MIME_TYPE) {
      return this.alert.create({ message: 'Song pack must be a zip!' }).present();
    }

    try {
      loader = this.loader.create({
        content: 'Saving song pack...',
        spinner: SPINNER_TYPE
      });
      await loader.present();

      this.logger.info('Preparing to save song pack...');
      await this.songPacksService.saveSongPack(this.songPackName, file.content);

      this.logger.info('Saved song pack!')
    } catch (e) {
      this.logger.error('Something went wrong while saving song pack: ', e);

      return this.alert
        .create({ message: 'Something went wrong while saving song pack!' })
        .present();
    } finally {
      loader.dismiss();
    }
  }

  isChooseSongPackButtonDisabled(): boolean {
    return !this.songPackName;
  }
}
