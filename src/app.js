
import {
  inject
} from 'aurelia-dependency-injection';

import {
  I18N
} from 'aurelia-i18n';

import { ValidationMessageProvider} from 'aurelia-validation';

@inject(I18N)
export class App {
  constructor(i18n){ 
    this.i18n = i18n;
    this.configureLocalization();
  }

  configureLocalization() {
    var reference = this;
    ValidationMessageProvider.prototype.getMessage = function(key) {
      const translation = reference.i18n.tr("validations." + key);;
      return this.parser.parse(translation);
    };
  
    ValidationMessageProvider.prototype.getDisplayName = function(propertyName, displayName) {
      if (displayName !== null && displayName !== undefined) {
        return displayName;
      }
      return reference.i18n.tr(propertyName);
    };
  }

  configureRouter(config, router) {
    config.options.pushState = false;
    config.options.root = '/';
    config.map([
    {
      route: ['create', "edit/:id", ""],
      moduleId: PLATFORM.moduleName('./resources/views/pages/assetControlModule/assetControl'),
      title: 'Edit Asset'
    }]);
    this.router = router;
  }
}
