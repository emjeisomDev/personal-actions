import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ContentComponent } from './content/content.component';
import { HomeComponent } from './home/home.component';
import { StudyTimeComponent } from './study-time/study-time.component';

@NgModule({
  declarations: [
    ContentComponent,
    HomeComponent,
    StudyTimeComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ContentComponent,
    HomeComponent,
    StudyTimeComponent
  ]
})
export class ContentModule { }
