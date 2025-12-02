import { Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { InputService } from "./input.service";
import { FileSystemService } from "./file-system.service";
import { FileNode } from "../models/file.model";
import { EditorService } from './editor.service';
import { MessageService } from 'primeng/api';


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
        // show terminal automatically when starting execution
        this.editorService.requestActivatePane('terminal');
        // clear previous outputs so the terminal doesn't show old runs
        this.stdout.set('');
        this.stderr.set('');
        this.isFetching.set(true)

        const payload = {
            programming_language : this.fileService.language(),
            input : this.inputService.getInput() ?? '\n',
            entrypoint : this.fileService.getFileById('0')?.name,
            files: this.convertToFilesNodeToFilesBackend()
        }

        console.log(payload)
        try {
            const res = await fetch(`${environment.apiUrl}/execution`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if(!res.ok) {
                // attempt to read error body
                let errText = '';
                try { errText = await res.text(); } catch(e) { errText = 'Server error'; }
                    // ensure stdout is cleared when there's an error response
                    this.stdout.set('');
                    this.stderr.set(errText || `HTTP ${res.status}`);
                this.messageService.add({ severity: 'error', summary: 'Execution error', detail: `Server returned ${res.status}`, life: 5000 });
                result = false;
            } else {
                const data = await res.json();
                    // normalize undefined -> empty string so terminal always updates
                    this.stdout.set(data?.stdout ?? '');
                    this.stderr.set(data?.stderr ?? '');
                result = true
            }
        } catch(e : any) {
            console.error(e)
                // clear stdout and set stderr to the error message
                this.stdout.set('');
                this.stderr.set(String(e?.message ?? e) || 'Unknown error');
            this.messageService.add({ severity: 'error', summary: 'Execution failed', detail: String(e?.message ?? 'Unknown error'), life: 5000 });
            result = false
        } finally {
            this.isFetching.set(false)
            return result
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

