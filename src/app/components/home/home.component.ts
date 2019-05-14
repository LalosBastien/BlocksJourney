import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import {
  LoginForm
} from '../../models/form/login.component';
import {
  ErrorStateMatcher
} from '@angular/material/core';
import {
  AuthRequestService
} from './../../providers/Api/authRequest.service';
import {
  BehaviorSubject
} from 'rxjs/BehaviorSubject';
import {
  MatSnackBar
} from '@angular/material';
import {
  TranslateService
} from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [AuthRequestService]
})
export class HomeComponent implements OnInit {
  error: any;
  onErrorTriggered: BehaviorSubject < any > ;
  actualUser: object;
  loginForm: FormGroup;
  hide: boolean;

  flag_fr: any;
  flag_en: any;
  flag_us: any;
  logo: any;

  usernameFormControl = new FormControl('', [
    Validators.required,
  ]);
  passwordFormControl = new FormControl('', [
    Validators.required,
  ]);

  constructor(private _api: AuthRequestService, private _fb: FormBuilder, private _router: Router,
    public _snackBar: MatSnackBar, private _translate: TranslateService) {
    this.hide = true;
    this.error = null;
  }

  matcher = new ErrorStateMatcher();
  model = new LoginForm('', '');

  ngOnInit() {
    this.onErrorTriggered = new BehaviorSubject(null);
    this.onErrorTriggered.subscribe((error) => {
      if (error != null) {
        this.openSnackBar('Une erreur s\'est produite : ' + error, 'Ok');
      }
    });
    this.loginForm = this._fb.group({
      username: [{
          value: undefined,
          disabled: false
        },
        [Validators.required, Validators.minLength(8)]
      ],
      password: [{
          value: undefined,
          disabled: false
        },
        [Validators.required]
      ],
    });

    this.flag_fr = require('../../../assets/web/flag_fr.png');
    this.flag_en = require('../../../assets/web/flag_en.png');
    this.flag_us = require('../../../assets/web/flag_us.png');
    this.logo = require('../../../assets/web/logo-gpe.png');
  }

  onSubmit() {
    this.authenticate(this.loginForm.value.username, this.loginForm.value.password);
  }

  async authenticate(username, password) {
    try {
      const login = await this._api.authenticate({
        login: username,
        password
      });

      if (!login || login.error) {
        throw login.error;
      }
      this._router.navigate(['levels']);
    } catch (error) {
      this.onErrorTriggered.next(error);
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
    });
  }

  setToFr() {
    this._translate.setDefaultLang('fr');
  }
  setToEn() {
    this._translate.setDefaultLang('en');
  }
}
