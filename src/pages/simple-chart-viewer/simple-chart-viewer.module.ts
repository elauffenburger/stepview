import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SimpleChartViewerPage } from './simple-chart-viewer';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    SimpleChartViewerPage,
  ],
  imports: [
    IonicPageModule.forChild(SimpleChartViewerPage),
    ComponentsModule
  ],
})
export class SimpleChartViewerPageModule {}
