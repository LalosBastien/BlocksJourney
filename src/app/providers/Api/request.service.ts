import {
    Injectable
} from '@angular/core';
import {
    Http,
    Response,
    RequestOptions,
    Headers
} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {
    Router
} from '@angular/router';
import { CookieService } from 'ngx-cookie';

import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { map, filter, catchError } from 'rxjs/operators';
import { AppConfig } from '../../app.config';
import { LocalStorage } from 'ngx-store';

@Injectable()
export class RequestService implements OnInit {
    apiRoot: string;
    token: string;
    headers: Headers;
    @LocalStorage('access-token') currentToken;
    @LocalStorage('currentUser') currentUser;
    options: RequestOptions;
    constructor(private http: Http, private _router: Router, private cookieService: CookieService) {
        this.apiRoot = AppConfig.apiUrl;
        console.log('API====>', AppConfig);
    }
    ngOnInit(): void {
        this.setNewHeaders();
    }
    private clearStorage() {
        this.currentToken = null;
        this.currentUser = null;
    }
    private handleError(error: any): Promise<any> {
        const status = error.status;
        error = error.json();
        if (status === 403 || status === 500) {
            this.clearStorage();
            this._router.navigate(['']);
        }
        return Promise.reject(error.message || error);
    }
    protected setNewHeaders(token?: string) {
        this.headers = new Headers();
        this.headers.append('Content-type', 'application/json');
        this.headers.append('x-accesstoken', token);
        this.cookieService.put('x-accesstoken', token);
        this.options = new RequestOptions({ headers: this.headers });
    }

    getCurrentHeaders() {
        return this.headers;
    }

    protected _setHeaders() {
        this.headers = new Headers();
        this.headers.append('Content-type', 'application/json');
        this.headers.append('x-accesstoken', this.cookieService.get('x-accesstoken'));
        this.options = new RequestOptions({ headers: this.headers });
    }

    protected async _postRequest(path: string, data: any): Promise<any> {
        const apiUrl = this.apiRoot + path;
        this._setHeaders();
        return await this.http.post(apiUrl, data, this.options).pipe(
            filter(event => event instanceof Response),
            map((res: Response) => res.json()),
            catchError((e) => this.handleError(e))).toPromise();
    }

    protected async _putRequest(path: string, data: any): Promise<any> {
        const apiUrl = this.apiRoot + path;
        this._setHeaders();
        return await this.http.put(apiUrl, data, this.options).pipe(
            filter(event => event instanceof Response),
            map((res: Response) => res.json()),
            catchError((e) => this.handleError(e))).toPromise();
    }

    protected async _getRequest(path): Promise<any> {
        const apiUrl = this.apiRoot + path;
        this._setHeaders();
        return await this.http.get(apiUrl, this.options).pipe(
            filter(event => event instanceof Response),
            map((res: Response) => res.json()),
            catchError((e) => this.handleError(e))).toPromise();
    }

    protected async _deleteRequest(path): Promise<any> {
        const apiUrl = this.apiRoot + path;
        this._setHeaders();
        return await this.http.delete(apiUrl, this.options).pipe(
            filter(event => event instanceof Response),
            map((res: Response) => res.json()),
            catchError((e) => this.handleError(e))).toPromise();
    }
}
