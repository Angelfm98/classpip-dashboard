import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

// Imports para abrir diálogo mostrar cromos
import { MatDialog } from '@angular/material';

import { Juego, Alumno, Equipo } from 'src/app/clases/index';
// Services

// Services
import { SesionService, PeticionesAPIService } from '../../../servicios/index';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-asignacion-preguntas-juego-puzzle',
  templateUrl: './asignacion-preguntas-juego-puzzle.component.html',
  styleUrls: ['./asignacion-preguntas-juego-puzzle.component.scss']
})
export class AsignacionPreguntasJuegoPuzzleComponent implements OnInit {

  // Para comunicar el nombre de la familia seleccionada a componente padre
  @Output() emisorFamilia = new EventEmitter<any>();
  grupoId: number;
  profesorId: number;

  familias: any[];

  alumnos: Alumno[];

  datasourceFamilias;

  // tslint:disable-next-line:ban-types
  isDisabled: Boolean = true;


  displayedColumns: string[] = ['select', 'titulo', 'pregunta', 'tematica', 'tipo'];
  selection = new SelectionModel<any>(true, []);


  juego: Juego;

  // Para que al hacer click se quede la fila marcada
  selectedRowIndex = -1;

  familiaSeleccionada: any;
  muestroPublicas = false;
  familiasPublicas: any[];

  constructor(
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    public dialog: MatDialog) { }

  ngOnInit() {
    console.log('onInit de ASIGNACION FAMILIA');

    this.profesorId = this.sesion.DameProfesor().id;
    this.grupoId = this.sesion.DameGrupo().id;
    this.alumnos = this.sesion.DameAlumnosGrupo();
    this.TraeListaDePreguntas();
    // this.TraeColeccionesPublicas();
  }

  applyFilter(filterValue: string) {
    this.datasourceFamilias.filter = filterValue.trim().toLowerCase();
  }

  // Para que al hacer click se quede la fila marcada
  highlight(row) {
    this.selectedRowIndex = row.id;
  }

  TraeListaDePreguntas() {
    console.log('voy a traer familias');
    this.peticionesAPI.DameFamiliasDePreguntasDePuzzleProfesor(this.profesorId)
      .subscribe(familias => {
        if (familias !== undefined) {
          this.familias = familias;
          console.log("Familia: ", this.familias);

          this.datasourceFamilias = new MatTableDataSource(this.familias);
          console.log("this.datasourceFamilias:", this.datasourceFamilias);
        }
        else {
          // Mensaje al usuario
          console.log('Este profesor no tiene imagenes');
        }
      });
  }



  // TraeColeccionesPublicas() {


  //   this.peticionesAPI.DameColeccionesPublicas()
  //   .subscribe (publicas => {

  //     // me quedo con los públicos de los demás
  //     const publicasDeOtros = publicas.filter (coleccion => coleccion.profesorId !== Number(this.profesorId));
  //     // traigo los profesores para añadir a los publicos el nombre del propietario
  //     this.peticionesAPI.DameProfesores ()
  //     .subscribe (profesores => {
  //       publicasDeOtros.forEach (coleccion => {
  //         const propietario = profesores.filter (profesor => profesor.id === coleccion.profesorId)[0];
  //         if (propietario) {
  //           coleccion.Nombre = coleccion.Nombre + '(' + propietario.Nombre + ' ' + propietario.PrimerApellido + ')';
  //         }
  //       });
  //       this.coleccionesPublicas = publicasDeOtros;

  //     });
  //   });
  // }


  // MostrarPublicas() {
  //   this.muestroPublicas = true;
  //   this.datasourceColecciones = new MatTableDataSource(this.familias.concat (this.coleccionesPublicas));
  // }

  // QuitarPublicas() {
  //   this.muestroPublicas = false;
  //   this.datasourceColecciones = new MatTableDataSource(this.familias);
  // }


  HaSeleccionado() {
    if (this.selection.selected.length === 0) {
      return false;
    } else {
      return true;
    }
  }
  Marcar(row) {
    if (this.selection.isSelected(row)) {
      this.selection.deselect(row);
    } else {
      this.selection.clear();
      this.selection.select(row);
    }
  }

  AsignarFamiliaAlJuego() {
    let familiaSeleccionada;
    console.log('Vamos a agregar La Familia');
    this.datasourceFamilias.data.forEach(row => {
      if (this.selection.isSelected(row)) {

        console.log('hemos elegido ', row);
        familiaSeleccionada = row;

      }
    });

    this.emisorFamilia.emit(familiaSeleccionada);
    console.log(familiaSeleccionada.Nombre)
  }


}
