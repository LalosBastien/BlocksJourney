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
import { RequestService } from './request.service';
import {CookieService} from 'ngx-cookie';

@Injectable()
export class UserRequestService extends RequestService {
    constructor(private h: Http, private r: Router, private c: CookieService) {
        super(h, r, c);
    }

    //TODO : change to match BackEnd Api route
    getUsers(): Promise<any> {
        return this._getRequest('/users');
    }
    getUser(id): Promise<any> {
        return this._getRequest('/users/' + id);
    }
    createUser(data): Promise<any> {
        return this._postRequest('/users', data);
    }

    updateUser(data): Promise<any> {
        return this._putRequest('/users', data);
    }
    deleteUser(id): Promise<any> {
        return this._deleteRequest('/users/' + id);
    }
}
