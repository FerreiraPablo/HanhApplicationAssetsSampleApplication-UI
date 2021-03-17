import * as environment from '../config/environment.json';
import {
  PLATFORM
} from 'aurelia-pal';
import {
  I18N,
  Backend,
  TCustomAttribute
} from 'aurelia-i18n';
import XHR from 'i18next-xhr-backend';

import moment from 'moment';

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import './resources/styles/bootstrap-theme.css';

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging(environment.debug ? 'debug' : 'warn')
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('aurelia-dialog'))
    .plugin(PLATFORM.moduleName('aurelia-i18n'), (instance) => {
      let aliases = ['t', 'i18n'];
      TCustomAttribute.configureAliases(aliases);
      instance.i18next.use(XHR);
      return instance.setup({
        backend: {
          loadPath: './locales/{{lng}}/{{ns}}.json',
        },
        attributes: aliases,
        lng: 'en',
        fallbackLng: 'en',
        debug: false
      });
    });

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }
  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
