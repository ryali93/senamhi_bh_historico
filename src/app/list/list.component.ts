import { Component, OnInit, Input } from '@angular/core';
import { AppComponent } from '../app.component';
import { nls } from './nls';
declare let L:any;

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
    @Input() dataListLayer:any;
    public nls = nls;

    constructor(private draggableWidget: AppComponent) { }

    ngOnInit(): void {
        this.draggableWidget.draggableWidget('Widget_ListLayer','enable');
        this.widgetChangeContent('#Widget_ListLayer','ListaCapas', this.dataListLayer);
        this.changeListLayer('#Widget_ListLayer');
    }

    widgetChangeContent(domElement:any, typeContent:any, itemLayer:any) {
        try {
            let resultItems = [], groupList = [];
            const nodeBasemap = document.querySelectorAll(`${domElement} .widget-content`);
            /* Se recorre para tener una lista unica de GRUPOS de la lista de capas */
            for (const lyr of itemLayer) {
                if(lyr.widget == typeContent) {
                    /* Valida si existe dentro de la colección */
                    if(String(groupList.indexOf(lyr.group.name)) == "-1") {
                        groupList.push(lyr.group.name);
                    }
                }
            }
            /* Agrupando las capas */
            let lengthGroup = groupList.length, checkedActive = '';
            for (let i = 0; i < lengthGroup; i++) {
                resultItems.push("<div class='menu-arbol'>");
                    resultItems.push("<ul class='nivel-01'>");
                        resultItems.push("<li>");
                            resultItems.push("<input type='checkbox' class='mostrar-menu' id='menu0" + i + "'>");
                            resultItems.push("<label for='menu0" + i + "' class='ampliar'></label>");
                            resultItems.push("<input type='checkbox' id='nivel0" + i + "' class='checkboxNivel'>&nbsp;");
                            resultItems.push("<p>" + groupList[i] + "</p>");
                            /*resultItems.push("<img src=\"./images/configuracion-35.png\" class=\"configuracion-layer\">");*/
                            resultItems.push("<hr style='margin:5px 0 5px 23px'>");
                            resultItems.push("<ul class='nivel-02'>");
                let lengthSubgroup = itemLayer.length;
                for (let j = 0; j < lengthSubgroup; j++) {
                    if(itemLayer[j].group.name == groupList[i]) {
                                resultItems.push("<li>");
                                    if(itemLayer[j].hasOwnProperty('active')) {
                                        checkedActive = 'checked';
                                        setTimeout( 
                                            function(){ 
                                                let elementId = document.getElementById("nivel0" + i) as HTMLInputElement;
                                                if(typeof(elementId) != 'undefined' && elementId != null) {
                                                    elementId.checked = true;
                                                }
                                            },3000
                                        );
                                    } else {
                                        checkedActive = '';
                                    }
                                    /* Valida si existe la propiedad 'active' - itemLayer[j].hasOwnProperty('active') */
                                    resultItems.push(`<input type='checkbox' class='mostrar-menu' id='menu0${i}${j}'>
                                                    <label for='menu0${i}${j}' class='ampliar'></label>
                                                    <input id='Layer${itemLayer[j].id}' type='checkbox' 
                                                        class='checkboxLayer' data-nivel='nivel0${i}'
                                                        name='${itemLayer[j].id}' ${checkedActive}> 
                                                    <label for='Layer${itemLayer[j].id}' 
                                                        class='nameLayer'>${itemLayer[j].name}</label>
                                                    <ul class='nivel-03'>
                                                        <li>
                                                            <img alt='Simbología de la capa' 
                                                                src='${itemLayer[j].layer._url}?REQUEST=GetLegendGraphic
                                                                &VERSION=1.1.0
                                                                &FORMAT=image/png
                                                                &WIDTH=23&HEIGHT=23
                                                                &LAYER=usa:${itemLayer[j].layer.wmsParams.layers}'/>
                                                        </li>
                                                    </ul>`);
                                resultItems.push("</li>");
                        resultItems.push("<hr style='margin:5px 0px 3px 23px'>");
                    }
                }
                            resultItems.push("</ul>");
                        resultItems.push("</li>");
                    resultItems.push("</ul>");
                resultItems.push("</div>");
            }
            nodeBasemap[0].innerHTML = resultItems.join("");
        } catch(error) { 
        console.error(`ERROR: fnListLayer => ${error.name} - ${error.message}.`);
        }
    };
    
    changeListLayer(idElement:any) {
        try {
            /* DOM - Checkbox (input LAYER) */
            const nodeCheckboxLayer:any = document.querySelectorAll(`${idElement} .widget-content .checkboxLayer`);
            for (let i = 0; i<nodeCheckboxLayer.length; i++) {
                nodeCheckboxLayer[i].addEventListener('click', function() {
                    /* Válida si exite la propiedad NAME */
                    let idNode = nodeCheckboxLayer[i].getAttribute("name");
                    if(idNode) {
                        let isCheckedLayer = document.getElementById(nodeCheckboxLayer[i].dataset.nivel) as HTMLInputElement;
                        if(isCheckedLayer.checked) {
                            const nodeIdClick = document.getElementById(idNode) as HTMLInputElement;
                            nodeIdClick.click();
                        }
                    } else { console.error("No existe la capa"); }
                });
            }
            
            /* DOM - Checkbox (input NIVEL) */
            const nodeCheckboxNivel = document.querySelectorAll(`${idElement} .widget-content .checkboxNivel`);
            for (let i = 0; i<nodeCheckboxNivel.length; i++) {
                nodeCheckboxNivel[i].addEventListener('change', function() {
                    /*console.log(nodeCheckboxNivel[i].childNodes);*/
                    /* ACTIVA y DESACTIVA todas las capas */
                    for (let i = 0; i<nodeCheckboxLayer.length; i++) {
                        if(nodeCheckboxLayer[i].checked) {
                            //console.log(nodeCheckboxLayer[i]);
                            /*console.log(nodeCheckboxLayer[i].parentNode);*/
                            const nodeIdLayer = document.getElementById(nodeCheckboxLayer[i].name) as HTMLInputElement;
                            nodeIdLayer.click();
                        }
                    }                    
                });
            }
        } catch(error) { 
            console.error(`ERROR: changeListLayer => ${error.name} - ${error.message}`);
        }
    };
}