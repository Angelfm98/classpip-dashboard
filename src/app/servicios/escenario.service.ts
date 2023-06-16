import { Injectable, Component, Input, Output, EventEmitter } from '@angular/core';
import { Localizacion } from '../clases/Localizacion';

@Injectable()
export class EscenarioService {
localizacion = {} as Localizacion;
@Output() fire: EventEmitter<any> = new EventEmitter();

  constructor() {
   }

   async changeCoords(lat: number, lon: number) {
    this.localizacion.localizacionLat = lat;
    this.localizacion.localizacionLon = lon;
    this.fire.emit(this.localizacion);
   }
}
