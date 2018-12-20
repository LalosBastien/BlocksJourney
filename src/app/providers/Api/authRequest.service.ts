import {
  Injectable,
} from '@angular/core';
import {
  Http
} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {
  Router
} from '@angular/router';
import {
  RequestService
} from './request.service';
import {CookieService} from 'ngx-cookie';

import {
  UserStorageService
} from './../Storage/userStorage.service';
@Injectable()
export class AuthRequestService extends RequestService {

  constructor(private h: Http, private r: Router, private c: CookieService, private _userStorage: UserStorageService) {
    super(h, r, c);
  }
  async authenticate(UserData): Promise<any> {
    try {
      const login = await this._postRequest('/login/', UserData);
      const accessToken = login.accessToken || null;
      if (accessToken && accessToken.token && accessToken.token != null) {
        this.setNewHeaders(accessToken.token);
        this._userStorage.storeToken(accessToken);
      }
      return true;
    } catch (error) {
      console.log('errauth');
      return {
        error
      };
    }
  }
  logout(): Promise<any> {
    return this._getRequest('/logout');
  }
  register(UserData): Promise<any> {
    return this._postRequest('/register', UserData);
  }
  askResetPassword(email) {
    return this._getRequest('/askResetPassword/?email=' + email);
  }
  getUsers() {
    return this._getRequest('/users/');
  }
  resetPassword(UserData) {
    return this._postRequest('/resetPassword', UserData);
  }

}
