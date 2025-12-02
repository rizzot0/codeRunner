import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura'

import { routes } from './app.routes';
// monaco global provided by ngx-monaco-editor at runtime
declare const monaco: any;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    importProvidersFrom(MonacoEditorModule.forRoot({
      onMonacoLoad: () => {
        fetch('assets/themes/dracula.json')
          .then(response => response.json())
          .then(theme => {
            monaco.editor.defineTheme('dracula', theme);
          });
        fetch('assets/themes/solarized-light.json')
          .then(response => response.json())
          .then(theme => {
            monaco.editor.defineTheme('solarized-light', theme);
          });
        // Apply stored theme to monaco immediately when monaco loads to avoid race conditions
        try {
          const stored = localStorage.getItem('theme');
          let themeName = 'vs-dark';
          if (stored === 'light') themeName = 'vs';
          else if (stored === 'dark') themeName = 'vs-dark';
          else if (stored) themeName = stored;
          if (monaco?.editor?.setTheme) monaco.editor.setTheme(themeName);
        } catch (e) {}
      }
    }))
    , MessageService
  ]
};
