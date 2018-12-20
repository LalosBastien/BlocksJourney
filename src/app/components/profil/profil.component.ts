import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'ngx-store';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {
  user: any;

  constructor(private _localStorageService: LocalStorageService) { }

  ngOnInit() {
    this.user = this._localStorageService.get('currentUser');
    console.log(this._localStorageService.get('currentUser'));
  }

}
