import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResponseContentType, Http, Response } from '@angular/http';
import Swal from 'sweetalert2';


// Imports para abrir diálogo confirmar eliminar equipo
import { MatDialog, MatTabGroup } from '@angular/material';
import { DialogoConfirmacionComponent } from '../COMPARTIDO/dialogo-confirmacion/dialogo-confirmacion.component';




// Servicios
import { SesionService, PeticionesAPIService } from '../../servicios/index';

// Clases
import { Coleccion, Cromo } from '../../clases/index';

import * as URL from '../../URLs/urls';

@Component({
  selector: 'app-mis-colecciones',
  templateUrl: './mis-colecciones.component.html',
  styleUrls: ['./mis-colecciones.component.scss']
})
export class MisColeccionesComponent implements OnInit {

  profesorId: number;


  coleccionesProfesor: Coleccion[];
  cromosColeccion: Cromo[];
  imagenColeccion: string;

  numeroDeCromos: number;

  file: File;

  // PARA DIÁLOGO DE CONFIRMACIÓN
  // tslint:disable-next-line:no-inferrable-types
  mensaje: string = 'Estás seguro/a de que quieres eliminar el equipo llamado: ';

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public sesion: SesionService,
    public peticionesAPI: PeticionesAPIService,
    private http: Http
  ) { }

  ngOnInit() {

    // REALMENTE LA APP FUNCIONARÁ COGIENDO AL PROFESOR DEL SERVICIO, NO OBSTANTE AHORA LO RECOGEMOS DE LA URL
    // this.profesorId = this.profesorService.RecibirProfesorIdDelServicio();
    this.profesorId = this.sesion.DameProfesor().id;

    console.log(this.profesorId);

    this.TraeColeccionesDelProfesor();
    console.log(this.coleccionesProfesor);


  }

  // Obtenemos todas las colecciones del profesor
  TraeColeccionesDelProfesor() {

    this.peticionesAPI.DameColeccionesDelProfesor(this.profesorId)
    .subscribe(coleccion => {
      if (coleccion[0] !== undefined) {
        console.log('Voy a dar la lista');
        this.coleccionesProfesor = coleccion;
        console.log(this.coleccionesProfesor);
        // this.profesorService.EnviarProfesorIdAlServicio(this.profesorId);
      } else {
        this.coleccionesProfesor = undefined;
      }

    });
  }

 // Le pasamos la coleccion y buscamos la imagen que tiene y sus cromos
 DameCromosEImagenDeLaColeccion(coleccion: Coleccion) {

  this.imagenColeccion = undefined;
  console.log('entro a buscar cromos y foto');
  console.log(coleccion.ImagenColeccion);
  // Si la coleccion tiene una foto (recordemos que la foto no es obligatoria)
  if (coleccion.ImagenColeccion !== undefined) {
    this.imagenColeccion = URL.ImagenesColeccion + coleccion.ImagenColeccion;

    // this.peticionesAPI.DameImagenColeccion (coleccion.ImagenColeccion)
    // .subscribe(response => {
    //   const blob = new Blob([response.blob()], { type: 'image/jpg'});

    //   const reader = new FileReader();
    //   reader.addEventListener('load', () => {
    //     this.imagenColeccion = reader.result.toString();
    //   }, false);

    //   if (blob) {
    //     reader.readAsDataURL(blob);
    //   }
    // });

    // Sino la imagenColeccion será undefined para que no nos pinte la foto de otro equipo préviamente seleccionado
  } else {
    this.imagenColeccion = undefined;
  }


  // Una vez tenemos el logo del equipo seleccionado, buscamos sus alumnos
  console.log('voy a mostrar los cromos de la coleccion ' + coleccion.id);

  // Busca los cromos dela coleccion en la base de datos
  this.peticionesAPI.DameCromosColeccion(coleccion.id)
  .subscribe(res => {
    if (res[0] !== undefined) {
      this.cromosColeccion = res;
      console.log(res);
      this.numeroDeCromos = this.cromosColeccion.length;
    } else {
      console.log('No hay cromos en esta coleccion');
      this.cromosColeccion = undefined;
      this.numeroDeCromos = 0;
    }
  });
  }

  // Envialos la colecció y los cromos al servicio sesión porque los necesitaremos en los componentes
  // editar y agregar
  GuardarColeccion(coleccion: Coleccion) {
  //  this.DameCromosEImagenDeLaColeccion(coleccion);
    this.sesion.TomaColeccion(coleccion);
    this.sesion.TomaCromos (this.cromosColeccion);
  }


   // Utilizamos esta función para eliminar una colección de la base de datos y actualiza la lista de colecciones
   BorrarColeccion(coleccion: Coleccion) {


    console.log ('Vamos a eliminar la colección');
    this.peticionesAPI.BorraColeccion(coleccion.id, coleccion.profesorId)
    .subscribe();

    this.peticionesAPI.BorrarImagenColeccion(coleccion.ImagenColeccion).subscribe();
    if (this.cromosColeccion !==  undefined) {
      for (let i = 0; i < (this.cromosColeccion.length); i++) {
        this.peticionesAPI.BorrarCromo (this.cromosColeccion[i].id).subscribe();
        this.peticionesAPI.BorrarImagenCromo(this.cromosColeccion[i].ImagenDelante).subscribe();
        if (this.cromosColeccion[i].ImagenDetras !== undefined) {
          this.peticionesAPI.BorrarImagenCromo(this.cromosColeccion[i].ImagenDetras).subscribe();
        }
      }
    }
    console.log ('La saco de la lista');
    this.coleccionesProfesor = this.coleccionesProfesor.filter(res => res.id !== coleccion.id);
  }




  // Si queremos borrar un equipo, antes nos saldrá un aviso para confirmar la acción como medida de seguridad. Esto se
  // hará mediante un diálogo al cual pasaremos el mensaje y el nombre del equipo
  AbrirDialogoConfirmacionBorrarColeccion(coleccion: Coleccion): void {
    Swal.fire({
      title: 'Eliminar',
      text: "Estas segura/o de que quieres eliminar el equipo llamado: " + coleccion.Nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'

    }).then((result) => {
      if (result.value) {
        this.BorrarColeccion(coleccion);
        Swal.fire('Eliminado', coleccion.Nombre + ' eliminado correctamente', 'success');

      }
    });
  
  }

}
