import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RealtimeChartViewerPage } from './realtime-chart-viewer';

@NgModule({
  declarations: [
    RealtimeChartViewerPage,
  ],
  imports: [
    IonicPageModule.forChild(RealtimeChartViewerPage),
  ],
})
export class RealtimeChartViewerPageModule {}
