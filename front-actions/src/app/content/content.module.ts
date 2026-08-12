import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ContentComponent } from './content/content.component';
import { StudyTimeComponent } from './study-time/study-time.component';
import { StudyCardComponent } from './study-time/study-card/study-card.component';


@NgModule({
  declarations: [
    ContentComponent,
    HomeComponent,
    StudyTimeComponent,
    StudyCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HomeComponent,
    ContentComponent,
    StudyTimeComponent
  ]
})
export class ContentModule { }
