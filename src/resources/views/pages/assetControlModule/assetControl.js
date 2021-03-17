import * as environment from '../../../../../config/environment.json';
import moment from 'moment';

import { inject, NewInstance } from 'aurelia-dependency-injection';
import { DialogService } from 'aurelia-dialog';
import { ValidationRules, ValidationController, validateTrigger } from 'aurelia-validation';
import { I18N } from 'aurelia-i18n';

import { Confirm } from '../../dialogs/confirmModule/confirm';
import { ProcessMessage } from '../../dialogs/processMessage/processMessage';

import { AssetService } from '../../../services/AssetService';
import { CountryService } from '../../../services/CountryService';

@inject(NewInstance.of(ValidationController), I18N, DialogService)
export class AssetControl {
  assets = [];
  asset = {};
  originalAsset = {};
  filters = {};

  constructor(controller, i18n, dialogService) {
    this.endpoint = environment.endpoint;
    this.validationController = controller;
    this.dialogService = dialogService;
    this.i18n = i18n;

    this.assetService = new AssetService(this.endpoint + "/api/Assets");
    this.countryService = new CountryService(this.endpoint + "/api/Countries");
    
    this.setupValidationRules();
  }

  get isModified() {
    return JSON.stringify(this.originalAsset) != JSON.stringify(this.asset);
  }

  get isValid() {
    var hasErrors = this.validationController.errors.length > 0;
    return this.isModified && !hasErrors;
  }



  activate(params, routeConfig) {
    var reference = this;
    this.routeConfig = routeConfig;
    if (params.id) {
      this.assetService.get(params.id).then(asset => {
        reference.setAsset(asset);
      }).catch(function () {
        location.href = "#create";
      });
    } else {
      reference.setAsset({
        "assetName": "",
        "department": 0,
        "countryOfDepartment": "",
        "emailAddressOfDepartment": "",
        "purchaseDate": moment().utc(),
        "broken": true
      });
    }
  }

  setupValidationRules() {
    this.assetValidationRules = ValidationRules
    this.assetValidationRules = ValidationRules
      .ensure(asset => asset.assetName).required().minLength(5).maxLength(150)
      .ensure(asset => asset.department).required()
      .ensure(asset => asset.countryOfDepartment).required()
      .satisfies(x => this.hasValidCountry)
      .ensure(asset => asset.emailAddressOfDepartment).required()
      .email()
      .ensure(asset => asset.purchaseDate).required()
      .satisfies(x => {
        var date = moment(x).utc();
        var year = moment().add(1, 'years').utc();
        var duration = moment.duration(year.diff(date))
        return date.isValid() && duration.years() <= 1;
      })
      .withMessage(this.i18n.tr("validations.cannotBeOlderThanAYear"))
      .rules;
  }

  setAsset(asset) {
    asset.purchaseDate = moment.utc(asset.purchaseDate).local().format("YYYY-MM-DD");
    this.asset = asset
    this.originalAsset = this.clone(this.asset)
    this.validationController.addObject(this.asset, this.assetValidationRules);
    this.validationController.validateTrigger = validateTrigger.change;
    this.validationController.reset()
    if (asset.countryOfDepartment) {
      this.searchCountry();
    }
  }

  restoreAsset() {
    var reference = this;
    this.dialogService.open({
      viewModel: Confirm,
      model: {
        "title": this.i18n.tr("areYouSure"),
        "description": this.i18n.tr("resetConsequence"),
        "approval": this.i18n.tr("approval"),
        "denial": this.i18n.tr("denial"),
      },
      lock: false
    }).whenClosed(response => {
      if (!response.wasCancelled) {
        reference.setAsset(reference.originalAsset);
      }
    });
  }

  deleteAsset() {
    var reference = this;
    if (this.asset.id) {
      this.dialogService.open({
        viewModel: Confirm,
        model: {
          "title": this.i18n.tr("areYouSure"),
          "description": this.i18n.tr("deleteConsequence"),
          "approval": this.i18n.tr("approval"),
          "denial": this.i18n.tr("denial"),
        },
        lock: false
      }).whenClosed(response => {
        if (!response.wasCancelled) {
          reference.assetService.delete(this.asset.id).then(function () {
            reference.submissionMessage = reference.i18n.tr("deletionSuccessfullMessage");
            location.href = "#create";
          }).catch(function () {
            reference.submissionError = reference.i18n.tr("unexpectedError");
          }).finally(function () {
            setTimeout(function (reference) {
              reference.submissionMessage = reference.submissionError = "";
            }, 2000, reference)
          })
        }
      });
    }
  }

  submit() {
    var reference = this;
    this.validationController.validate().then(function (validationResult) {
      if (validationResult.valid) {
        reference.dialogService.open({
          viewModel: Confirm,
          model: {
            "title": reference.i18n.tr("areYouSure"),
            "description": reference.i18n.tr("resetConsequence"),
            "approval": reference.i18n.tr("approval"),
            "denial": reference.i18n.tr("denial"),
          },
          lock: false
        }).whenClosed(response => {
          if (!response.wasCancelled) {
            var formattedAsset = reference.clone(reference.asset);
            formattedAsset.purchaseDate = moment(formattedAsset.purchaseDate).utc().toISOString();
            if (!reference.asset.id) {
              reference.assetService.create(formattedAsset).then(createdAsset => {
                reference.dialogService.open({
                  viewModel: ProcessMessage,
                  model: {
                    "title": reference.i18n.tr("success"),
                    "description": reference.i18n.tr("creationSuccessfullMessage"),
                    "approval": reference.i18n.tr("approval"),
                  },
                  lock: false
                })
                reference.search();
                location.href = "#edit/" + createdAsset.id;
              }).catch(function (message) {
                reference.dialogService.open({
                  viewModel: ProcessMessage,
                  model: {
                    "title": reference.i18n.tr("problem"),
                    "description": reference.i18n.tr("unexpectedError") + " ERR : " + message,
                    "approval": reference.i18n.tr("approval"),
                  },
                  lock: false
                })
              })
            } else {
              reference.assetService.update(formattedAsset).then(createdAsset => {
                reference.dialogService.open({
                  viewModel: ProcessMessage,
                  model: {
                    "title": reference.i18n.tr("success"),
                    "description": reference.i18n.tr("updateSuccessfullMessage"),
                    "approval": reference.i18n.tr("approval"),
                  },
                  lock: false
                })
                reference.setAsset(reference.asset);
                reference.search();
              }).catch(function (message) {
                reference.dialogService.open({
                  viewModel: ProcessMessage,
                  model: {
                    "title": reference.i18n.tr("problem"),
                    "description": reference.i18n.tr("unexpectedError") + " ERR : " + message,
                    "approval": reference.i18n.tr("approval"),
                  },
                  lock: false
                })
              })
            }
          }
        });
      }
    })
  }

  search() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    var reference = this;
    if (!reference.filters.criteria || reference.filters.criteria == "") {
      return;
    }
    reference.isLoading = true;
    this.searchTimeout = setTimeout(async function () {
      reference.assets = await reference.assetService.all(reference.filters);
      reference.isLoading = false;
    }, 250);
  }


  setCountry(countryName) {
    var reference = this;
    reference.asset.countryOfDepartment = countryName;
    reference.hasValidCountry = true;
    reference.countrySuggestion = null;
    reference.validationController.validate({
      object: reference.asset,
      propertyName: 'countryOfDepartment'
    });
  }

  searchCountry(event) {
    if (this.searchCountryTimeout) {
      clearTimeout(this.searchCountryTimeout);
      this.searchCountryTimeout = null;
    }
    var reference = this;

    if (reference.asset.countryOfDepartment.trim() == "") {
      this.hasValidCountry = false;
      this.countrySuggestion = null;
      return true;
    }

    if (event) {
      console.log(event)
      if (event.key == "Enter" && reference.countrySuggestion) {
        reference.setCountry(reference.countrySuggestion);
        return true;
      }
    }

    reference.isLoadingCountrySuggestions = true;
    this.searchCountryTimeout = setTimeout(async function () {
      var coincidences = await reference.countryService.GetAllByName(reference.asset.countryOfDepartment);
      if (coincidences.length && reference.asset.countryOfDepartment.toUpperCase() != coincidences[0].name.toUpperCase()) {
        reference.hasValidCountry = false;
        reference.countrySuggestion = coincidences[0].name;
        reference.validationController.validate({
          object: reference.asset,
          propertyName: 'countryOfDepartment'
        });
      } else {
        if (coincidences.length) {
          reference.setCountry(coincidences[0].name);
        }
      }
      reference.isLoadingCountrySuggestions = false;
    }, 250);
    return true;
  }

  clone(plainObject) {
    return JSON.parse(JSON.stringify(plainObject));
  }
}