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
    constructor(private _userAPI:UserRequestService, private _localStorageService:LocalStorageService) {
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
        console.log("TOKEN", this.token)
        let u = await this._userAPI.getUser(this.token.idUtilisateur);
        console.log("SETING STORAGE : ", u)
        this._localStorageService.set('currentUser', u);
        console.log("SET DONE LETS CHECK : ", this.user)
    }
    clearStore() {
        this.token = null;
        this.user = null;
        this._localStorageService.clear();
    }
}
