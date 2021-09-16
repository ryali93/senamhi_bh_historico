import { Component, OnInit } from '@angular/core';
import { nls } from './nls';
//import { RestService } from './rest.service';
declare let L:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'visor-senamhi';
  //public listWidget:Array<any> = [];
  public listWidget:any = [];
  public nls = nls;
  public imageMinam = nls.img.minam;
  public content:string = nls.modal.content;
  //private RestService:RestService
  
  constructor() {
  }

  ngOnInit():void { /*this.loadData();*/ }
  /* public loadData() {
    this.RestService.get('http://localhost:3000/posts').subscribe(
      response => {
        console.log(response);
        this.listWidget = response;
      }
    );
  } */
  draggableWidget(nameId:any, active:any) {
    try {
      const elementId = document.getElementById(nameId)
      const draggableWidget = new L.Draggable(elementId);
      if(active == 'enable'){
        draggableWidget.enable();
        draggableWidget.addEventListener('down', (event:any) => {
          (window as any).initialize_zIndex = (parseInt((window as any).initialize_zIndex) + 1);
          let idStyle = document.getElementById(event.target._element.id)!.style;
          idStyle.zIndex = String((window as any).initialize_zIndex);
        });
        draggableWidget.addEventListener('dragstart', function() {});
        draggableWidget.addEventListener('dragend', function() {});
      } else {
        //draggableWidget.disable();
        //delete draggableWidget;
      }
    } catch(error) { 
      console.error(`Error: draggableWidget => ${error.name} - ${error.message}.`);
    }
  }
}