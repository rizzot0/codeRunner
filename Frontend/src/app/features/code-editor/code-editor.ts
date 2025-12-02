import { CommonModule } from '@angular/common';
import { Component, inject, computed, effect, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FileSystemService } from '../../core/services/file-system.service';
import { LANGUAGE_CONFIGS } from '../../core/models/file.model';
import { ThemeService } from '../../core/services/theme.service';
import { EditorService } from '../../core/services/editor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-code-editor',
  imports: [CommonModule, FormsModule, MonacoEditorModule, ButtonModule, TooltipModule],
  
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.css',
})
export class CodeEditor implements OnDestroy {
  private fileSystemService = inject(FileSystemService);
  private themeService = inject(ThemeService);
  private editorService = inject(EditorService);

  editorOptions = computed(() => {
    const lang = this.fileSystemService.language();
    const config = LANGUAGE_CONFIGS[lang];
    const theme = this.themeService.theme();
    return {
      theme: theme === 'light' ? 'vs' : theme === 'dark' ? 'vs-dark' : theme,
      language: config.monacoLanguage,
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      scrollBeyondLastLine: false,
    };
  });

  code: string = '';
  private currentFileId: string | null = null;
  private isUpdatingFromFile = false;
  private updateTimeout: any = null;

  private editor: any;
  private resizeSubscription: Subscription;

  constructor() {
    effect(() => {
      const selectedFile = this.fileSystemService.selectedFile();
      if (selectedFile && selectedFile.type === 'file') {
        this.isUpdatingFromFile = true;
        this.code = selectedFile.content || '';
        this.currentFileId = selectedFile.id;
        setTimeout(() => {
          this.isUpdatingFromFile = false;
        }, 100);
      }
    });

    this.resizeSubscription = this.editorService.resize$.subscribe(() => {
      if (this.editor) {
        this.editor.layout();
      }
    });
  }

  onEditorInit(editor: any) {
    this.editor = editor;
    // Ensure Monaco editor theme matches current app theme right after init.
    // Monaco may not be available immediately on first load; try applying theme and poll until available.
    const applyTheme = (themeName: string) => {
      try {
        if (this.editor && typeof this.editor.setTheme === 'function') {
          this.editor.setTheme(themeName);
          return true;
        }
        if ((window as any).monaco?.editor?.setTheme) {
          (window as any).monaco.editor.setTheme(themeName);
          return true;
        }
      } catch (e) {
        // ignore
      }
      return false;
    };

    const theme = this.themeService.theme();
    const themeName = theme === 'light' ? 'vs' : theme === 'dark' ? 'vs-dark' : theme;
    if (!applyTheme(themeName)) {
      // Poll for monaco availability briefly
      let attempts = 0;
      const iv = setInterval(() => {
        attempts++;
        if (applyTheme(themeName) || attempts > 30) {
          clearInterval(iv);
        }
      }, 150);
    }
  }

  // Keep Monaco theme in sync when app theme changes
  private themeSyncEffect = effect(() => {
    const theme = this.themeService.theme();
    const themeName = theme === 'light' ? 'vs' : theme === 'dark' ? 'vs-dark' : theme;
    // Try direct editor setTheme first, fallback to global monaco.
    try {
      if (this.editor && typeof this.editor.setTheme === 'function') {
        this.editor.setTheme(themeName);
        return;
      }
    } catch (e) {}
    try {
      if ((window as any).monaco?.editor?.setTheme) {
        (window as any).monaco.editor.setTheme(themeName);
      }
    } catch (e) {}
  });

  onCodeChange(newCode: string): void {
    if (this.isUpdatingFromFile || !this.currentFileId) {
      return;
    }

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      if (this.currentFileId) {
        this.fileSystemService.updateFileContent(this.currentFileId, newCode);
      }
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }
}
