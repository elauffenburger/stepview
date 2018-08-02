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
import { SongPacksProvider, MockSongPacksProvider } from '../providers/song-packs/song-packs';
import { FileProvider, MockFileProvider } from '../providers/file/file';

@NgModule({
  declarations: [
    StepviewApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(StepviewApp),
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
    ChartListPageModule,
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
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: SongPacksProvider, useClass: MockSongPacksProvider },
    { provide: FileProvider, useClass: MockFileProvider }
  ]
})
export class AppModule { }
