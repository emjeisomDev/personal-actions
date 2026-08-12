import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudyTimeComponent } from './content/content/study-time/study-time.component';

const routes: Routes = [
  {
    path: 'study-time',
    component: StudyTimeComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}