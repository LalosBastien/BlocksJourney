import { CONF_LOCAL } from '../environments/environment.local';
import { CONF_DEV } from '../environments/environment.dev';
import { CONF_PROD } from '../environments/environment.prod';

const ENV = process.env.ENV || 'PROD';

const LOCAL: String = 'LOCAL';
const DEV: String = 'DEV';
const PROD: String = 'PROD';

let conf: any;

console.log('Env', ENV);

if (ENV === PROD) {
  conf = CONF_PROD;
} else if (ENV === DEV) {
  conf = CONF_DEV;
} else {
  conf = CONF_LOCAL;
}

export const AppConfig = Object.assign({}, conf);
