import { effect, Injectable, signal } from '@angular/core';
import { EditorService } from './editor.service';

export type Theme = 'light' | 'dark' | 'dracula' | 'gruvbox';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // start signal as 'dark' to avoid flash of light theme on first render
  private _theme = signal<Theme>('dark');
  theme = this._theme.asReadonly();
  // prefer showing 'dark' first in selectors
  readonly allThemes: Theme[] = ['dark', 'light', 'dracula', 'gruvbox'];
  constructor(private editorService: EditorService) {
    this.loadTheme();
    effect(() => {
      const currentTheme = this._theme();
      this.saveTheme(currentTheme);
      this.applyThemeToBody(currentTheme);
      this.editorService.setTheme(currentTheme);
    });
  }

  changeTheme(theme: Theme) {
    if (this.allThemes.includes(theme)) {
      this._theme.set(theme);
    } else {
      console.error(`Theme not found: ${theme}`);
    }
  }

  private applyThemeToBody(theme: Theme) {
    const body = document.querySelector('body');
    if (body) {
      // Remove any existing theme classes
      this.allThemes.forEach(t => body.classList.remove(`${t}-theme`));
      // Add the new theme class
      body.classList.add(`${theme}-theme`);
    }
  }

  private saveTheme(theme: Theme) {
    localStorage.setItem('theme', theme);
  }

  private loadTheme() {
    this._theme.set('dark')
  }
}
