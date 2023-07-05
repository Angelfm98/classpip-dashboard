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
  private selection: L.marker;
  private first : boolean = true;
  private icon = L.icon({
    iconUrl: '/assets/map_marker.svg',
    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 55], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76]
  })

  constructor(
    public dialog: MatDialog,
    public location: Location,
    private peticionesAPI: PeticionesAPIService,
    public dialogRef: MatDialogRef<MapPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      console.log(data);
    }
  ngAfterViewInit(): void {
    this.initMap();
    this.selectLocation();


  }

  onNoClick() {
    console.log("los datos a enviar són: "+this.data)
    this.dialogRef.close({event: 'Update', data: this.data});
  }
  private initMap(): void {
    this.map = L.map('map', {
      center: [ 41.2758, 1.9882 ],
      zoom: 15
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
    
  }

  private selectLocation() {

    this.map.on('click', (e: { latlng: any; }) => {
      if (this.first == true) {
        var coord = e.latlng;
        console.log("Click en "+coord.lat+" y "+coord.lng);
        this.selection = new L.Marker([coord.lat, coord.lng], {icon: this.icon}).addTo(this.map);
        if (coord.lat <0) {
          this.data[0] = -Math.abs(coord.lat).toFixed(4);
        }
        else { this.data[0] = coord.lat.toFixed(4); }
        if (coord.lng <0) {
          this.data[1] = - Math.abs(coord.lng).toFixed(4);
        }
        else { this.data[1] = coord.lng.toFixed(4); }
        this.first = false;
      }
      else {
        var coord = e.latlng;
        this.selection.setLatLng(e.latlng);
        this.data[0]= coord.lat.toFixed(4);
        this.data[1]= coord.lng.toFixed(4);
      }

    });
}
}
