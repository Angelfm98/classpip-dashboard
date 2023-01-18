import { Component, OnInit } from '@angular/core';
import { Alumno, AlumnoJuegoDeControlDeTrabajoEnEquipo, Equipo, JuegoDeControlDeTrabajoEnEquipo } from 'src/app/clases';
import { SesionService, PeticionesAPIService, CalculosService, ComServerService } from 'src/app/servicios';
import { Location } from '@angular/common'; 
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';
import { MisPuntosComponent } from '../../mis-puntos/mis-puntos.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-juego-de-control-de-trabajo-en-equipo-seleccionado-activo',
  templateUrl: './juego-de-control-de-trabajo-en-equipo-seleccionado-activo.component.html',
  styleUrls: ['./juego-de-control-de-trabajo-en-equipo-seleccionado-activo.component.scss']
})
export class JuegoDeControlDeTrabajoEnEquipoSeleccionadoActivoComponent implements OnInit {

  juegoSeleccionado: any;
  inscripciones: AlumnoJuegoDeControlDeTrabajoEnEquipo[];
  equipos: any;
  equiposConAlumnos: any;
  dataSource;
  displayedColumns: string[];
  controles: string [];
  tablaPreparada = false;
  dato = undefined;
  respuestasEquipos;
  dataSourceControl;
  tablaControlPreparada = false;
  displayedColumnsControl: string[];
  nombresMiembros: string [];
  datosControl: any;
  numeroDeControl: number;
  nombreDelEquipo: string;
  nombreDemo: string[];
  nombreAlumnos: string[];
  alumnosVotos: Alumno[];
  controlTerminado;
  comentarios;
  equipoAhora: Equipo;
  listaAlumnos: any[];

  constructor(
    public sesion: SesionService,
    public peticionesAPI: PeticionesAPIService,
    public calculos: CalculosService,
    private comServer: ComServerService,
    private location: Location,
    private router: Router) { }

  ngOnInit() {
    this.alumnosVotos = [];
    this.juegoSeleccionado = this.sesion.DameJuego();
    this.displayedColumns = [];
    this.controles = [];
    this.displayedColumns.push ('equipo');
    for (let i = 1; i <= this.juegoSeleccionado.numeroDeControles; i++) {
      this.displayedColumns.push ('control'+i);
      this.controles.push ('control'+i);
    }
  
    this.peticionesAPI.DameEquiposDelGrupo (this.juegoSeleccionado.grupoId)
    .subscribe ( equipos => {
      this.equipos = equipos;
      this.TraeRespuestasAlControl();
      this.nombreDemo=["hola", "yepa","ello"];
    });

  }

  async TraeRespuestasAlControl() {
    this.equiposConAlumnos = [];
    let cont = 0;
    this.equipos.forEach (async e => {
      const alumnosEquipo = await this.peticionesAPI.DameAlumnosEquipo (e.id).toPromise();
      this.equiposConAlumnos.push ({
        equipo: e,
        alumnos: alumnosEquipo
      });
      cont++;
      if (cont === this.equipos.length) {
        this.dataSource = new MatTableDataSource (this.equiposConAlumnos);
        this.tablaPreparada = true;
      }
    });
    this.respuestasEquipos = [];
    let numeroDeRespuestas = Array(this.equipos.length);


    for(let i=0; i<this.equipos.length; i++) {
      var temp = await this.peticionesAPI.DameAlumnosEquipo (this.equipos[i].id).toPromise();
      // for(let j=0;i<temp.length; j++) {
      //   console.log(temp[i]);
      //   // this.alumnosVotos.push(temp[i]);
      // };
    };
    
    
    
    
    // for (let i=0; i<this.equipos.length; i++) {
    //   var tmp: Alumno[] = await this.peticionesAPI.DameAlumnosEquipo ( this.equipos[i].id).toPromise();
    //   for (let j=0; j<tmp.length; j++) {
    //     this.alumnosVotos.push(tmp[j]);
    //   };
    // };
    // console.log("Vale ahora tengo guardado: "+this.alumnosVotos);
    // console.log("PArseo y tengo: "+ JSON.stringify(this.alumnosVotos));
   
    // Voy a preparar el vector con todas las respuestas de los Equipos
    // El vector tendrá una posición por cada equipo. En esa posición habra un objeto con el equipo y las respuestas del equipo
    // Las respuestas del equipo es un vector con tantas posiciones como miembros tiene el equipo. En cada una de esas posiciones 
    // hay un vector con las respuestas de cada alumno a los controles.
    // Cada respuesta a un control es un objeto con dos campos: puntuaciones y comentario. 
    // Puntuaciones es un vector con tantas posiciones como alumnos tiene el grupo. En cada posición hay el id del alumno 
    // y los puntos que se le han asignado.

    // 
   
    for (let i = 0; i < this.equipos.length; i++) {
 
      // Vamos a recoger las respuestas de los alumnos del equipo i
      const alumnosEquipo = await this.peticionesAPI.DameAlumnosEquipo (this.equipos[i].id).toPromise();
      numeroDeRespuestas[i] = Array(alumnosEquipo.length).fill(0);
    
      // ahora me traigo las inscripciones de todos ellos para quedarme con las respuestas
      let respuestasEquipo = [];
      for (let j = 0; j < alumnosEquipo.length; j++) {
        const inscripcion = await this.peticionesAPI.DameInscripcionAlumnoJuegoDeControlDeTrabajoEnEquipo(this.juegoSeleccionado.id, alumnosEquipo[j].id).toPromise();
        respuestasEquipo.push(inscripcion[0].respuestas);
        console.log("OYE TENGO ESTO: "+JSON.stringify(respuestasEquipo));
        // Registro el número de respuestas del alumno j del equipo i
        if (inscripcion[0].respuestas) {
          // Tengo que poner (Object) para que no se queje el compilador. No se por qué
          numeroDeRespuestas[i][j] =  (Object) (inscripcion[0].respuestas).length;
        } else {
          numeroDeRespuestas[i][j] = 0;
        }
      }
      console.log("Voy a entrar en la funcion de borrar");
      console.log("Ya ha entrado");
      this.respuestasEquipos.push ({
        equipo: this.equipos[i],
        respuestas: respuestasEquipo
      })
     
   
    };
    console.log ('RESPUESTAS EQUIPOS ', this.respuestasEquipos);

    // A partir de la matriz numeroDeRespuestas[i][j], que me dice cuantos controles ha contestado ya el alumno j del equipo i
    // creo la matriz numeroRespuestasPorControl[i][k] que indica cuantos alumnos del equipo i han contestado ya el control k

    let numeroRespuestasPorControl = Array(this.equipos.length);
    for (let i = 0; i < this.equipos.length; i++) {
      numeroRespuestasPorControl[i] = Array(this.juegoSeleccionado.numeroDeControles).fill(0);
      for (let j=0; j < numeroDeRespuestas[i].length; j++) {
        // Si el alumno j del equipo i ha contestado N controles, entonces ha contestado los controles 0, 1, ..., N-1
        for (let k=0; k < numeroDeRespuestas[i][j]; k++) {
          numeroRespuestasPorControl[i][k]++
        }
      }
    }
 
    // ahora ya puedo decidir, para cada control, si está completo o no. En caso de que esté completo, tambien puedo decidir 
    // si hay problemas o no. 
    // Considero que un control indica posibles problemas si alguno de los alumnos ha recibido de alguno de sus compañeros un
    // numero de puntos inferior a la mitad de lo que hubiera sido un reparto perfecto de los 10 puntos. Por ejemplo, si el grupo
    // es de 4 alumnos el reparto pertecto es 2.5 para cada uno. Habrá problemas si un alumno recibe menos de 1.25 puntos por parte de 
    // algun compañero. 
    // Hay que tener en cuenta que se trabaja solo con números enteros por lo que respecta a cantidades de puntos.
    // En la matriz controlTerminado [i][k] indicaremos el estado del control k del equipo i, con estos códigos:
    //    0   control no contestado aun nadie del grupo
    //    1   control contestado por todos y sin problemas
    //    2   control contestado por todos pero con problemas
    //    3   control contestado solo por algunos del grupo
   
    this.controlTerminado = Array(this.equipos.length);
    for (let i = 0; i < this.equipos.length; i++) {
      const alumnosEquipo = await this.peticionesAPI.DameAlumnosEquipo ( this.equipos[i].id).toPromise(); 
      this.controlTerminado[i] = Array(this.juegoSeleccionado.numeroDeControles).fill(0);
      for (let j=0; j < this.juegoSeleccionado.numeroDeControles; j++) {
        if (numeroRespuestasPorControl[i][j] === alumnosEquipo.length) {
          // Todos los miembros del equipo i han contestado el control j
          this.PreparaDatosDelControl (j, this.equipos[i].id, alumnosEquipo);
          const minimo = 10/(alumnosEquipo.length*2);
          // supongo que no hay problemas
          this.controlTerminado[i][j] = 1;
          // Ahora veo si alguna de las puntuaciones de alguno de los alumnos está por debajo del mínimo,
          // porque entonces sí hay problemas
          for (let k = 0; k < alumnosEquipo.length ; k++) {
            if (this.Problema (k, minimo)) {
              this.controlTerminado[i][j] = 2;
              break;
            }
          }
        } else if (numeroRespuestasPorControl[i][j] > 0) {
          // Solo algunos han contestado el control
          this.controlTerminado[i][j] = 3;
        }
      }
    }
  }


  PreparaDatosDelControl (i: number, idEquipo: number, alumnosEquipo: any) {
    // Prepara las puntuaciones y los comentarios de los alumnos del equipo identificado al contestar el control i
    this.datosControl  = [];
    this.comentarios = [];
   
    let respuesta = this.respuestasEquipos.find (respuesta => respuesta.equipo.id === idEquipo);
      // la respuesta es un vector con una posición para cada alumno del grupo
    // recorremos todos los alumnos y tomamos sus respuestas en el control elegido
    for (let j = 0; j < respuesta.respuestas.length; j++) {
      // hay que comprobar que el alumno j ha contestado algo y que ha contestado al control i
      if (respuesta.respuestas[j] && respuesta.respuestas[j][i]) {
        // El alumno j ha contestado algun control
        // Tomamos sus respuestas al control i
        this.datosControl.push (respuesta.respuestas[j][i]);
        // Si también ha hecho algun comentario lo metemos en la lista de comentarios (nombre del alumno y comentario)
        if (respuesta.respuestas[j][i].comentario) {
          this.comentarios.push ({
            nombre: alumnosEquipo[j].Nombre,
            comentario: respuesta.respuestas[j][i].comentario
          })
        }
      } else {
        this.datosControl.push (undefined);
      }
    }

  }

  
  async MouseOver (i: number, element: any) {
    // Se ha hecho click en la tabla sobre el control i del equipo identificado en element. Hay que mostrar los datos de ese control
    this.numeroDeControl = i+1;
    this.nombreDelEquipo = element.equipo.Nombre;
    this.equipoAhora = element.equipo;
    const alumnosEquipo = await this.peticionesAPI.DameAlumnosEquipo ( element.equipo.id).toPromise();
    // alumnosEquipo.forEach(e => {
    //   this.nombreAlumnos.push(e.Nombre);
    // });
    this.nombreAlumnos= [];
    for (let i=0; i<alumnosEquipo.length; i++) {
      this.nombreAlumnos[i]=await alumnosEquipo[i].Nombre;
    }
    console.log("Tengo la lista de nombres mira: "+await this.nombreAlumnos);
    this.PreparaDatosDelControl(i, element.equipo.id, alumnosEquipo);
  

 
    this.displayedColumnsControl = []
    this.nombresMiembros = [];
    this.displayedColumnsControl.push ('alumno');
    for (let i = 0; i < alumnosEquipo.length; i ++) {
      this.displayedColumnsControl.push (alumnosEquipo[i].Nombre);
      this.nombresMiembros.push (alumnosEquipo[i].Nombre);
    };
    this.dataSourceControl = new MatTableDataSource (alumnosEquipo);
    this.tablaControlPreparada = true;

  }

  Suma (i) {
    // Calculo los puntos recibidos por el alumno i en el control seleccionado (cuyos datos 
    // fueron preparados en datosControl)
    let total = 0;
    for (let j=0; j < this.datosControl.length; j++) {
      total = total + this.datosControl[j].puntuaciones[i].puntos;
    }
    return total;
  }

  Problema (i, minimo): boolean {
    // Comprueba si el alumno i tiene alguna puntuación por debajo del mínimo en el control seleccionado
    let problema = false;
    for (let j=0; j < this.datosControl.length; j++) {
      if (this.datosControl[j].puntuaciones[i].puntos < minimo) {
        problema = true;
        break;
      }
    }
    return problema;
  }

  public Test(alumno: string) {
    console.log("Hola entro a una función!, voy a eliminar el voto que ha hecho el alumno con id: "+alumno);
  }
  
  public async EliminarVoto(id: number) {
        Swal.fire({
          title: '¿Estás seguro?',
          text: "Una vez eliminado el voto, no podrás revertir los cambios.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, elimina el voto',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.value) {
            Swal.fire(
              'Eliminado',
              'El voto ha sido descartado.',
              'success'
            );
            this.Borra(id);
            this.location.back();
          }
        })
  }

  public async Borra(id: number) {
    console.log("hola entro a la funcion y el id a eliminar es: "+id);
    const alumnosEquipo = await this.peticionesAPI.DameAlumnosEquipo ( this.equipoAhora.id).toPromise();
    var alumnoSelecionado: Alumno;
    for (let i=0, encontrado=false; i<alumnosEquipo.length && encontrado==false ; i++)
    {
      if (alumnosEquipo[i].id==id) {
        encontrado=true;
        alumnoSelecionado= alumnosEquipo[i];
      }
    }
    console.log("He hecho la busqueda, y voy a ir a buscar el id= "+alumnoSelecionado.id+". Que pertenece a: "+alumnoSelecionado.Nombre);
    const inscripcion = await this.peticionesAPI.DameInscripcionAlumnoJuegoDeControlDeTrabajoEnEquipo(this.juegoSeleccionado.id, alumnoSelecionado.id).toPromise();
    console.log("Me voy a cargar la inscripcion del alumno con id: "+inscripcion[0].alumnoId+" .Que ha hecho la votación con id: "+inscripcion[0].id+" Que porcierto pertenece al juego: "+inscripcion[0].juegoDeControlDeTrabajoEnEquipoId);
    await this.peticionesAPI.BorrarInscripcionAlumnoJuegoDeControlDeTrabajoEnEquipo(inscripcion[0].id).toPromise();
    console.log("Ya he borrado la inscripcion del alumno con id: "+inscripcion[0].id+"Ahora voy a crear la inscripción vacía");
    this.peticionesAPI.InscribeAlumnoJuegoDeControlDeTrabajoEnEquipo( new AlumnoJuegoDeControlDeTrabajoEnEquipo(inscripcion[0].alumnoId, inscripcion[0].juegoDeControlDeTrabajoEnEquipoId))
        .subscribe();
  }

  // public async EliminarVotoT(pos: number) {
  //   console.log("hola entro a la funcion y la i es igual a: "+pos);
  //   const alumnosEquipo = await this.peticionesAPI.DameAlumnosEquipo ( this.equipoAhora.id).toPromise();
  //   console.log("Me voy a cargar a el alumno: "+alumnosEquipo[pos].id+"Que es: "+alumnosEquipo[pos].Nombre);
  //     // Busco la inscripcion del alumno que quiero eliminar
  //     console.log("Voy a borrarlo!!");
  //     // const alumnosEquipo = await this.peticionesAPI.DameAlumnosEquipo ( equipoID).toPromise();
  //     const inscripcion = await this.peticionesAPI.DameInscripcionAlumnoJuegoDeControlDeTrabajoEnEquipo(this.juegoSeleccionado.id, alumnosEquipo[pos].id).toPromise();
  //     console.log("Me voy a cargar la inscripcion del alumno con id: "+inscripcion[0].alumnoId+" .Que ha hecho la votación con id: "+inscripcion[0].id+" Que porcierto pertenece al juego: "+inscripcion[0].juegoDeControlDeTrabajoEnEquipoId);
  //     await this.peticionesAPI.BorrarInscripcionAlumnoJuegoDeControlDeTrabajoEnEquipo(inscripcion[0].id).toPromise();
  //     console.log("Ya he borrado la inscripcion del alumno con id: "+inscripcion[0].id+"Ahora voy a crear la inscripción vacía");
  //     this.peticionesAPI.InscribeAlumnoJuegoDeControlDeTrabajoEnEquipo( new AlumnoJuegoDeControlDeTrabajoEnEquipo(inscripcion[0].alumnoId, inscripcion[0].juegoDeControlDeTrabajoEnEquipoId))
  //       .subscribe();
  //     Swal.fire('El voto ha sido eliminado, por favor actualiza la pagina', ' ', 'success');

  //   }
  
  DesactivarJuego() {
    Swal.fire({
      title: '¿Seguro que quieres desactivar el juego de control de trabajo en equipo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, estoy seguro'
    }).then((result) => {
      if (result.value) {
        this.juegoSeleccionado.JuegoActivo = false;
        this.peticionesAPI.CambiaEstadoJuegoDeControlDeTrabajoEnEquipo (this.juegoSeleccionado)
        .subscribe(res => {
            if (res !== undefined) {
              Swal.fire('El juego se ha desactivado correctamente');
              this.location.back();
            }
        });
      }
    });
  }

  // Funciones para cuando el juego no está activo
  
  // Eliminar() {
  //   Swal.fire({
  //     title: '¿Seguro que quieres eliminar el juego?',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Si, estoy seguro'
  //   }).then(  (result) => {
  //     if (result.value) {
  //       this.calculos.EliminarJuegoControlDeTrabajoEnEquipo(this.juegoSeleccionado);
  //       Swal.fire('El juego se ha eliminado correctamente');
  //       this.location.back();
  //     }
  //   });
  // }

  
  Eliminar(): void {

    Swal.fire({
      title: 'Confirma que quieres eliminar el juego <b>' + this.juegoSeleccionado.NombreJuego + '</b>',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
    }).then((result) => {
      if (result.value) {
        this.calculos.EliminarJuegoControlDeTrabajoEnEquipo(this.juegoSeleccionado);
        Swal.fire('El juego ha sido eliminado correctamente', ' ', 'success');
        this.location.back();
      }
    });
  }


  Reactivar() {
    Swal.fire({
      title: '¿Seguro que quieres activar el juego?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, estoy seguro'
    }).then((result) => {
      if (result.value) {

        this.juegoSeleccionado.JuegoActivo = true;
        this.peticionesAPI.CambiaEstadoJuegoDeControlDeTrabajoEnEquipo (this.juegoSeleccionado)
        .subscribe(res => {
            if (res !== undefined) {
              Swal.fire('El juego se ha activado correctamente');
              this.location.back();
            }
        });
      }
    });
  }


}
