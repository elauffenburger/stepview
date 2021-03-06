import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { SongPack } from '../../models/songs';
import { StepChart, DifficultyClass, NotesSegmentType } from 'lib/stepview-lib/models';
import { getColorForDifficultyClass, getDifficultyLevelsForChart, DifficultyLevel } from '../../helpers/charts';
import { SongPacksProvider } from '../../providers/song-packs/song-packs';
import { NGXLogger } from 'ngx-logger';
import { SPINNER_TYPE } from '../../helpers/constants';
import { FileProvider } from '../../providers/file/file';

import * as _ from 'lodash'
import { ChartDetailsPage, PageArgs as ChartDetailsPageArgs } from '../chart-details/chart-details';

@IonicPage()
@Component({
  selector: 'page-chart-list',
  templateUrl: 'chart-list.html',
})
export class ChartListPage {
  songPacks: SongPack[] = [];

  constructor(
    private fileService: FileProvider,
    private songPacksService: SongPacksProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public logger: NGXLogger,
    public loading: LoadingController,
    public alert: AlertController) { }

  async ionViewDidLoad() {
    this.logger.debug('ionViewDidLoad');

    const loader = this.loading.create({
      content: 'Loading song packs...',
      spinner: SPINNER_TYPE
    });

    loader.present();

    try {
      this.logger.debug('Preparing to get song packs...')

      const songPacks = await this.songPacksService.getSavedSongPacks();
      this.logger.debug('Fetched song packs');

      this.songPacks = songPacks;
    } catch (e) {
      this.logger.error('Something went wrong while fetching song packs: ', e);

      return this.alert
        .create({ message: 'Something went wrong while fetching song packs!' })
        .present();
    } finally {
      loader.dismiss();
    }
  }

  navigateToChart(chart: StepChart) {
    const args: ChartDetailsPageArgs = {
      chart: chart
    };

    this.navCtrl.push(ChartDetailsPage, args, {
      animate: true,
      animation: 'md-transition'
    });
  }
}
