import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChartDetailsPage } from './chart-details';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ChartDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ChartDetailsPage),
    ComponentsModule
  ],
})
export class ChartDetailsPageModule {}
