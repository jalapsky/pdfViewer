import React, {useEffect} from 'react';
import {PDFViewerProps} from "./types/PDFViewerTypes";
import {PageViewport, PDFDocumentProxy, PDFPageProxy} from 'pdfjs-dist';

export const PdfViewer:React.FunctionComponent<PDFViewerProps> = ({pdf, page, scale}) => {
    useEffect(() => {
        renderPage(page, pdf!, scale);
    }, [page, scale]);

    const onMouseMove = (canvas: HTMLCanvasElement, event: MouseEvent) => {
        if(event.buttons === 1){
            canvas.style.cursor = 'grabbing'
            const el = document.querySelector('.ant-drawer-body') as HTMLDivElement
            el.scrollLeft += -event.movementX
            el.scrollTop += -event.movementY
        } else {
            canvas.style.cursor = 'default'
        }
    }

    const renderPage = (pageNum: number, pdf: PDFDocumentProxy, scale: number) => {
        const div = document.getElementById(`page-${pageNum}`) as HTMLDivElement;

        const canvasRef = document.createElement('canvas') as HTMLCanvasElement;
        canvasRef.className="shadowDocument"
        canvasRef.style.display = 'none'

        canvasRef.addEventListener('mousemove', (event) => {
            onMouseMove(canvasRef, event)
        })



        pdf && pdf.getPage(pageNum)
            .then(function(page: PDFPageProxy) {

                const viewport = page.getViewport({scale: scale});
                const canvas = canvasRef;
                canvas.width = Math.floor(viewport.width );
                canvas.height = Math.floor(viewport.height);

                const renderContext = {
                    canvasContext: canvas.getContext('2d') as CanvasRenderingContext2D,
                    viewport: viewport as PageViewport
                };





                //@ts-ignore
                if(div.children.length < 2){
                    div.appendChild(canvasRef)

                    let renderTask = page.render(renderContext)

                    renderTask.promise.then(function () {

                        canvasRef.style.display = 'block'
                        if(div.children.length > 1){
                            div.removeChild((document.querySelector(`#page-${pageNum}`) as HTMLDivElement).children[0])
                        }
                    })
                }

            }
        );






    };



    return(
        <div id={`page-${page}`} className="pdfViewer"/>
    );
}
