import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';

// Clases
import { Alumno, Equipo, Juego, AlumnoJuegoDeColeccion, EquipoJuegoDeColeccion } from '../../../clases/index';

// Services

import { SesionService, CalculosService, PeticionesAPIService } from '../../../servicios/index';

// Imports para abrir diálogo y swal
import { MatDialog } from '@angular/material';
import { DialogoConfirmacionComponent } from '../../COMPARTIDO/dialogo-confirmacion/dialogo-confirmacion.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-juego-de-coleccion-seleccionado-inactivo',
  templateUrl: './juego-de-coleccion-seleccionado-inactivo.component.html',
  styleUrls: ['./juego-de-coleccion-seleccionado-inactivo.component.scss']
})
export class JuegoDeColeccionSeleccionadoInactivoComponent implements OnInit {

  // Juego De Puntos seleccionado
  juegoSeleccionado: Juego;

  // Recupera la informacion del juego, los alumnos o los equipos, los puntos y los niveles del juego
  alumnosDelJuego: Alumno[];
  equiposDelJuego: Equipo[];

  // tslint:disable-next-line:no-inferrable-types
  mensaje: string = 'Estás seguro/a de que quieres desactivar el ';

  // tslint:disable-next-line:no-inferrable-types
  mensajeBorrar: string = 'Estás seguro/a de que quieres borrar el ';

  datasourceAlumno;
  datasourceEquipo;

  displayedColumnsAlumnos: string[] = ['nombreAlumno', 'primerApellido', 'segundoApellido', ' '];

  displayedColumnsEquipos: string[] = ['nombreEquipo', 'miembros', ' '];

  alumnosEquipo: Alumno[];

  inscripcionesAlumnos: AlumnoJuegoDeColeccion[];
  inscripcionesEquipos: EquipoJuegoDeColeccion[];

  constructor(
              private sesion: SesionService,
              private peticionesAPI: PeticionesAPIService,
              private calculos: CalculosService,
              public dialog: MatDialog,
              private location: Location) { }

  ngOnInit() {
    this.juegoSeleccionado = this.sesion.DameJuego();
    console.log(this.juegoSeleccionado);

    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.AlumnosDelJuego();
    } else {
      this.EquiposDelJuego();
    }
  }

  applyFilter(filterValue: string) {
    this.datasourceAlumno.filter = filterValue.trim().toLowerCase();
  }

  applyFilterEquipo(filterValue: string) {
    this.datasourceEquipo.filter = filterValue.trim().toLowerCase();
  }

  // Recupera los alumnos que pertenecen al juego
  AlumnosDelJuego() {
    this.peticionesAPI. DameAlumnosJuegoDeColeccion(this.juegoSeleccionado.id)
    .subscribe(alumnosJuego => {
      console.log(alumnosJuego);
      this.alumnosDelJuego = alumnosJuego;
      this.RecuperarInscripcionesAlumnoJuego();
      this.ColeccionDelJuego();
      this.sesion.TomaAlumnosDelJuego (this.alumnosDelJuego);
      this.datasourceAlumno = new MatTableDataSource(this.alumnosDelJuego);
    });
  }

  // Recupera las inscripciones de los alumnos en el juego y los puntos que tienen y los ordena de mayor a menor valor
  RecuperarInscripcionesAlumnoJuego() {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeColeccion(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.inscripcionesAlumnos = inscripciones;
      console.log(this.inscripcionesAlumnos);
    });
  }

  // Recupera los equipos que pertenecen al juego
  EquiposDelJuego() {
    this.peticionesAPI.DameEquiposJuegoDeColeccion(this.juegoSeleccionado.id)
    .subscribe(equiposJuego => {
      this.equiposDelJuego = equiposJuego;
      console.log(equiposJuego);
      this.RecuperarInscripcionesEquiposJuego();
      this.ColeccionDelJuego();
      this.sesion.TomaEquiposDelJuego (this.equiposDelJuego);
    });
  }


    // Recupera las inscripciones de los alumnos en el juego y los puntos que tienen y los ordena de mayor a menor valor
  RecuperarInscripcionesEquiposJuego() {

    this.peticionesAPI.DameInscripcionesEquipoJuegoDeColeccion(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.inscripcionesEquipos = inscripciones;
      console.log(this.inscripcionesEquipos);
      this.datasourceEquipo = new MatTableDataSource(this.equiposDelJuego);
    });
  }


  AlumnosDelEquipo(equipo: Equipo) {
    console.log(equipo);

    this.peticionesAPI.DameAlumnosEquipo(equipo.id)
    .subscribe(res => {
      if (res[0] !== undefined) {
        this.alumnosEquipo = res;
        console.log(res);
      } else {
        // Mensaje al usuario
        console.log('No hay alumnos en este equipo');
        this.alumnosEquipo = undefined;
      }
    });
  }


  AccederAlumno(alumno: Alumno) {

    this.sesion.TomaAlumno (alumno);
    this.sesion.TomaInscripcionAlumno (this.inscripcionesAlumnos.filter(res => res.alumnoId === alumno.id)[0]);


  }


  AccederEquipo(equipo: Equipo) {
    this.sesion.TomaEquipo(equipo);
    this.sesion.TomaInscripcionEquipo(this.inscripcionesEquipos.filter(res => res.equipoId === equipo.id)[0]);

  }


  ColeccionDelJuego() {
    this.peticionesAPI.DameColeccion(this.juegoSeleccionado.coleccionId)
    .subscribe(coleccion => {
      console.log('voy a enviar la coleccion');
      this.sesion.TomaColeccion(coleccion);
    });
  }

  ReactivarJuego() {
    console.log(this.juegoSeleccionado);
    this.peticionesAPI.CambiaEstadoJuegoDeColeccion(new Juego (this.juegoSeleccionado.Tipo, this.juegoSeleccionado.Modo,
      undefined, true, this.juegoSeleccionado.NumeroTotalJornadas, this.juegoSeleccionado.TipoJuegoCompeticion,
      this.juegoSeleccionado.NumeroParticipantesPuntuan, this.juegoSeleccionado.Puntos, this.juegoSeleccionado.NombreJuego),
      this.juegoSeleccionado.id, this.juegoSeleccionado.grupoId).subscribe(res => {
        if (res !== undefined) {
          console.log(res);
          console.log('juego reactivado');
          this.location.back();
        }
      });
  }

  AbrirDialogoConfirmacionReactivar(): void {

    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      height: '150px',
      data: {
        mensaje: this.mensaje,
        nombre: this.juegoSeleccionado.Tipo,
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.ReactivarJuego();
        Swal.fire('Reactivado', this.juegoSeleccionado.Tipo + ' reactivado correctamente', 'success');
      }
    });
  }

  EliminarJuego() {
    this.peticionesAPI.BorraJuegoDeColeccion(this.juegoSeleccionado.id)
    .subscribe(res => {
      console.log('Juego eliminado');
      this.location.back();
    });
  }

  AbrirDialogoConfirmacionEliminar(): void {

    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      height: '150px',
      data: {
        mensaje: this.mensajeBorrar,
        nombre: this.juegoSeleccionado.Tipo,
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.EliminarJuego();
        Swal.fire('Eliminado', this.juegoSeleccionado.Tipo + ' eliminado correctamente', 'success');
      }
    });
  }
  goBack() {
    this.location.back();
  }


}
