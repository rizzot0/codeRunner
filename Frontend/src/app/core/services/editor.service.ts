import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface ProjectFile {
  path: string;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class EditorService {
  private _code$ = new BehaviorSubject<string>('');
  // default to C
  private _language$ = new BehaviorSubject<string>('c');
  private _theme$ = new BehaviorSubject<string>('dark');
  private _input$ = new BehaviorSubject<string>('');
  private _output$ = new BehaviorSubject<string>('');
  private _resize$ = new Subject<void>();

  code$ = this._code$.asObservable();
  language$ = this._language$.asObservable();
  theme$ = this._theme$.asObservable();
  input$ = this._input$.asObservable();
  output$ = this._output$.asObservable();
  resize$ = this._resize$.asObservable();
  
  // pane activation requests (e.g. 'terminal')
  private _activatePane$ = new Subject<string>();
  activatePane$ = this._activatePane$.asObservable();

  setCode(code: string) { this._code$.next(code); }
  getCode(): string { return this._code$.getValue(); }

  setLanguage(lang: string) { this._language$.next(lang); }
  getLanguage(): string { return this._language$.getValue(); }

  setTheme(theme: string) { this._theme$.next(theme); }
  getTheme(): string { return this._theme$.getValue(); }

  setInput(input: string) { this._input$.next(input); }
  getInput(): string { return this._input$.getValue(); }

  setOutput(output: string) { this._output$.next(output); }
  getOutput(): string { return this._output$.getValue(); }

  resizeEditor() { this._resize$.next(); }

  // Request activation of a pane by id (e.g. 'terminal')
  requestActivatePane(id: string) { this._activatePane$.next(id); }
}
