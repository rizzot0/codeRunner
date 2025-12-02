import { Component, effect, input, output, Signal, signal } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-button',
  imports: [ButtonModule, ProgressSpinnerModule],
  templateUrl: './button.html',
  styleUrl: './button.css'
})

export class Button {
  icon = input.required<string>();
  description = input.required<string>()
  isLoading = input.required<boolean>()
  color = input<'ejecutar' | 'detener' | 'debug' | 'exportar' | 'tema'>()
  disabledTime = input<number>(1000)
  clicked = output<void>()
  isDisabled = signal(false)

  constructor() {
    effect(() => {
      if(!this.isLoading()) {
        this.isDisabled.set(false)
      }
    })
  }

  onClick() {
    if (this.isDisabled() || this.isLoading()) return
    
    this.isDisabled.set(true)
    this.clicked.emit()
    
    setTimeout(() => {
      if(!this.isLoading()) {
        this.isDisabled.set(false)
      }
    }, this.disabledTime())
  }
}

export interface ButtonModel {
  icon: string;
  description: string;
  color: 'ejecutar' | 'detener' | 'debug' | 'exportar' | 'tema';
  onClick?: () => void;
  isLoading: Signal<boolean>;
}