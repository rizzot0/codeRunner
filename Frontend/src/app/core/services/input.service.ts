import { Injectable, signal } from "@angular/core";



@Injectable({ providedIn: 'root'})
export class InputService {
    input = signal<string>('')

    setInput(newInput : string) {
        this.input.set(newInput)
    }

    getInput() : string {
        return this.input()
    }
}