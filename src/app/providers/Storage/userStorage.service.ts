import {
    Injectable,
} from '@angular/core';
import {
    Http,
    Response,
    ResponseContentType,
    RequestOptions,
    Headers
} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {
    Router
} from '@angular/router';
import { LocalStorage, LocalStorageService } from 'ngx-store';
import { UserRequestService } from '../Api/userRequest.service';
@Injectable()
export class UserStorageService {
    @LocalStorage('access-token') token;
    @LocalStorage('currentUser') user;
    constructor(private _userAPI: UserRequestService, private _localStorageService: LocalStorageService) {
    }

    getToken() {
        return this.token;
    }
    storeToken(token) {
        this.clearStore();
        this.token = token;
        this.setUserData();
    }
    async setUserData(){
        const u = await this._userAPI.getUser(this.token.idUtilisateur);
        this._localStorageService.set('currentUser', u);
    }
    clearStore() {
        this.token = null;
        this.user = null;
        this._localStorageService.clear();
    }
}
