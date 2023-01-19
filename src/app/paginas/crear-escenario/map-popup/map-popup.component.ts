import { AfterViewInit, Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PeticionesAPIService } from 'src/app/servicios';
import { CrearEscenarioComponent } from '../crear-escenario.component';
import { Location } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-popup',
  templateUrl: './map-popup.component.html',
  styleUrls: ['./map-popup.component.scss']
})
export class MapPopupComponent implements AfterViewInit {

  private map:any;
  private selection: any;

  constructor(
    public dialog: MatDialog,
    public location: Location,
    private peticionesAPI: PeticionesAPIService,
    public dialogRef: MatDialogRef<MapPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  ngAfterViewInit(): void {
    this.initMap();
  }

  onNoClick() {
    this.dialogRef.close();
  }
  private initMap(): void {
    this.map = L.map('map', {
      center: [ 39.8282, -98.5795 ],
      zoom: 3
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

}
