import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxPatternModule } from '../../../ngx-pattern/src/lib/ngx-pattern.module';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import { ForkMeRibbonComponent } from './shared/fork-me-ribbon/fork-me-ribbon.component';
import { TerminalComponent } from './shared/terminal/terminal.component';
import { CardComponent } from './shared/card/card.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    ForkMeRibbonComponent,
    TerminalComponent,
    CardComponent,
  ],
  imports: [
    BrowserModule,
    NgxPatternModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
