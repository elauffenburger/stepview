import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { File } from '@ionic-native/file';

import { LoggerModule, Levels, NgxLoggerLevel, NGXLogger } from 'ngx-logger';

import { StepviewApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ChartListPageModule } from '../pages/chart-list/chart-list.module';
import { SongPacksProvider, JSZIP_OBJECT } from '../providers/song-packs/song-packs';
import { FileProvider, MockFileProvider } from '../providers/file/file';
import { ComponentsModule } from '../components/components.module';

import * as JSZip from 'jszip';
import { HttpClientModule } from '@angular/common/http';
import { ChartDetailsPageModule } from '../pages/chart-details/chart-details.module';
import { MockSongPacksProvider } from '../providers/song-packs/mock-song-packs';
import { SmFileStepChartParser } from '../../lib/stepview-lib/services/stepchart-parser';
import { SimpleChartViewerPageModule } from '../pages/simple-chart-viewer/simple-chart-viewer.module';

@NgModule({
  declarations: [
    StepviewApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(StepviewApp),
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    ComponentsModule,
    ChartListPageModule,
    ChartDetailsPageModule,
    SimpleChartViewerPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    StepviewApp,
    HomePage
  ],
  providers: [
    NGXLogger,
    StatusBar,
    SplashScreen,
    File,
    SmFileStepChartParser,
    { provide: JSZIP_OBJECT, useValue: new JSZip() },
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: SongPacksProvider, useClass: MockSongPacksProvider },
    { provide: FileProvider, useClass: MockFileProvider },
  ]
})
export class AppModule { }
