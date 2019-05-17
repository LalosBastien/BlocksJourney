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
import { CookieService } from 'ngx-cookie';

@Injectable()
export class LevelRequestService extends RequestService {
  constructor(private h: Http, private r: Router, private c: CookieService) {
    super(h, r, c);
  }

  getAllSortedByChapter(): Promise<any> {
    return this._getRequest('/chapter');
  }

  getAll(): Promise<any> {
    return this._getRequest('/levels');
  }
  get(id: string): Promise<any> {
    return this._getRequest('/levels/' + id);
  }
  validate(id, algoTime, status, energyConsumed): Promise < any > {
    return this._putRequest('/levels/' + id + '/validate', { algoTime, status, energyConsumed });
  }

  getHistory(): Promise<any> {
    return this._getRequest('/levels/history');
  }

  getUserHistory(id: number): Promise<any> {
    return this._getRequest('/levels/history?id=' + id);
  }
}
