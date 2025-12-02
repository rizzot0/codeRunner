import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputService } from '../../core/services/input.service';

@Component({
  selector: 'app-input-panel',
  imports: [CommonModule, FormsModule, MonacoEditorModule, ButtonModule, TooltipModule],
  templateUrl: './input-panel.html',
  styleUrl: './input-panel.css',
})
export class InputPanel {
  constructor(public inputService : InputService) {}

  inputValue: string = '';

  editorOptions = {
    theme: 'vs-dark',
    language: 'plaintext',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
  };

  onInputChange(value: string): void {
    this.inputValue = value;
    this.inputService.setInput(this.inputValue)
  }
}