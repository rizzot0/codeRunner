import { AfterViewInit, Component, computed, effect, ElementRef, signal, untracked, ViewChild } from "@angular/core";
import { FileSystemService } from "../../core/services/file-system.service";
import { FileNode } from "../../core/models/file.model";


@Component({
    selector: 'app-tab-editor',
    templateUrl: './tab-editor.html',
    styleUrl: './tab-editor.css'
})
export class TabEditor implements AfterViewInit {
    constructor(public fileService :  FileSystemService) {
        effect(() => {
            const lang = this.fileService.language()
            const mainFile = untracked(() => this.fileService.getFileById('0'));

            if (!mainFile) return;

            this.tabsElement.set([mainFile])
            this.selectedTab.set(mainFile.id)
        })

        effect(() => {
            const fileSelected = this.fileService.selectedFile()
            if(fileSelected) {
                const existInTabs = this.tabsElement().find(( file : FileNode ) => file.id === fileSelected?.id)
                if(!existInTabs) {
                    this.tabsElement.update(prev => [...prev, fileSelected])
                }
                this.selectedTab.set(fileSelected.id)
            }
        })

        // keep tabs in sync with file system: remove tabs when files are deleted
        effect(() => {
            // run whenever filesTree changes
            const files = this.fileService.filesTree();
            // check each tab: if its id no longer exists in file system, remove it
            const existingTabs = this.tabsElement();
            const filtered = existingTabs.filter(t => !!this.fileService.getFileById(t.id));
            if (filtered.length !== existingTabs.length) {
                // if the selected tab was removed, select the first remaining tab (if any)
                const sel = this.selectedTab();
                const stillSelected = filtered.find(f => f.id === sel);
                if (!stillSelected && filtered.length > 0) {
                    const newSel = filtered[0].id;
                    this.tabsElement.set(filtered);
                    this.selectedTab.set(newSel);
                    this.fileService.selectFile(newSel);
                } else {
                    this.tabsElement.set(filtered);
                }
            }
        })
    }
    

    hasOneTab = computed(() => this.tabsElement().length === 1)
    tabsElement = signal<FileNode[]>([])
    selectedTab = signal<string>('')
    @ViewChild('tabContainer') tabContainer!: ElementRef<HTMLDivElement>

    ngAfterViewInit(): void {
        const el = this.tabContainer.nativeElement

        el.addEventListener('wheel', (e) => {
            e.preventDefault()
            el.scrollLeft += e.deltaY * 0.3
        })
    }

    onCloseTab(e : PointerEvent, tabId : string) {
        e.stopPropagation()
        if(this.tabsElement().length === 1) return 

        const newTabs = this.tabsElement().filter(( item ) => item.id !== tabId)

        if(tabId === this.selectedTab()) {
            this.handleSelectTab(newTabs[0].id)
        }
        this.tabsElement.set(newTabs)
    }

    handleSelectTab( tabId : string) {  
        this.fileService.selectFile(tabId)
    }
    

}