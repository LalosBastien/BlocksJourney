import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  AuthRequestService
} from '../../providers/Api/authRequest.service';
import {
  RoleRequestService
} from '../../providers/Api/roleRequest.service';
import {
  BehaviorSubject
} from 'rxjs/BehaviorSubject';
import {
  Router
} from '@angular/router';
import {
  TranslateService
} from '@ngx-translate/core';
import {
  MatSnackBar
} from '@angular/material';

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
  register1FormGroup: FormGroup;
  register2FormGroup: FormGroup;
  register3FormGroup: FormGroup;
  onErrorTriggered: BehaviorSubject<any>;

  flag_fr: any;
  flag_en: any;

  constructor(private _apiAuth: AuthRequestService, private _apiRole: RoleRequestService, private _fb: FormBuilder, private _router: Router,
    public snackBar: MatSnackBar, private _translate: TranslateService) { }

  async ngOnInit() {

    this.hide = true;
    this.onErrorTriggered = new BehaviorSubject(null);
    this.roleSelect = (role: any) => {
      console.log('role', role);
      this.role = role;
    };
    this.onErrorTriggered.subscribe((e) => {
      if (e != null && e.error != null) {
        this.openSnackBar('Une erreur s\'est produite : ' + e.error, 'Ok');
        this._router.navigate(['/']);
      }
    });

    this.register1FormGroup = this._fb.group({
      nameCtrl: ['', Validators.required],
      passwordCtrl: ['', Validators.required]
    });
    this.register2FormGroup = this._fb.group({
      emailCtrl: [{
        value: undefined,
        disabled: false
      },
      [Validators.required, Validators.email]
      ],
      firstnameCtrl: ['', Validators.required],
      lastnameCtrl: ['', Validators.required],
    });

    this.register3FormGroup = this._fb.group({
      roleCtrl: ['', Validators.required],
      profIDCtrl: '',
    });




    this.flag_fr = require('../../../assets/web/flag_fr.png');
    this.flag_en = require('../../../assets/web/flag_en.png');
    this.roles = (await this._apiRole.getAll()).list;
  }
  async onSubmit() {
    try {
      const registerStatus = await this._apiAuth.register({
        login: this.register1FormGroup.value.nameCtrl,
        password: this.register1FormGroup.value.passwordCtrl,
        nom: this.register2FormGroup.value.lastnameCtrl,
        prenom: this.register2FormGroup.value.firstnameCtrl,
        email: this.register2FormGroup.value.emailCtrl,
        role: this.register3FormGroup.value.roleCtrl,
        profId: this.register3FormGroup.value.profIDCtrl,
      });
      if (registerStatus && registerStatus.error && registerStatus.error._body) {
        console.log(registerStatus.error._body);
        throw registerStatus.error._body;
      }
      const {
        message
      } = JSON.parse(registerStatus._body.toString());
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

  checkAccessLevel() {
    return this.register3FormGroup.value.roleCtrl === '1';
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
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
