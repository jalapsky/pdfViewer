import React from "react";
import {PdfViewer} from "./Viewer";
import * as pdfjsLib from "pdfjs-dist";
import printJS from "print-js";
import {PDFViewerMainClassPropsTypes, PDFViewerMainClassStateTypes} from "./types/PDFViewerTypes";
import {DownloadIcon, PrintIcon} from "./Icons/DownloadIcon";
import './App.css';

//@ts-ignore
export default class App extends React.Component<PDFViewerMainClassPropsTypes, PDFViewerMainClassStateTypes> {
    //Создаем приватное поле класса, для div'a в котором отрисовывается pdf документ
    private mainDiv: React.RefObject<any>;

    constructor(props) {
        super(props);
        this.state = {
            numPages: 0, //Количество страниц. По-умолчанию 0
            numPagesArr: [1], //Поле с количеством страниц. Используется в цикле отрисовки страниц
            scale: 1.5, //Масшатбирование документа. По-умолчанию 1.5
            pdf: null, //Поля для pdf документа
            visibleMenu: false, //Поле для будущего меню, которое будет выезжать как Drawer в AntD
            isRender: false, //Поле для отрисовки компонента
            isLoadingError: false,
        }

        this.mainDiv = React.createRef<HTMLDivElement>(); //Инициализируем поле. Ставим для него React.Ref ссылку.


        //Воркер для корректной работы PDFViewer **Необходимо будет перенести в локальный репозиторий**
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.js`;
    }


    componentDidMount() {
        //Получаем cMapUrl для корректной работы PDFViewer
        const cMapUrl = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps`
        const self = this;

        //Получаем pdf документ
        const loadingTask = pdfjsLib.getDocument({url: this.props.link, cMapUrl: cMapUrl, cMapPacked: true})
        loadingTask.promise
            .then(loadedPdf => {
                //Создаем массив с коллекцией страниц,
                //Используется для отрисовки в JSX методом map
                let numPagesArr:Array<number> = [];

                //Пробегаемся циклом и заполняем массив numPagesArr номерами страниц
                for(let i = 1; i <= loadedPdf.numPages; i++){
                    numPagesArr.push(i)
                }

                //Заполняем state текущими значениями, где:
                //pdf - документа
                //numPages - количество страниц
                //numPagesArr - массив с коллекцией страниц
                //@ts-ignore
                this.setState({pdf: loadedPdf, numPages: loadedPdf.numPages, numPagesArr: numPagesArr}, () => {
                    //После того как все значения улетели в state, (Асинхронно), вешаем прослушку  колеса мыши
                    //на div в котором будет отрисовываться документа и вызываем метод onWheelEvent
                    this.mainDiv.current?.addEventListener('wheel', (event) => {
                        this.onWheelEvent(event)
                    })
                })
            }, function (reason) {
                self.setState({isLoadingError: true})
                console.error(reason);
            });
        loadingTask.promise.catch(error => {
            self.setState({isLoadingError: true})
            console.log(error)
        })
    }



    onWheelEvent = (event:WheelEvent) => {
        if(event.ctrlKey){
            event.preventDefault();
            if(event.deltaY < 0){
                this.increaseScale();
            } else {
                this.reduceScale();
            }
        }
    }


    increaseScale = () => {
        //@ts-ignore
        this.setState((state, props) => {
            if(state.scale + 0.2 >= 3){
                return {scale: state.scale}
            }
            return {scale: state.scale + 0.2}
        })
    }

    reduceScale = () => {
        //@ts-ignore
        this.setState((state, props) => {
            if(state.scale - 0.2 <= 0){
                return {scale: state.scale}
            }
            return {scale: state.scale - 0.2}
        }, () => {
            this.render();
        })
    }


    printDocument = async () => {
        //@ts-ignore
        const data = await this.state.pdf!.getData();
        const blob = new Blob([data], {type: 'application/pdf'});
        printJS(URL.createObjectURL(blob))
    }

    downloadDocument = () => {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': `${localStorage.getItem('token')}`
            }
        };

        //@ts-ignore
        fetch(this.props.link, requestOptions)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                //@ts-ignore
                a.download = this.props.link.replace(`${process.env.REACT_APP_BACK_HOST}/media/pdf/`, '');
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.log('error', error));
    }



    render() {
        const {pdf, scale, isRender, isLoadingError} = this.state;

        if(!pdf && !isLoadingError){
            return (
                <div className="example">
                    Загрузка...
                </div>
            )
        } else if(!pdf && isLoadingError){
            return (
                <div>
                    Произошла проблема при загрузке документа. Пожалуйста сообщите нам об этом
                </div>
            )
        } else {
            return(
                <div>
                    <div className="pdfViewerTools" style={{position: 'fixed'}}>
                        {/*<button*/}
                        {/*    shape="circle"*/}
                        {/*    icon={<ZoomInOutlined/>}*/}
                        {/*    onClick={() => this.increaseScale()}*/}
                        {/*/>*/}
                        {/*<button*/}
                        {/*    shape="circle"*/}
                        {/*    icon={<ZoomOutOutlined/>}*/}
                        {/*    onClick={() => this.reduceScale()}*/}
                        {/*/>*/}
                        <button
                            // shape="circle"
                            // icon={<PrintIcon/>}
                            onClick={() => this.printDocument()}
                        >
                            Печать
                            <PrintIcon />
                        </button>
                        <button
                            // shape="circle"
                            // icon={<DownloadIcon/>}
                            onClick={() => this.downloadDocument()}
                        >
                            Скачать
                            <DownloadIcon />
                        </button>
                        <div>
                            {Math.round(scale * 33)}%/100%
                        </div>
                    </div>
                    {!isRender &&
                    <div ref={this.mainDiv} style={{minHeight: '100vh'}}>
                        {this.state.numPagesArr.map((i) => (
                            <div style={{marginBottom: 20}}>
                                <PdfViewer
                                    key={i}
                                    page={i}
                                    pdf={this.state.pdf}
                                    scale={scale}
                                />
                            </div>
                        ))}
                    </div>
                    }
                </div>

            )
        }

    }
}
