import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CuestionarioSatisfaccion } from 'src/app/clases';
import { SesionService, PeticionesAPIService } from 'src/app/servicios';
import {  Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert';

@Component({
  selector: 'app-crear-cuestionario-satisfaccion',
  templateUrl: './crear-cuestionario-satisfaccion.component.html',
  styleUrls: ['./crear-cuestionario-satisfaccion.component.scss']
})
export class CrearCuestionarioSatisfaccionComponent implements OnInit {

  ficheroCargado = false;
  cuestionario: CuestionarioSatisfaccion;
  advertencia = true;
  profesorId: number;
  afirmaciones: string[] = [];
  preguntas: string[] = [];
  

  formGroup: FormGroup;
  botonPaso1Desactivado = true;
  botonPaso2Desactivado = true;

  // Persona que crearemos con el stepper
  persona: any;

  // Aquí se construirá la frase para mostrar los datos de la persona creada con el stepper
  resultadoStepper: string;


  constructor(
    private router: Router,
    public sesion: SesionService,
    public peticionesAPI: PeticionesAPIService,
    private formBuilder: FormBuilder,
  ) {
   
   }

  ngOnInit() {
    this.profesorId = this.sesion.DameProfesor().id;
    this.cuestionario = new CuestionarioSatisfaccion();
    this.cuestionario.profesorId = this.profesorId;
    
    
    
    
    // Indico los campos que tendrá cada uno de los dos formularios que se usan en el stepper
    this.formGroup = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      afirmacion: ['', Validators.required],
      preguntaAbierta: ['', Validators.required],
    });
  }

  // Activa la función SeleccionarFicheroPreguntas
  ActivarInputInfo() {
    console.log('Activar input');
    document.getElementById('inputInfo').click();
  }


   // Par abuscar el fichero JSON que contiene la info de la colección que se va
  // a cargar desde ficheros
  SeleccionarFicheroCuestionario($event) {
    const fileInfo = $event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(fileInfo, 'ISO-8859-1');
    reader.onload = () => {
      try {
        this.cuestionario = JSON.parse(reader.result.toString());
        console.log ('Ya tengo el cuestionario');
        console.log (this.cuestionario);
        Swal.fire('El cuestionario de satisfacción se ha cargado correctamente', '', 'success');
        this.ficheroCargado = true;
      } catch (e) {
        Swal.fire('Error en el formato del fichero', '', 'error');
      }
    };
  }

  RegistrarCuestionario() {
    this.cuestionario.profesorId = this.profesorId;
    this.peticionesAPI.CreaCuestionarioSatisfaccion(this.cuestionario, this.profesorId)
    .subscribe((res) => {
        if (res != null) {
            Swal.fire('Cuestionario de satisfaccion registrado correctamente', '', 'success');
            this.goBack();
        } else {
          Swal.fire('Error en el registro del cuestionario de satisfacion', '', 'error');
        }
      });
  }

  goBack() {
    this.router.navigate(['/inicio/' + this.profesorId]);
  }



  // MIRO SI HAY ALGO SIMULTÁNEAMENTE EN EL NOMBRE Y LA EDAD
  BotonPaso1() {
    if (this.formGroup.value.titulo === '' || this.formGroup.value.descripcion === '') {
      // Si alguno de los valores es igual a nada, entonces estará desactivado
      console.log('desactivo');
      this.botonPaso1Desactivado = true;
    } else {
      // Si ambos son diferentes a nulo, estará activado.
      this.botonPaso1Desactivado = false;
      console.log('activo');
      
    }
  }

  // MIRO SI HAY ALGO SIMULTÁNEAMENTE EN EL NOMBRE Y LA EDAD
  BotonPaso2() {
    if (this.formGroup.value.afirmacion === '' || this.formGroup.value.preguntaAbierta === '') {
      // Si alguno de los valores es igual a nada, entonces estará desactivado
      this.botonPaso2Desactivado = true;
    } else {
      // Si ambos son diferentes a nulo, estará activado.
      this.botonPaso2Desactivado = false;
    }
  
  }

  RegCuestionario() {
    
    this.cuestionario.Titulo = this.formGroup.value.titulo;
    this.cuestionario.Descripcion = this.formGroup.value.descripcion;
  }

  AnadirAfirmacionesYPreguntas(){
  if(this.formGroup.value.afirmacion != null && this.formGroup.value.preguntaAbierta != null){
    this.afirmaciones.push(this.formGroup.value.afirmacion);
    this.preguntas.push(this.formGroup.value.preguntaAbierta);
  }else if(this.formGroup.value.afirmacion != null && this.formGroup.value.preguntaAbierta == null){
   this.afirmaciones.push(this.formGroup.value.afirmacion);
  }else if(this.formGroup.value.preguntaAbierta != null && this.formGroup.value.afirmacion == null){
    this.preguntas.push(this.formGroup.value.preguntaAbierta);
  }else if(this.formGroup.value.afirmacion == null && this.formGroup.value.preguntaAbierta == null){
    Swal.fire("Rellena uno de los campos para añadirlo al cuestionario", '', 'error')
  }

  this.cuestionario.Afirmaciones = this.afirmaciones;
  this.cuestionario.PreguntasAbiertas = this.preguntas;

  console.log(this.cuestionario.Afirmaciones);
  console.log(this.cuestionario.PreguntasAbiertas);


  }

 
  
  Mostrar() {
    this.resultadoStepper = 'Titulo: ' + this.cuestionario.Titulo +
      ', Descripcion: ' + this.cuestionario.Descripcion +
      ', Afirmaciones: ' + this.cuestionario.Afirmaciones +
      ', PreguntasAbiertas: ' + this.cuestionario.PreguntasAbiertas;
  }

  Reiniciar() {
    this.resultadoStepper = '';
    this.botonPaso1Desactivado = true;
    this.botonPaso2Desactivado = true;
  }



}
