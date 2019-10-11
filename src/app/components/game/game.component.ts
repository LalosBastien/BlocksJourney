import {
  Component, OnDestroy,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute, Router
} from '@angular/router';
import {
  PhaserComponent
} from '../phaser/phaser.component';
import {
  Observable
} from 'rxjs/Observable';

import * as json1 from '../../../assets/game/fakeJson/level1.json';
const IntroJs = require('intro.js/intro.js');
import { LevelRequestService } from '../../providers/Api/levelRequest.service';
import { MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  providers: [LevelRequestService]
})
export class GameComponent implements OnInit {
  error: any;
  onErrorTriggered: BehaviorSubject<any>;
  phaser: PhaserComponent;
  id: number;
  json: any;
  name: string;
  description: string;
  introStarted: boolean;
  ijs: any;


  constructor(protected _api: LevelRequestService, public _snackBar: MatSnackBar, private route: ActivatedRoute, private _r:Router) {
    this.initIntro = this.initIntro.bind(this);
    window.addEventListener('blockyLoaded', this.initIntro);
  }


  navigateTo($event){
    if($event == "levels")
      this.navigateToMenu();
  }

  navigateToMenu(){
    this._r.navigate(['/levels']);
  }
  async ngOnInit() {
    this.onErrorTriggered = new BehaviorSubject(null);
    this.onErrorTriggered.subscribe((e) => {
      if (e != null && e.error != null) {
        this.openSnackBar('Une erreur s\'est produite : ' + e.error, 'Ok');
      }
    });
    let lvlId = this.route.snapshot.paramMap.get('levelID')
    this.json = await this.getJSON(lvlId);
    this.json.objectifs = await this.getObjectifs(this.json.level.id); 
    this.name = this.json.level.name;
    this.description = this.json.levelInfo.description;
    this.id = parseInt(this.route.snapshot.paramMap.get('levelID'), 10);



  }

  initIntro() {
    if (parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1), 10) > 1) {

      return;
    }
    window.removeEventListener('blockyLoaded', this.initIntro);
    this.ijs = IntroJs().setOptions({
      showProgress: true,
      steps: [
        {
          element: '#blocklyDiv',
          intro: 'Voici l\'espace algorithmique. C\'est ici que tu construira ton algorithme!',
          position: 'right'
        },
        {
          element: '#gameHolder',
          intro: 'Voici l\'espace de jeu. C\'est ici que s\'effectuera l\'action que tu as programmé. Ton but : ' +
            'atteindre l\'étoile le plus rapidement possible.',
          position: 'right'
        },
        {
          element: document.getElementsByClassName('blocklyTreeRow')[1],
          intro: 'Pour déplacer le personnage, place d\'abord un bloc de mouvement.',
          position: 'right'
        },
        {
          element: document.getElementsByClassName('blocklyTreeRow')[2],
          intro: 'Pour répéter une action, comme un déplacement, utilise un bloc de boucle.',
          position: 'right'
        },
        {
          element: '#startGameBtn',
          intro: 'Ce bouton permet de lancer ton algorithme et met en mouvement ton héro.',
          position: 'right'
        },
        {
          element: '#stopGameBtn',
          intro: 'Ce bouton permet de stopper ton algorithme, si tu t\'es trompé par exemple.',
          position: 'right'
        },
        {
          element: '#menu-play',
          intro: 'Pour revenir à la liste des niveaux, passe par le menu.',
          position: 'right'
        }
      ]
    }).start();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  async ngAfterViewChecked() {
    if (this.introStarted) {
      window.dispatchEvent(new Event('resize'));
    }
  }

  async getJSON(id: string) {
    try {
      const response = await this._api.get(id);
      if (!response || response.error) throw response.error;
      return response.message;
    } catch (error) {
      this.onErrorTriggered.next(error);
    }
  }
  async getObjectifs(idLevel: number) {
    try {
      const response = await this._api.getLvlObjectifs(idLevel);
      if (!response || response.error) throw response.error;
      return response.objectifs;
    } catch (error) {
      this.onErrorTriggered.next(error);
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
    });
  }
}
