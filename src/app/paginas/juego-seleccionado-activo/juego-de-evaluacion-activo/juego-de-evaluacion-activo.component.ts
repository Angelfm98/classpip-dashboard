import { Component, OnInit } from '@angular/core';
import {PeticionesAPIService, SesionService} from '../../../servicios';
import {JuegoDeEvaluacion} from '../../../clases/JuegoDeEvaluacion';
import {Alumno, Equipo} from '../../../clases';
import {AlumnoJuegoDeEvaluacion} from '../../../clases/AlumnoJuegoDeEvaluacion';
import {EquipoJuegoDeEvaluacion} from '../../../clases/EquipoJuegoDeEvaluacion';

@Component({
  selector: 'app-juego-de-evaluacion-activo',
  templateUrl: './juego-de-evaluacion-activo.component.html',
  styleUrls: ['./juego-de-evaluacion-activo.component.scss']
})
export class JuegoDeEvaluacionActivoComponent implements OnInit {

  juego: JuegoDeEvaluacion;
  alumnos: Alumno[];
  alumnosRelacion: AlumnoJuegoDeEvaluacion[];
  equipos: Equipo[];
  equiposRelacion: EquipoJuegoDeEvaluacion[];
  alumnosDeEquipo = [];
  // Tabla
  displayedColumns: string[];
  tmpDisplayedColumns = [];
  datosTabla = [];
  hoverColumn = [];

  constructor(
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService
  ) { }

  ngOnInit() {
    this.juego = this.sesion.DameJuego() as unknown as JuegoDeEvaluacion;
    console.log(this.juego);
    if (this.juego.Modo === 'Individual') {
      this.peticionesAPI.DameRelacionAlumnosJuegoDeEvaluacion(this.juego.id)
        .subscribe((res: AlumnoJuegoDeEvaluacion[]) => {
          this.alumnosRelacion = res;
          this.ConstruirTablaIndividual();
        });
      this.peticionesAPI.DameAlumnosJuegoDeEvaluacion(this.juego.id)
        .subscribe((res: Alumno[]) => {
          this.alumnos = res;
          this.ConstruirTablaIndividual();
        });
    } else if (this.juego.Modo === 'Equipos') {
      this.peticionesAPI.DameRelacionEquiposJuegoDeEvaluacion(this.juego.id)
        .subscribe((res: EquipoJuegoDeEvaluacion[]) => {
          this.equiposRelacion = res;
          this.equiposRelacion.forEach((equipoRelacion: EquipoJuegoDeEvaluacion) => {
            this.peticionesAPI.DameAlumnosEquipo(equipoRelacion.equipoId)
              .subscribe((res2: Alumno[]) => {
                const obj = {equipoId: equipoRelacion.equipoId, alumnos: res2};
                this.alumnosDeEquipo.push(obj);
                this.ConstruirTablaEquipos();
              });
          });
        });
      this.peticionesAPI.DameEquiposJuegoDeEvaluacion(this.juego.id)
        .subscribe((res: Equipo[]) => {
          this.equipos = res;
          this.ConstruirTablaEquipos();
        });
    }
  }

  CalcularNotaMedia(row): number | string {
    let media = 0;
    let p = 0;
    for (const nombre in row) {
      if (typeof row[nombre] === 'number') {
        media += row[nombre];
        p++;
      }
    }
    if (p > 0) {
      return Math.round(((media / p) + Number.EPSILON) * 100) / 100;
    } else {
      return '-';
    }
  }

  CalcularNota(respuesta: any[]): number {
    if (this.juego.metodoSubcriterios) {
      let finalNota = 0;
      for (let i = 0; i < this.juego.Pesos.length; i++) {
        let subNota = 0;
        for (let j = 1; j < this.juego.Pesos[i].length; j++) {
          if (respuesta[i][j - 1]) {
            subNota += this.juego.Pesos[i][j] / 10;
          }
          // console.log(this.juego.Pesos[i][j], respuesta[i][j - 1], subNota);
        }
        finalNota += subNota * this.juego.Pesos[i][0] / 100;
        // console.log(this.juego.Pesos[i][0], subNota, finalNota);
      }
      return Math.round((finalNota + Number.EPSILON) * 100) / 100;
    } else {
      return -1;
    }
  }

  ConstruirTablaIndividual() {
    if (!this.alumnos || !this.alumnosRelacion) {
      return;
    }
    this.tmpDisplayedColumns = this.alumnos.map(item => [item.id, item.Nombre]);
    this.alumnos.forEach((alumno) => {
      const row = {
        Nombre: undefined
      };
      const evaluado = this.alumnosRelacion.find(item => item.alumnoId === alumno.id);
      row.Nombre = this.alumnos.find(item => item.id === evaluado.alumnoId).Nombre;
      this.tmpDisplayedColumns.forEach((item: (number|string)[]) => {
        // const respuesta = evaluado.respuestas.find(res => res.alumnoId === item[0]);
        if (evaluado.respuestas && evaluado.respuestas.find(res => res.alumnoId === item[0])) {
          row[item[1]] = this.CalcularNota(evaluado.respuestas.find(res => res.alumnoId === item[0]).respuesta);
        } else {
          row[item[1]] = '-';
        }
      });
      row['Nota Media'] = this.CalcularNotaMedia(row);
      this.datosTabla.push(row);
    });
    this.displayedColumns = this.tmpDisplayedColumns.map(item => item[1]) as string[];
    this.displayedColumns.unshift('Nombre');
    this.displayedColumns.push('Nota Media');
    console.log(this.tmpDisplayedColumns);
    console.log(this.displayedColumns);
    console.log(this.datosTabla);
    this.hoverColumn = new Array(this.displayedColumns.length).fill(false);
    console.log(this.hoverColumn);
  }

  ConstruirTablaEquipos() {
    if (!this.equipos || !this.equiposRelacion) {
      return;
    }
    if (this.alumnosDeEquipo.length !== this.equipos.length) {
      return;
    }
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.alumnosDeEquipo.length; i++) {
      // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < this.alumnosDeEquipo[i].alumnos.length; j++) {
        this.tmpDisplayedColumns.push([this.alumnosDeEquipo[i].alumnos[j].id, this.alumnosDeEquipo[i].alumnos[j].Nombre]);
      }
    }
    if (this.equiposRelacion[0].alumnosEvaluadoresIds !== null) {
      this.equipos.forEach((equipo) => {
        const row = {
          Nombre: undefined
        };
        const evaluado = this.equiposRelacion.find(item => item.equipoId === equipo.id);
        row.Nombre = this.equipos.find(item => item.id === evaluado.equipoId).Nombre;
        this.tmpDisplayedColumns.forEach((item: (number|string)[]) => {
          if (evaluado.respuestas && evaluado.respuestas.find(res => res.alumnoId === item[0])) {
            row[item[1]] = this.CalcularNota(evaluado.respuestas.find(res => res.alumnoId === item[0]).respuesta);
          } else {
            row[item[1]] = '-';
          }
        });
        row['Nota Media'] = this.CalcularNotaMedia(row);
        this.datosTabla.push(row);
      });
    } else {
      this.tmpDisplayedColumns = this.equipos.map(item => [item.id, item.Nombre]);
      this.equipos.forEach((equipo) => {
        const row = {
          Nombre: undefined
        };
        const evaluado = this.equiposRelacion.find(item => item.equipoId === equipo.id);
        row.Nombre = this.equipos.find(item => item.id === evaluado.equipoId).Nombre;
        const alumnosDeEquipo = this.alumnosDeEquipo.find(item => item.equipoId === equipo.id);
        this.tmpDisplayedColumns.forEach((item: (number|string)[]) => {
          if (evaluado.respuestas && evaluado.respuestas.find(res => alumnosDeEquipo.alumnos.includes(res.alumnoId))) {
            row[item[1]] = this.CalcularNota(evaluado.respuestas.find(res => alumnosDeEquipo.alumnos.includes(res.alumnoId)).respuesta);
          } else {
            row[item[1]] = '-';
          }
        });
        row['Nota Media'] = this.CalcularNotaMedia(row);
        this.datosTabla.push(row);
      });
    }
    this.displayedColumns = this.tmpDisplayedColumns.map(item => item[1]) as string[];
    this.displayedColumns.unshift('Nombre');
    this.displayedColumns.push('Nota Media');
    console.log(this.tmpDisplayedColumns);
    console.log(this.displayedColumns);
    console.log(this.datosTabla);
    this.hoverColumn = new Array(this.displayedColumns.length).fill(false);
    console.log(this.hoverColumn);
  }

  MouseOver(event) {
    const columnNum = event.target.className.match('\-([0-9]+)')[1];
    this.hoverColumn[columnNum] = true;
    // console.log(columnNum);
    // console.log(this.hoverColumn);
  }

  MouseOut(event) {
    const columnNum = event.target.className.match('\-([0-9]+)')[1];
    this.hoverColumn[columnNum] = false;
  }

}
