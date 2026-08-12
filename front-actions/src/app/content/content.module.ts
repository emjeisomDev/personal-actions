import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ContentComponent } from './content/content.component';

@NgModule({
  declarations: [
    ContentComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[
    ContentComponent
  ]
})
export class ContentModule { }
