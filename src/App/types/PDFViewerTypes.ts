import * as pdfjsLib from "pdfjs-dist";


export declare type PDFViewerMainClassPropsTypes = {
    link: string
}

export declare type PDFViewerMainClassStateTypes = {
    numPages: number,
    numPagesArr: Array<number>,
    scale: number,
    pdf?: pdfjsLib.PDFDocumentProxy | null,
    visibleMenu: boolean,
    isRender: boolean,
    isLoadingError: boolean,
}

export declare type PDFViewerProps = {
    pdf?: pdfjsLib.PDFDocumentProxy | null,
    page: number,
    scale: number,
}
