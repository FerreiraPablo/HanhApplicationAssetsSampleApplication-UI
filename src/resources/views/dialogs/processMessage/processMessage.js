import {
  DialogController
} from 'aurelia-dialog';

export class ProcessMessage {
  static inject = [DialogController];
  constructor(controller) {
    this.controller = controller;
  }
  activate(settings) {
    this.settings = settings;
  }
}
