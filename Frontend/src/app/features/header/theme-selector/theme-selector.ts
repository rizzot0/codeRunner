import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Theme, ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [Select, FormsModule],
  template: `
    <p-select
      [(ngModel)]="selectedTheme"
      [options]="themesOptions"
      optionLabel="name"
      optionValue="value"
      placeholder="Tema"
      (onChange)="changeTheme($event.value)"
    ></p-select>
  `,
  styleUrls: ['./theme-selector.css'],
})
export class ThemeSelectorComponent {
  private themeService = inject(ThemeService);
  themesOptions = this.themeService.allThemes.map((t: Theme) => ({ name: t, value: t }));
  selectedTheme: Theme = this.themeService.theme();

  changeTheme(theme: Theme) {
    this.themeService.changeTheme(theme);
    this.selectedTheme = this.themeService.theme();
  }
}
