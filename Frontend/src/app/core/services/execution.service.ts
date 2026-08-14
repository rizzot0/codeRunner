import { Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { InputService } from "./input.service";
import { FileSystemService } from "./file-system.service";
import { FileNode } from "../models/file.model";
import { EditorService } from './editor.service';
import { MessageService } from 'primeng/api';
import { runInBrowser } from './browser-runtime';

export type FileBackend = {
    path : string,
    content : string
}

@Injectable({ providedIn: 'root'})
export class ExecutionService {

    constructor(
        private inputService : InputService,
        private fileService : FileSystemService,
        private editorService: EditorService,
        private messageService: MessageService
    ) {}

    isFetching = signal<boolean>(false)
    stdout = signal<string>('')
    stderr = signal<string>('')

    getStdout() {
        return this.stdout()
    }

    getStderr() {
        return this.stderr()
    }

    async execute() : Promise<boolean> {
        let result = true
        this.editorService.requestActivatePane('terminal');
        this.stdout.set('');
        this.stderr.set('');
        this.isFetching.set(true)

        const files = this.convertToFilesNodeToFilesBackend()
        const language = this.fileService.language()
        const entrypoint = this.fileService.getFileById('0')?.name
        const input = this.inputService.getInput() ?? ''
        const main = files.find((file) => file.path === entrypoint) ?? files[0]

        try {
            if (!main) {
                throw new Error('No hay un archivo de entrada para ejecutar')
            }

            if (environment.useClientRuntime && language === 'python') {
                this.stderr.set('Cargando Python en el navegador (solo la primera vez)…')
            }
            if (environment.useClientRuntime && (language === 'cpp' || language === 'c++')) {
                this.stderr.set('Compilando C++…')
            }

            const output = environment.useClientRuntime
                ? await runInBrowser(language, main.content, input)
                : await this.runOnBackend(language, entrypoint, input, files)

            this.stdout.set(output.stdout)
            this.stderr.set(output.stderr)
            result = true
        } catch(e : any) {
            console.error(e)
            this.stdout.set('');
            this.stderr.set(String(e?.message ?? e) || 'Unknown error');
            this.messageService.add({ severity: 'error', summary: 'Execution failed', detail: String(e?.message ?? 'Unknown error'), life: 5000 });
            result = false
        } finally {
            this.isFetching.set(false)
            return result
        }
    }

    private async runOnBackend(
        language: string,
        entrypoint: string | undefined,
        input: string,
        files: FileBackend[]
    ) {
        const res = await fetch(`${environment.apiUrl}/execution`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                programming_language: language,
                input,
                entrypoint,
                files
            })
        })

        if (!res.ok) {
            const errText = await res.text().catch(() => 'Server error')
            this.messageService.add({ severity: 'error', summary: 'Execution error', detail: `Server returned ${res.status}`, life: 5000 });
            throw new Error(errText || `HTTP ${res.status}`)
        }

        const data = await res.json()
        return {
            stdout: data?.stdout ?? '',
            stderr: data?.stderr ?? ''
        }
    }

    private convertToFilesNodeToFilesBackend() {
        const files = this.fileService.filesTree()
        const res : FileBackend[] = []
        const traverse = (file : FileNode, path : string) => {
            const currentPath = path ? `${path}/${file.name}` : file.name;

            if(file.type === 'file') {
                res.push({ path: currentPath, content: file.content as string})
            }

            if(file.children) {
                for(const c of file.children) {
                    traverse(c, currentPath)
                }
            }
        }
        files.forEach(( file ) => {
            traverse(file, '')
        })
        return res
    }
}
