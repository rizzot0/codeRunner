import { Component, computed, effect, inject, signal } from '@angular/core';
import { Selector } from "../../shared/components/selector/selector";
import { Button, ButtonModel } from "../../shared/components/button/button";
import { ProjectDownloadService } from '../../core/services/project-download.service';
import { EditorService } from '../../core/services/editor.service';
import { FileSystemService } from '../../core/services/file-system.service';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

import { ThemeSelectorComponent } from './theme-selector/theme-selector';
import { ExecutionService } from '../../core/services/execution.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [Selector, Button, ThemeSelectorComponent, DialogModule, InputTextModule, ButtonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private confirmationService = inject(ConfirmationService);

  // dialog state for export filename
  showExportDialog: boolean = false;
  exportFilename: string = 'project';
  isLoadingExecution = signal<boolean>(false)
  isLoadingExport = signal<boolean>(false)

  constructor( 
    public fileExplorerService : FileSystemService, 
    public projectDownloadService : ProjectDownloadService, 
    private editorService: EditorService, 
    public executionService : ExecutionService,
    public themeService : ThemeService
  ) {
    effect(() => {
      this.isLoadingExecution.set(this.executionService.isFetching())
    })
  }

  readonly buttons: ButtonModel[] = [
    { 
      icon: 'pi pi-play', 
      description: 'Ejecutar',
      color: 'ejecutar', 
      onClick: () => this.ejecutar(),
      isLoading: computed(() => this.isLoadingExecution())
    },
    { 
      icon: 'pi pi-file-export', 
      description: 'Exportar',
      color: 'exportar', 
      onClick: () => this.exportProject(),
      isLoading: computed(() => this.isLoadingExport())
    }
  ];


  async ejecutar() {
    this.executionService.execute()
  }

  entrypointFor(lang: string) {
    switch ((lang || '').toLowerCase()) {
      case 'python':
      case 'py': return 'main.py';
      case 'cpp':
      case 'c++': return 'main.cpp';
      case 'c': return 'main.c';
      default: return 'main.c';
    }
  }

  async exportProject() {
    // Open dialog to ask for filename before exporting
    this.exportFilename = 'project';
    this.showExportDialog = true;
  }

  confirmExport() {
    const filename = (this.exportFilename || 'project').trim() || 'project';
    this.projectDownloadService.downloadAsZip(this.fileExplorerService.filesTree(), filename);
    this.showExportDialog = false;
  }

  cancelExport() {
    this.showExportDialog = false;
  }

}