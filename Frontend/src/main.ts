import { defineCustomElements } from 'ngx-flexlayout/loader';

declare const self: any;

self.MonacoEnvironment = {
  getWorkerUrl: (workerId: string, label: string) => {
    switch (label) {
      case 'json':
        return './assets/monaco/vs/language/json/json.worker.js';
      case 'css':
      case 'scss':
      case 'less':
        return './assets/monaco/vs/language/css/css.worker.js';
      case 'html':
      case 'handlebars':
      case 'razor':
        return './assets/monaco/vs/language/html/html.worker.js';
      case 'typescript':
      case 'javascript':
        return './assets/monaco/vs/language/typescript/ts.worker.js';
      default:
        return './assets/monaco/vs/editor/editor.worker.js';
    }
  },
};

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

defineCustomElements();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
