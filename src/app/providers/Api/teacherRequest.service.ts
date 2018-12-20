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
import { UserStorageService } from '../Storage/userStorage.service';
import { CookieService } from 'ngx-cookie';

@Injectable()
export class TeacherRequestService extends RequestService {

    constructor(private h: Http, private r: Router, private c: CookieService, private _userStorage: UserStorageService) {
        super(h, r, c);
        const { token } = this._userStorage.getToken();
        this.setNewHeaders(token);
    }

    getLadder(): Promise<any> {
        return this._getRequest('/prof/ladder');
    }

    getGlobalStats(): Promise<any> {
        return this._getRequest('/prof/statsGlobal');
    }

    getLevelStats(): Promise<any> {
        return this._getRequest('/prof/statsByLevel');
    }

    inviteStudent(emails): Promise<any> {
        return this._postRequest('/prof/invite', { emails });
    }

}
