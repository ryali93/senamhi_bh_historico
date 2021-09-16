import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  @Output() disparadorSidebar: EventEmitter<any> = new EventEmitter()

  constructor() { }
}
