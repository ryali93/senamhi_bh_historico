import { EventEmitter, Injectable, Output } from '@angular/core';
/* 
  Es un servicio de puente entre el componente mapa y los widgets.
  1. Primero vamos a Basemap. Importamos el servicio en el constructor
*/
@Injectable({
  providedIn: 'root'
})
export class MapService {
  @Output() disparadorMap: EventEmitter<any> = new EventEmitter()

  /* Resive datos */
  constructor() { }
}
