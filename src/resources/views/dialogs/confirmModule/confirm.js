import {
  DialogController
} from 'aurelia-dialog';

export class Confirm {
  static inject = [DialogController];
  constructor(controller) {
    this.controller = controller;
  }
  activate(settings) {
    this.settings = settings;
  }
}
