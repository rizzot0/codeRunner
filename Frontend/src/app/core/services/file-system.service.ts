import { Injectable, signal, computed } from '@angular/core';
import { FileNode, Language, LANGUAGE_CONFIGS } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  private files = signal<FileNode[]>([]);
  private selectedFileId = signal<string | null>(null);
  private currentLanguage = signal<Language>('javascript');
  private nextId = 1;

  readonly filesTree = computed(() => this.files());
  readonly selectedFile = computed(() => {
    const id = this.selectedFileId();
    if (!id) return null;
    return this.findFileById(this.files(), id);
  });
  readonly language = computed(() => this.currentLanguage());

  constructor() {
    // Try to load persisted state; otherwise initialize defaults
    const saved = localStorage.getItem('fileSystemState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.files)) {
          this.files.set(parsed.files);
          this.selectedFileId.set(parsed.selectedFileId ?? (parsed.files[0]?.id ?? null));
          this.currentLanguage.set(parsed.language ?? 'javascript');
          this.nextId = parsed.nextId ?? 1;
        } else {
          this.initializeFiles('javascript');
        }
      } catch (e) {
        this.initializeFiles('javascript');
      }
    } else {
      this.initializeFiles('javascript');
    }

    // Persist changes
    this.files.update = ((orig) => (updater: any) => {
      const result = (orig as any).call(this.files, updater);
      this.persist();
      return result;
    })(this.files.update.bind(this.files));
  }

  initializeFiles(language: Language): void {
    const config = LANGUAGE_CONFIGS[language];
    const mainFile: FileNode = {
      id: '0',
      name: `main${config.extension}`,
      type: 'file',
      content: config.defaultContent
    };

    this.files.set([mainFile]);
    this.selectedFileId.set('0');
    this.currentLanguage.set(language);
    this.nextId = 1;
  }

  changeLanguage(language: Language): void {
    this.initializeFiles(language);
    this.persist();
  }

  selectFile(fileId: string): void {
    this.selectedFileId.set(fileId);
    this.persist();
  }

  getFileById(fileId : string): FileNode | undefined {
    const findInTree = (files: FileNode[]): FileNode | undefined => {
      for (const f of files) {
        if (f.id === fileId) return f;
        if (f.children) {
          const found = findInTree(f.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findInTree(this.files());
  }

  updateFileContent(fileId: string, content: string): void {
    this.files.update(files => this.updateFileInTree(files, fileId, content));
    this.persist();
  }

  createFile(name: string, parentId?: string): void {
    const newFile: FileNode = {
      id: String(this.nextId++),
      name,
      type: 'file',
      content: ''
    };

    if (!parentId) {
      this.files.update(files => [...files, newFile]);
    } else {
      this.files.update(files => this.addFileToFolder(files, parentId, newFile));
    }
    this.selectFile(newFile.id)
    this.persist();
  }

  createFolder(name: string, parentId?: string): void {
    const newFolder: FileNode = {
      id: String(this.nextId++),
      name,
      type: 'folder',
      children: [],
      expanded: true
    };

    if (!parentId) {
      this.files.update(files => [...files, newFolder]);
    } else {
      this.files.update(files => this.addFileToFolder(files, parentId, newFolder));
    }
    this.persist();
  }

  deleteFile(fileId: string): void {
    this.files.update(files => this.removeFileFromTree(files, fileId));
    if (this.selectedFileId() === fileId) {
      const firstFile = this.findFirstFile(this.files());
      this.selectedFileId.set(firstFile?.id || null);
    }
    this.persist();
  }

  renameFile(fileId: string, newName: string): void {
    if (!newName || !newName.trim()) return;
    this.files.update(files => this.updateFileNameInTree(files, fileId, newName.trim()));
    // if renamed file is currently selected, persist selection (name change already in tree)
    this.persist();
  }

  /**
   * Returns true if another sibling (in the same parent) already has the given name (case-insensitive).
   */
  isDuplicateName(fileId: string, candidateName: string): boolean {
    candidateName = candidateName.trim().toLowerCase();
    const parentId = this.findParentId(this.files(), fileId);
    const siblings = parentId ? this.findChildrenOf(this.files(), parentId) : this.files();
    return siblings.some(f => f.id !== fileId && f.name.trim().toLowerCase() === candidateName);
  }

  private findParentId(files: FileNode[], childId: string, parentId?: string): string | null {
    for (const f of files) {
      if (f.id === childId) return parentId ?? null;
      if (f.children) {
        const res = this.findParentId(f.children, childId, f.id);
        if (res !== null) return res;
      }
    }
    return null;
  }

  private findChildrenOf(files: FileNode[], parentId: string): FileNode[] {
    for (const f of files) {
      if (f.id === parentId) return f.children ?? [];
      if (f.children) {
        const res = this.findChildrenOf(f.children, parentId);
        if (res.length) return res;
      }
    }
    return [];
  }

  private persist() {
    try {
      const state = {
        files: this.files(),
        selectedFileId: this.selectedFileId(),
        language: this.currentLanguage(),
        nextId: this.nextId,
      };
      localStorage.setItem('fileSystemState', JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }

  private findFileById(files: FileNode[], id: string): FileNode | null {
    for (const file of files) {
      if (file.id === id) return file;
      if (file.children) {
        const found = this.findFileById(file.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private updateFileInTree(files: FileNode[], id: string, content: string): FileNode[] {
    return files.map(file => {
      if (file.id === id) {
        return { ...file, content };
      }
      if (file.children) {
        return { ...file, children: this.updateFileInTree(file.children, id, content) };
      }
      return file;
    });
  }

  private addFileToFolder(files: FileNode[], parentId: string, newFile: FileNode): FileNode[] {
    return files.map(file => {
      if (file.id === parentId && file.type === 'folder') {
        return {
          ...file,
          children: [...(file.children || []), newFile]
        };
      }
      if (file.children) {
        return {
          ...file,
          children: this.addFileToFolder(file.children, parentId, newFile)
        };
      }
      return file;
    });
  }

  private removeFileFromTree(files: FileNode[], id: string): FileNode[] {
    return files
      .filter(file => file.id !== id)
      .map(file => {
        if (file.children) {
          return { ...file, children: this.removeFileFromTree(file.children, id) };
        }
        return file;
      });
  }

  private updateFileNameInTree(files: FileNode[], id: string, newName: string): FileNode[] {
    return files.map(file => {
      if (file.id === id) {
        return { ...file, name: newName };
      }
      if (file.children) {
        return { ...file, children: this.updateFileNameInTree(file.children, id, newName) };
      }
      return file;
    });
  }

  private findFirstFile(files: FileNode[]): FileNode | null {
    for (const file of files) {
      if (file.type === 'file') return file;
      if (file.children) {
        const found = this.findFirstFile(file.children);
        if (found) return found;
      }
    }
    return null;
  }
}

