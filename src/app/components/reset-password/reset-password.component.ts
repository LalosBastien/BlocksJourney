import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  AuthRequestService
} from '../../providers/Api/authRequest.service';
import {
  Validators,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import {
  BehaviorSubject
} from 'rxjs/BehaviorSubject';
import {
  MatSnackBar
} from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  providers: [AuthRequestService]
})
export class ResetPasswordComponent implements OnInit {
  onErrorTriggered: BehaviorSubject<any>;

  resetForm: FormGroup;
  token: any;
  hide: boolean;

  flag_fr: any;
  flag_en: any;
  logo: any;

  constructor(private _api: AuthRequestService, private _router: Router, private _fb: FormBuilder,
    private route: ActivatedRoute, private snackBar: MatSnackBar, private _translate: TranslateService) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  ngOnInit() {
    this.onErrorTriggered = new BehaviorSubject(null);
    this.onErrorTriggered.subscribe((e) => {
      if (e != null && e.error != null) {
        this.openSnackBar('Une erreur s\'est produite : ' + e.error, 'Ok');
      }
    });
    this.resetForm = this._fb.group({
      password: [{
        value: undefined,
        disabled: false
      },
      [Validators.required, Validators.minLength(8)]
      ],
      repeatPassword: [{
        value: undefined,
        disabled: false
      },
      [Validators.required]
      ],
    });

    this.flag_fr = require('../../../assets/web/flag_fr.png');
    this.flag_en = require('../../../assets/web/flag_en.png');
    this.logo = require('../../../assets/web/logo-gpe.png');
  }
  async onSubmit() {
    try {
      const {
        password,
        repeatPassword
      } = this.resetForm.value;
      if (this.token == null) {
        // tslint:disable-next-line:no-string-throw
        throw 'Token Invalide';
      }
      if (password !== repeatPassword) {
        // tslint:disable-next-line:no-string-throw
        throw 'Les mots de passes ne correspondent pas';
      } else {
        const resetPassword = await this._api.resetPassword({
          password,
          token: this.token
        });
        const {
          message
        } = JSON.parse(resetPassword._body.toString());
        if (message != null) {
          this.openSnackBar(message, 'Ok');
        }
        this.openSnackBar('Le mot de passe a été mis à jour', 'Ok');
        this._router.navigate(['/']);
      }
    } catch (error) {
      console.log(error);
      this.openSnackBar(error, 'Ok');
      this.onErrorTriggered.next(error);
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }

  setToFr() { this._translate.setDefaultLang('fr'); }
  setToEn() { this._translate.setDefaultLang('en'); }
}
