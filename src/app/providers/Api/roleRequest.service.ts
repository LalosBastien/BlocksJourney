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
export class RoleRequestService extends RequestService {

    constructor(private h: Http, private r: Router, private c: CookieService) {
        super(h, r, c);

    }

    getAll(): Promise<any> {
        return this._getRequest('/roles');
    }
}
