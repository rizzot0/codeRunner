import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FileSystemService } from '../../../core/services/file-system.service';
import { Language, LANGUAGE_CONFIGS } from '../../../core/models/file.model';

interface LanguageOption {
  name: string;
  code: string;
  value: Language | string;
}

@Component({
  selector: 'app-selector',
  imports: [Select, FormsModule, ConfirmDialog],
  templateUrl: './selector.html',
  styleUrl: './selector.css',
  // ConfirmationService is provided at app root to allow reuse across components
})
export class Selector implements OnInit {
  private fileSystemService = inject(FileSystemService);
  private confirmationService = inject(ConfirmationService);
  @Input() options: LanguageOption[] | null = null;
  @Input() selectedOption: LanguageOption | null = null;
  @Output() optionSelected = new EventEmitter<string>();

  languages: LanguageOption[] = [];
  selectedLanguage: LanguageOption | null = null;
  private previousLanguage: LanguageOption | null = null;
  private isInitializing = true;

  ngOnInit() {
    // if options are provided via inputs (used by theme-selector), use them
    if (this.options && this.options.length > 0) {
      this.languages = this.options;
    } else {
      this.languages = [
        { name: 'JavaScript', code: 'JS', value: 'javascript' },
        { name: 'Python', code: 'PY', value: 'python' },
        { name: 'C++', code: 'CPP', value: 'cpp' }
      ];
    }

    const currentLang = this.fileSystemService.language();
    const initialLang = this.options?.length ? this.selectedOption : this.languages.find(l => l.value === currentLang);
    this.selectedLanguage = (initialLang as LanguageOption) || this.languages[0];
    this.previousLanguage = this.selectedLanguage;
    this.isInitializing = false;
  }

  onLanguageChange(newLanguage: LanguageOption): void {
    if (this.isInitializing || !newLanguage) {
      return;
    }

    // If selector was used as a generic selector (e.g., theme-selector), just emit
    if (this.options && this.options.length > 0) {
      this.optionSelected.emit(String(newLanguage.value));
      return;
    }

    const currentLang = this.fileSystemService.language();

    if (newLanguage.value === currentLang) {
      return;
    }

    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas cambiar de lenguaje? Perderás todos los archivos y cambios actuales.',
      header: 'Confirmar cambio de lenguaje',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.fileSystemService.changeLanguage(newLanguage.value as Language);
        this.previousLanguage = newLanguage;
      },
      reject: () => {
        this.selectedLanguage = this.previousLanguage;
      }
    });
  }
}
