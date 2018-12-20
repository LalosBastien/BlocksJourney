import {
  Router
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
  MatSnackBar
} from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [AuthRequestService]
})
export class ForgotPasswordComponent implements OnInit {
  resetForm: FormGroup;

  flag_fr: any;
  flag_en: any;
  flag_us: any;
  logo: any;

  constructor(private _api: AuthRequestService, private _router: Router, private _fb: FormBuilder,
    public snackBar: MatSnackBar, private _translate: TranslateService) {}

  ngOnInit() {
    this.resetForm = this._fb.group({
      email: [{
          value: undefined,
          disabled: false
        },
        [Validators.required, Validators.email]
      ]
    });

    this.flag_fr = require('../../../assets/web/flag_fr.png');
    this.flag_en = require('../../../assets/web/flag_en.png');
    this.flag_us = require('../../../assets/web/flag_us.png');
    this.logo = require('../../../assets/web/logo-pensalgo.png');
  }
  async onSubmit() {

    try {
      const { email } = this.resetForm.value;
      console.log(email)
      const askReset = await this._api.askResetPassword(email);
      this.openSnackBar('Demande de récupération de mot de passe envoyée', 'Ok');
      console.log(askReset);
    } catch (error) {
      console.log(error);
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
