import { Injectable } from "@angular/core";
import { FileNode } from "../models/file.model";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root'})
export class ProjectDownloadService {


    async downloadAsZip(directory : FileNode[], zipName : string) {
        const zip = new JSZip()
        this.addTreeNode(zip, directory)
        const blob = await zip.generateAsync({ type : 'blob' })
        saveAs(blob, zipName + ".zip")
    }

    private addTreeNode(zip: JSZip, tree : FileNode[], parent ?: JSZip) {
        const folder = parent ?? zip
        tree.forEach(( node : FileNode) => {
            if(node.type === "folder" && node.children) {
                const sub = folder.folder(node.name as string)
                this.addTreeNode(zip, node.children, sub!)
            } else {
                folder.file(node.name as string, node.content ?? '')
            }
        })
    }

}