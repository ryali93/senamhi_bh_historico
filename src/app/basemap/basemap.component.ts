import { Component, OnInit, Input } from '@angular/core';
import { MapService } from '../map.service';
import { AppComponent } from '../app.component';
import { RestService } from '../rest.service';
import { nls } from './nls';
declare let L:any;

@Component({
  selector: 'app-basemap',
  templateUrl: './basemap.component.html',
  styleUrls: ['./basemap.component.scss']
})
export class BasemapComponent implements OnInit {
  @Input() dataEntrante:any;
  @Input() dataListLayer:any;
  public baseMap:any;
  public nls = nls;
  /* Basemap tiene acceso a los metodos publicos del servicio de MapService */
  constructor(
    private map: MapService, 
    private draggableWidget: AppComponent, 
    private RestService:RestService
  ) { }

  ngOnInit(): void {
    //console.log('Entrando data:', this.dataEntrante);
    this.draggableWidget.draggableWidget('Widget_BaseMap','enable');
    this.listContentHTML('#Widget_BaseMap','Basemap', this.dataListLayer);
    this.onchangeBasemap('#Widget_BaseMap');
    //this.loadData();
  }

  /* public loadData() {
    this.RestService.get('http://localhost:3000/posts').subscribe(
      response => {
        console.log(response);
        //this.listWidget = response;
      }
    );
  } */

  onClickWidget() {
    console.log("LE DIO UN CLIC");
    //console.log(this.dataEntrante);
    /*this.map.disparadorMap.emit({
      data: this.dataEntrante
    });
    */
  };

  listContentHTML(domElement:any, typeContent:any, itemLayer:any) {
    try {
      let resultItems = [];
      const nodeBasemap = document.querySelectorAll(`${domElement} .widget-content`);      
      for (const lyr of itemLayer) {
        if(lyr.group.name == typeContent) {
          let img = lyr.img ? lyr.img : 'https://bulma.io/images/placeholders/96x96.png' 
          if(lyr.active) {
            resultItems.push(`\
              <figure name='${lyr.id}' data-type='${lyr.group.name}'>\
                <img src='${img}' style='border: 2px solid #3d7e9a;'>\
                <figcaption style='color: #3d7e9a'>${lyr.name}</figcaption>\
              </figure>`
            );
          } else {
            resultItems.push(`\
              <figure name='${lyr.id}' data-type='${lyr.group.name}'>\
                <img src='${img}'>\
                <figcaption>${lyr.name}</figcaption>\
              </figure>`
            );
          }
        }
      }
      nodeBasemap[0].innerHTML = resultItems.join("");
    } catch(error) { 
      console.error(`ERROR: listContentHTML => ${error.name} - ${error.message}.`); 
    }
  };

  clearBasemap(item:any) {
    try {
      for(let i = 0; i<item.length; i++) {
        item[i].childNodes[1].style["border"] = "2px solid white";
        item[i].childNodes[3].style["color"] = "#333333";
      }
    } catch(error) { 
      console.error(`ERROR: clearBasemap => ${error.name} - ${error.message}.`);
    }
  };

  onchangeBasemap(idElement:any) {
    try {
      const nodeBasemap:any = document.querySelectorAll(`${idElement} .widget-content figure`);
      for (let i = 0; i < nodeBasemap.length; i++) {
        nodeBasemap[i].addEventListener('click', (event:any) => {
          event.preventDefault()
          //L.DomEvent.stopPropagation(event);          
          let idNode = nodeBasemap[i].getAttribute('name')!;
          let nodeId  = document.getElementById(idNode) as HTMLInputElement;
          if(nodeId.checked) {
            if(nodeBasemap[i].getAttribute('data-type') == 'Ortofoto') {
              nodeBasemap[i].childNodes[1].style["border"] = "2px solid white";
              nodeBasemap[i].childNodes[3].style["color"] = "#333333";
              document.getElementById(idNode)!.click();
            } 
          } else {
            this.clearBasemap(nodeBasemap);
            if(nodeBasemap[i].getAttribute('data-type') == 'Ortofoto') {
              for (let i=0; i< nodeBasemap.length; i++) {
                let idName = nodeBasemap[i].getAttribute('name')!;
                let isChecked = document.getElementById(idName) as HTMLInputElement;
                if(isChecked.checked)
                  document.getElementById(idName)!.click();
              }
            };
            nodeBasemap[i].childNodes[1].style["border"] = "2px solid #3d7e9a";
            nodeBasemap[i].childNodes[3].style["color"] = "#3d7e9a";
            document.getElementById(idNode)!.click();  
          }  
        }, false);
      }
    } catch(error) { 
      console.error(`ERROR: onchangeBasemap => ${error.name} - ${error.message}`);
    }
  };
}