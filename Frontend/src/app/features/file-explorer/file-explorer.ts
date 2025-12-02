import { Component, inject, computed, signal, OnInit, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FileSystemService } from '../../core/services/file-system.service';
import { FileNode } from '../../core/models/file.model';

@Component({
  selector: 'app-file-explorer',
  imports: [CommonModule, Tree, ContextMenu, Dialog, InputText, FormsModule, ButtonModule, TooltipModule],
  templateUrl: './file-explorer.html',
  styleUrl: './file-explorer.css'
})
export class FileExplorer implements OnInit {
  private fileSystemService = inject(FileSystemService);

  files = computed(() => this.convertToTreeNodes(this.fileSystemService.filesTree()));
  selectedNode = signal<TreeNode | null>(null);
  showNewFileDialog = signal(false)
  showNewFolderDialog = signal(false)
  showNestedFolderDialog = signal(false)
  showMessageMainFile = signal(false)
  showRenameDialog = signal(false)
  showDeleteDialog = signal(false)
  newItemName = signal('');
  renameNewName = signal('');
  renameError = signal('');
  contextMenuItems: MenuItem[] = [];

  // two-way binding wrappers for PrimeNG dialogs (signals can't be used directly with [(visible)])
  get visibleRename(): boolean { return this.showRenameDialog(); }
  set visibleRename(v: boolean) { this.showRenameDialog.set(v); if (!v) this.renameError.set(''); }

  get visibleDelete(): boolean { return this.showDeleteDialog(); }
  set visibleDelete(v: boolean) { this.showDeleteDialog.set(v); }


  

  constructor() {
    this.initContextMenu();
    this.selectedNode.set
    
    effect(() => {
      const selectedFile = this.fileSystemService.selectedFile()
      const treeNode = untracked(() => this.files().find(( tn : TreeNode ) => tn.key === selectedFile?.id))
      if(treeNode) {
        this.selectedNode.set(treeNode)
      }   
    })
    
    effect(() => {
      if (this.showRenameDialog() || this.showDeleteDialog()) {
        const handler = (ev: KeyboardEvent) => {
          const active = document.activeElement as HTMLElement | null;
          const isEditor = !!(active && (active.tagName === 'TEXTAREA' || active.classList.contains('monaco-editor') || active.closest('.monaco-editor')));
          const isInsideDialog = !!(active && active.closest && active.closest('.p-dialog'));

          // If focus is in the editor, don't intercept Enter/Escape so normal editing works
          if (isEditor && ev.key === 'Enter') {
            return;
          }

          // If focus is inside the dialog, handle Enter/Escape here
          if (isInsideDialog) {
            if (ev.key === 'Escape') {
              ev.preventDefault();
              if (this.showRenameDialog()) this.cancelRename();
              if (this.showDeleteDialog()) this.cancelDelete();
            } else if (ev.key === 'Enter') {
              ev.preventDefault();
              if (this.showRenameDialog()) this.confirmRename();
              else if (this.showDeleteDialog()) this.confirmDelete();
            }
            return;
          }

          if (ev.key === 'Escape') {
            if (this.showRenameDialog()) this.cancelRename();
            if (this.showDeleteDialog()) this.cancelDelete();
          } else if (ev.key === 'Enter') {
            if (this.showRenameDialog()) this.confirmRename();
            else if (this.showDeleteDialog()) this.confirmDelete();
          }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
      }
      return undefined;
    });
  }

  private initContextMenu(): void {
    this.contextMenuItems = [
      {
        label: 'Nuevo archivo',
        icon: 'pi pi-file',
        command: () => this.openNewFileDialog()
      },
      {
        label: 'Nueva carpeta',
        icon: 'pi pi-folder',
        command: () => this.openNewFolderDialog()
      },
      {
        label: 'Renombrar',
        icon: 'pi pi-pencil',
        command: () => this.openRenameDialog()
      },
      {
        separator: true
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        command: () => this.openDeleteConfirm()
      }
    ];
  }

  onNodeSelect(event: any): void {
    const node = event.node as TreeNode;
    if (node.type === 'file') {
      this.fileSystemService.selectFile(node.key as string);
    }
  }

  openNewFileDialog(): void {
    this.newItemName.set('');
    this.showNewFileDialog.set(true);
  }

  openNewFolderDialog(): void {
    this.newItemName.set('');
    this.showNewFolderDialog.set(true);
  }

  createNewFile(): void {
    const name = this.newItemName();
    if (name.trim()) {
      const selectedNode = this.selectedNode();
      // removed debug log
      const parentId = selectedNode?.type === 'folder' ? selectedNode.key as string : undefined;
      this.fileSystemService.createFile(name, parentId);
      this.showNewFileDialog.set(false);
    }
  }

  createNewFolder(): void {
    const name = this.newItemName();
    if (name.trim()) {
      const selectedNode = this.selectedNode();
      const parentId = selectedNode?.type === 'folder' ? selectedNode.key as string : undefined;
      
      if(parentId) {
        this.showNestedFolderDialog.set(true)
        this.showNewFolderDialog.set(false)
        return
      }
      this.fileSystemService.createFolder(name, parentId);
      this.showNewFolderDialog.set(false);
    }
  }

  deleteSelectedItem(): void {
    const node = this.selectedNode();
    if(node && node.key === '0') {
      this.showMessageMainFile.set(true)
    } else if (node) {
      this.fileSystemService.deleteFile(node.key as string);
    }
  }

  openRenameDialog(): void {
    const node = this.selectedNode();
    if (!node) return;
    this.renameNewName.set(node.label as string || '');
    this.renameError.set('');
    this.showRenameDialog.set(true);
  }

  confirmRename(): void {
    const node = this.selectedNode();
    if (!node) return;
    const newName = this.renameNewName();
    if (!newName || !newName.trim()) {
      this.renameError.set('El nombre no puede estar vacío');
      return;
    }
    // check for duplicates in same folder
    if (this.fileSystemService.isDuplicateName(node.key as string, newName.trim())) {
      this.renameError.set('Ya existe un archivo o carpeta con ese nombre en la misma carpeta');
      return;
    }
    this.fileSystemService.renameFile(node.key as string, newName.trim());
    this.showRenameDialog.set(false);
  }

  cancelRename(): void {
    this.renameError.set('');
    this.showRenameDialog.set(false);
  }

  openDeleteConfirm(): void {
    const node = this.selectedNode();
    if (!node) return;
    if (node.key === '0') {
      this.showMessageMainFile.set(true);
      return;
    }
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const node = this.selectedNode();
    if (!node) return;
    this.fileSystemService.deleteFile(node.key as string);
    this.showDeleteDialog.set(false);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
  }

  detectLanguageFromName(name?: string): string {
    if (!name) return 'Desconocido';
    const idx = name.lastIndexOf('.');
    const ext = idx >= 0 ? name.slice(idx) : '';
    const mapping: Record<string, string> = {
      '.js': 'JavaScript',
      '.py': 'Python',
      '.cpp': 'C++',
      '.c': 'C'
    };
    if (ext && mapping[ext]) return `${mapping[ext]} (${ext})`;
    return ext ? `Desconocido (${ext})` : 'Sin extensión';
  }

  ngOnInit(): void {
    // set initial selection to persisted selected file
    const initFileId = this.fileSystemService.selectedFile()?.id;
    const initNode = this.files().find((tn: TreeNode) => tn.key === initFileId);
    if (initNode) this.selectedNode.set(initNode);
  }

  private convertToTreeNodes(files: FileNode[]): TreeNode[] {
    return files.map(file => this.fileNodeToTreeNode(file));
  }

  private fileNodeToTreeNode(file: FileNode): TreeNode {
    const node: TreeNode = {
      key: file.id,
      label: file.name,
      type: file.type,
      icon: file.type === 'folder' ? 'pi pi-fw pi-folder' : 'pi pi-fw pi-file',
      data: file
    };

    if (file.children && file.children.length > 0) {
      node.children = file.children.map(child => this.fileNodeToTreeNode(child));
    }

    return node;
  }
  onNodeUnselect(event: any): void {
    setTimeout(() => {
      this.selectedNode.set(event.node)
    }, 0)
  }

  handleConfirmationNestedFolder() {
    this.showNestedFolderDialog.set(false)
  }

  handleConfirmationMainFile() {
    this.showMessageMainFile.set(false)
  }
}
