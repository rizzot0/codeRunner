import { Component, effect, signal } from '@angular/core';
import { ExecutionService } from '../../core/services/execution.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.html',
  imports: [ProgressSpinnerModule, ButtonModule, TooltipModule],
  styleUrl: './terminal.css'
})
export class Terminal {
  stdout = signal<string>('');
  stderr = signal<string>('');
  loading = signal<boolean>(false)

  constructor(private executionService: ExecutionService) {
    effect(() => {
      const out = this.executionService.getStdout();
      const err = this.executionService.getStderr();

      // Always set the terminal output to the latest values (including empty string)
      this.stdout.set(out ?? '');
      this.stderr.set(err ?? '');
    });

    effect(() => {
      const isFetching = this.executionService.isFetching()
      this.loading.set(isFetching)
    })
  }
}
