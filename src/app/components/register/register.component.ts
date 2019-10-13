import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthRequestService } from '../../providers/Api/authRequest.service';
import { RoleRequestService } from '../../providers/Api/roleRequest.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material';

enum AccountType {
  student = 1,
  professor = 2
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [AuthRequestService, RoleRequestService]
})
export class RegisterComponent implements OnInit {
  error: any;
  hide: any;

  roles: any;
  role: any;
  roleSelect: any;
  accountType = AccountType;

  authenticationFormGroup: FormGroup;
  presonalInfoFormGroup: FormGroup;
  accountTypeFormGroup: FormGroup;
  onErrorTriggered: BehaviorSubject<any>;

  flag_fr: any;
  flag_en: any;

  constructor(
    private _apiAuth: AuthRequestService,
    private _apiRole: RoleRequestService,
    private _fb: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _translate: TranslateService
  ) { }

  async ngOnInit() {
    this.hide = true;
    this.onErrorTriggered = new BehaviorSubject(null);
    this.roleSelect = (role: any) => {
      console.log('role', role);
      this.role = role;
    };
    this.onErrorTriggered.subscribe(e => {
      if (e != null && e.error != null) {
        this.openSnackBar('Une erreur s\'est produite : ' + e.error, 'Ok');
        this._router.navigate(['/']);
      }
    });
    this.authenticationFormGroup = this._fb.group({
      nameCtrl: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30)
      ])],
      passwordCtrl: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8)
      ])],
      confirmPasswordCtrl: ['', Validators.required]
    }, {
      // check whether our password and confirm password match
      validator: this.passwordMatchValidator
    });
    this.presonalInfoFormGroup = this._fb.group({
      firstnameCtrl: ['', Validators.compose([
        Validators.pattern('[A-Z][a-zA-Z]+(([\' -][A-Z])?[a-z]*)'),
        Validators.required
      ])],
      lastnameCtrl: ['', Validators.compose([
        Validators.pattern('[A-Z][a-zA-Z]+(([\' -][A-Z])?[a-z]*)'),
        Validators.required
      ])]
    });
    this.accountTypeFormGroup = this._fb.group({
      roleCtrl: ['', Validators.required],
      emailCtrl: [
        {
          value: undefined,
          disabled: false
        },
        Validators.compose([
          Validators.email,
          Validators.required
        ])
      ],
      profIDCtrl: ['', Validators.compose([
        Validators.pattern('[a-z]{4}[0-9]+'),
        Validators.required,
      ])]
    });

    this.flag_fr = require('../../../assets/web/flag_fr.png');
    this.flag_en = require('../../../assets/web/flag_en.png');
    this.roles = (await this._apiRole.getAll()).list;
  }

  async onSubmit() {
    try {
      const registerStatus = await this._apiAuth.register({
        // authentication info
        login: this.authenticationFormGroup.value.nameCtrl,
        password: this.authenticationFormGroup.value.passwordCtrl,
        // personal info
        nom: this.presonalInfoFormGroup.value.lastnameCtrl,
        prenom: this.presonalInfoFormGroup.value.firstnameCtrl,
        // account info
        role: this.accountTypeFormGroup.value.roleCtrl,
        email: this.accountTypeFormGroup.value.emailCtrl,
        profId: this.accountTypeFormGroup.value.profIDCtrl
      });
      if (
        registerStatus &&
        registerStatus.error &&
        registerStatus.error._body
      ) {
        console.log(registerStatus.error._body);
        throw registerStatus.error._body;
      }
      const { message } = registerStatus;
      if (message != null) {
        this.openSnackBar(message, 'Ok');
      }
      this._router.navigate(['/']);
    } catch (error) {
      if (error._body) {
        error = error._body;
      }
      this.onErrorTriggered.next(error);
    }
  }

  passwordMatchValidator(control: AbstractControl) {
    const password: string = control.get('passwordCtrl').value; // get password from our password form control
    const confirmPassword: string = control.get('confirmPasswordCtrl').value; // get password from our confirmPassword form control
    // compare is the password match
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmPasswordCtrl').setErrors({ NoPassswordMatch: true });
    }
  }

  checkAccessLevel(role: number) {
    return this.accountTypeFormGroup.value.roleCtrl === (role + '');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  setToFr() {
    this._translate.setDefaultLang('fr');
  }
  setToEn() {
    this._translate.setDefaultLang('en');
  }
}
