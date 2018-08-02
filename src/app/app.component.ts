import { Component, ViewChild, Injector } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ChartListPage } from '../pages/chart-list/chart-list';
import { environment } from '@app/env';

@Component({
  templateUrl: 'app.html'
})
export class StepviewApp {
  @ViewChild(Nav)
  nav: Nav;

  rootPage: any = HomePage;

  pages: { title: string, component: any }[];

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public injector: Injector) {
    this.initializeApp();

    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'Charts', component: ChartListPage }
    ];
  }

  async initializeApp() {
    await this.platform.ready();

    if (environment.onLoad) {
      await environment.onLoad(this);
    }

    this.statusBar.styleDefault();
    this.splashScreen.hide();
  }

  openPage(page: { component: any }) {
    this.navToComponent(page.component);
  }

  navToComponent(component) {
    this.nav.setRoot(component);
  }
}
