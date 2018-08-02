import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChartListPage } from './chart-list';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ChartListPage,
  ],
  imports: [
    IonicPageModule.forChild(ChartListPage),
    ComponentsModule
  ],
  providers: []
})
export class ChartListPageModule { }
