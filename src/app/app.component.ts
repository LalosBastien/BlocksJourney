import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from './app.config';
import {Router} from '@angular/router';
import { LocalStorage, LocalStorageService } from 'ngx-store';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @LocalStorage('currentUser') currentUser;
  constructor(public electronService: ElectronService,
    private translate: TranslateService, private _router: Router, private _storage: LocalStorageService, private _cookie: CookieService) {

    translate.setDefaultLang('fr');
    console.log('AppConfig', AppConfig);

    console.log('userLevel', this.currentUser);



    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  showMenu() {
      const blackList = ['/', '/register', '/forgot-password']
    return blackList.indexOf(this._router.url) === -1;
  }

  goToLevels() {
      this._router.navigate(['levels']);
  }

  goToProfil() {
    this._router.navigate(['profil']);
}

    goToTeacherPanel() {
        this._router.navigate(['teacherPanel']);
    }


  logout() {
    this._storage.clear();
    this._cookie.removeAll();
    this._router.navigate(['/']);
  }
}
