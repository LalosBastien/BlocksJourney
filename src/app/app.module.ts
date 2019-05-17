import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  MatIconModule,
  MatGridListModule,
  MatButtonModule,
  MatChipsModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatCardModule,
  MatTableModule,
  MatTabsModule,
  MatListModule,
  MatSliderModule,
  MatSidenavModule,
  MatStepperModule,
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
  MatDialogModule,
  MatExpansionModule,
  MatSortModule,
} from '@angular/material';
import {
  Http,
  HttpModule
} from '@angular/http';



// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';
import { RequestService } from './providers/Api/request.service';

import {
  ChartBuilderService
} from './providers/chart-builder.service';
import {
  ChartModule,
  HIGHCHARTS_MODULES
} from 'angular-highcharts';
import * as more from 'highcharts/highcharts-more.src';
import * as exporting from 'highcharts/modules/exporting.src';
import * as solid_gauge from 'highcharts/modules/solid-gauge.src';
export function highchartsModules() {
  return [more, solid_gauge, exporting];
}

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { PhaserComponent } from './components/phaser/phaser.component';
import { GameComponent } from './components/game/game.component';
import { BlocklyComponent } from './components/blockly/blockly.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LevelMenuComponent } from './components/level-menu/level-menu.component';
import { TeacherPanelComponent } from './components/teacherPanel/teacherPanel.component';
import { UserStorageService } from './providers/Storage/userStorage.service';
import { WebStorageModule } from 'ngx-store';

import { CookieModule } from 'ngx-cookie';
import { MomentModule } from 'angular2-moment';
import { AddStudentComponent } from './components/teacherPanel/dialog/add-student/add-student.component';
import { UserRequestService } from './providers/Api/userRequest.service';
import { StudentDetailComponent } from './components/student-detail/student-detail.component';
import { ProfilComponent } from './components/profil/profil.component';
import { LevelHistoryComponent } from './components/level-history/level-history.component';
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    PhaserComponent,
    GameComponent,
    BlocklyComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    DashboardComponent,
    LevelMenuComponent,
    TeacherPanelComponent,
    AddStudentComponent,
    StudentDetailComponent,
    ProfilComponent,
    LevelHistoryComponent
  ],
  entryComponents: [
    AddStudentComponent
  ],
  imports: [
    BrowserModule,
    MatSortModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    MatIconModule,
    MatGridListModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    MatListModule,
    MatDialogModule,
    MatSidenavModule,
    MatStepperModule,
    MatSliderModule,
    MatExpansionModule,
    CookieModule.forRoot(),
    ChartModule,
    MomentModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    WebStorageModule
  ],
  providers: [
    RequestService,
    ElectronService,
    ChartBuilderService,
    {
      provide: HIGHCHARTS_MODULES,
      useFactory: highchartsModules
    },
    UserStorageService,
    UserRequestService,
    {
      provide: ErrorStateMatcher,
      useClass: ShowOnDirtyErrorStateMatcher
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
