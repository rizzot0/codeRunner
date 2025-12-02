import { Component, signal, inject, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IgcDockManagerLayout,
  IgcDockManagerPaneType,
  IgcSplitPaneOrientation,
} from 'ngx-flexlayout';
import { Header } from './features/header/header';
import { ConfirmationService } from 'primeng/api';
import { CodeEditor } from './features/code-editor/code-editor';
import { FileExplorer } from './features/file-explorer/file-explorer';
import { InputPanel } from './features/input-panel/input-panel';
import { Terminal } from './features/terminal/terminal';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { EditorService } from './core/services/editor.service';
import { ThemeService } from './core/services/theme.service';
import { MessageService } from 'primeng/api';

import { TabEditor } from "./features/tab-editor/tab-editor";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    CodeEditor,
    FileExplorer,
    InputPanel,
    Terminal,
    ButtonModule,
    ToastModule,
    TabEditor,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  protected readonly title = signal('Frontend');
  private editorService = inject(EditorService);
  private themeService = inject(ThemeService);

  constructor() {
    // listen for requests to activate panes (e.g. show terminal on execution)
    this.editorService.activatePane$.subscribe((paneId) => {
      // try to find the tab header with the pane label and click it
      setTimeout(() => {
        const flex = document.querySelector('ngx-flexlayout');
        if (!flex) return;
        const candidates = Array.from(flex.querySelectorAll('button,div,span')) as HTMLElement[];
        const target = candidates.find(el => el.textContent?.trim() === 'Terminal');
        if (target) {
          target.click();
        }
      }, 50);
    });
  }

  flexLayoutTheme = computed(() => {
    const theme = this.themeService.theme();
    return theme === 'light' || theme === 'gruvbox' ? 'light-theme' : 'dark-theme';
  });

  layout: IgcDockManagerLayout = {
    rootPane: {
      type: IgcDockManagerPaneType.splitPane,
      orientation: IgcSplitPaneOrientation.horizontal,
      panes: [
        {
          type: IgcDockManagerPaneType.contentPane,
          size: 20,
          contentId: 'file-explorer',
          header: 'File Explorer',
          allowPinning: false,
          allowFloating: false,
          allowClose: false,
        },
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          size: 80,
          panes: [
            {
              type: IgcDockManagerPaneType.contentPane,
              size: 70,
              contentId: 'code-editor',
              header: 'Code Editor',
              allowPinning: false,
              allowFloating: false,
              allowClose: false,
            },
            ({
              type: IgcDockManagerPaneType.tabGroupPane,
              size: 30,
              // Place the tab headers at the top (default was bottom)
              tabHeadersPosition: 'top',
              // Select the second tab (Terminal) when the layout initializes
              selectedIndex: 1,
              panes: [
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: 'input-panel',
                  header: 'Input',
                  allowPinning: false,
                  allowFloating: false,
                  allowClose: false,
                },
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: 'terminal',
                  header: 'Terminal',
                  allowPinning: false,
                  allowFloating: false,
                  allowClose: false,
                },
              ],
            } as any),
          ],
        },
      ],
    },
  };

  onLayoutChanged() {
    // This event can fire frequently, so we debounce it slightly
    // to avoid excessive calls to the editor's layout method.
    setTimeout(() => this.editorService.resizeEditor(), 50);
  }
}
