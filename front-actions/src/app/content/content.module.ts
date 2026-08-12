import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ContentComponent } from './content/content.component';
import { StudyTimeComponent } from './content/study-time/study-time.component';

@NgModule({
  declarations: [
    ContentComponent,
    StudyTimeComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[
    ContentComponent,
    StudyTimeComponent
  ]
})
export class ContentModule { }
