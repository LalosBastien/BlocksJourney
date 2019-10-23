import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'ngx-store';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {
  user: any;
  students: any;

  constructor(private _localStorageService: LocalStorageService) { }

  ngOnInit() {
    this.user = this._localStorageService.get('currentUser');
    console.log(this._localStorageService.get('currentUser'));
    if (this.user.role.accessLevel === 2) {
      this.user.profId = this.user.prenom.substring(0, 2).toLowerCase() + this.user.nom.substring(0, 2).toLowerCase() + this.user.id;
    }
  }

}
