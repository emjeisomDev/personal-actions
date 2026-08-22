import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HeaderFooterModule } from './header-footer/header-footer.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { ContentModule } from './content/content.module';
import { StudyAreaManagerComponent } from './study-area-manager.component/study-area-manager.component';

@NgModule({
  declarations: [
    App,
    StudyAreaManagerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    HeaderFooterModule,
    SidebarModule,
    ContentModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [
    App
  ]
})
export class AppModule {}