import { Component, OnInit } from '@angular/core';
import {SesionService, PeticionesAPIService, CalculosService} from '../../../servicios/index';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';



@Component({
  selector: 'app-juego-de-puzzle-seleccionado-activo',
  templateUrl: './juego-de-puzzle-seleccionado-activo.component.html',
  styleUrls: ['./juego-de-puzzle-seleccionado-activo.component.scss']
})
export class JuegoDePuzzleSeleccionadoActivoComponent implements OnInit {

  constructor( private calculos: CalculosService,
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    private location: Location
     ) { }

displayedColumnsAlumnos: string[] = ['posicion', 'nombreAlumno', 'primerApellido', 'segundoApellido', 'puntuacion','tiempo'];

  juegoSeleccionado:any;
  
  idjuego:any;
  alumnosDelJuego:any;
  listaAlumnosOrdenadaPorPuntos:any;
  rankingJuegoDePuntos:any;
  datasourceAlumno:any;

  ngOnInit() {

    this.juegoSeleccionado= this.sesion.DameJuego();
    console.log(this.juegoSeleccionado);

    console.log(this.juegoSeleccionado.id);


    this.DameInfoAlumnosJuegoDePuzzle();

  }

  async DameInfoAlumnosJuegoDePuzzle(){
    
    this.alumnosDelJuego = await this.peticionesAPI.DameInfoAlumnosJuegoDePuzzle(this.juegoSeleccionado.id).toPromise();
    
    
    
    this.DamealumnosjuegoPuzzle();

  }
  
  DamealumnosjuegoPuzzle(){
    this.peticionesAPI.DamealumnosjuegoPuzzle(this.juegoSeleccionado.id).subscribe(alumnos =>{
      console.log(alumnos);
      this.listaAlumnosOrdenadaPorPuntos = alumnos;
      // ordena la lista por puntos
      this.listaAlumnosOrdenadaPorPuntos = this.listaAlumnosOrdenadaPorPuntos.sort(function(obj1, obj2) {
        return obj2.puntuacion - obj1.puntuacion;

      });

      this.TablaClasificacionTotal();

    })

  }

 

  TablaClasificacionTotal(){

    console.log(this.alumnosDelJuego,this.listaAlumnosOrdenadaPorPuntos);

    this.rankingJuegoDePuntos = this.calculos.PrepararTablaRankingIndividualPuzzle(this.listaAlumnosOrdenadaPorPuntos,this.alumnosDelJuego);
      console.log ('Ya tengo la tabla');
      console.log(this.rankingJuegoDePuntos);
      // tslint:disable-next-line:max-line-length
     // this.rankingJuegoDePuntosTotal = this.calculos.DameRanking (this.listaAlumnosOrdenadaPorPuntos, this.alumnosDelJuego, this.nivelesDelJuego);
      this.datasourceAlumno = new MatTableDataSource(this.rankingJuegoDePuntos);

  }


  DesactivarJuego() {
    console.log(this.juegoSeleccionado);
    this.juegoSeleccionado.JuegoActivo = false;
    this.peticionesAPI.CambiaEstadoJuegoDePuzzle(this.juegoSeleccionado)
    .subscribe(res => {
        if (res !== undefined) {
          console.log(res);
          console.log('juego desactivado');
          this.location.back();
        }
    });
  }

  AbrirDialogoConfirmacionDesactivar(): void {

    Swal.fire({
      title: 'Desactivar',
      text: "Estas segura/o de que quieres desactivar: " + this.juegoSeleccionado.Tipo,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {

        this.DesactivarJuego();

        Swal.fire('Desactivado', this.juegoSeleccionado.Tipo + ' desactivado correctamente', 'success');

      }
    })
   }


}
