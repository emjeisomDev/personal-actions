import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudyTimeComponent } from './content/study-time/study-time.component';
import { HomeComponent } from './content/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'study-time',
    component: StudyTimeComponent
  },
  {
    path: '**',
    redirectTo: ''
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