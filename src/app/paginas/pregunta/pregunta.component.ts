import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

//Servicios
import { SesionService, PeticionesAPIService } from 'src/app/servicios';

//Clases
import { Pregunta } from 'src/app/clases';

@Component({
  selector: 'app-pregunta',
  templateUrl: './pregunta.component.html',
  styleUrls: ['./pregunta.component.scss']
})
export class PreguntaComponent implements OnInit {

  // Identificador del profesor
  profesorId: number;

  //Pregunta a crear
  pregunta: Pregunta

  //Para el stepper
  myForm: FormGroup;

  //Para el stepper
  myForm2: FormGroup;

  // URL del inicio
  URLVueltaInicio: string;

  // Para saber si el botón está habilitado o no
  // tslint:disable-next-line:ban-types
  isDisabled: Boolean = true;
  isDisabled2: Boolean = true;

  // tslint:disable-next-line:ban-types
  finalizar: Boolean = false;


  infoPreguntas: any;
  advertencia = true;
  ficheroCargado = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog,
              public sesion: SesionService,
              public peticionesAPI: PeticionesAPIService,
              private _formBuilder: FormBuilder) { }

  ngOnInit() {

    // REALMENTE LA APP FUNCIONARÁ COGIENDO AL PROFESOR DEL SERVICIO, NO OBSTANTE AHORA LO RECOGEMOS DE LA URL
    // this.profesorId = this.profesorService.RecibirProfesorIdDelServicio();
    this.profesorId = this.sesion.DameProfesor().id;

    // tslint:disable-next-line:no-string-literal
    this.URLVueltaInicio = this.route.snapshot.queryParams['URLVueltaInicio'] || '/inicio';

    this.myForm = this._formBuilder.group({
      tituloPregunta: ['', Validators.required],
      preguntaPregunta: ['', Validators.required],
      tematicaPregunta: ['', Validators.required]
    })

    this.myForm2 = this._formBuilder.group({
      respuestaCorrecta: ['', Validators.required],
      respuestaIncorrecta1: ['', Validators.required],
      respuestaIncorrecta2: ['', Validators.required],
      respuestaIncorrecta3: ['', Validators.required],
      feedbackCorrecto: ['', Validators.required],
      feedbackIncorrecto: ['', Validators.required]
    })
  }

  //CREAMOS Y GUARDAMOS LA PREGUNTA CON LOS VALORES AÑADIDOS
  CrearPregunta() {
    let tituloPregunta: string;
    let preguntaPregunta: string;
    let tematicaPregunta: string;
    let respuestaCorrecta: string;
    let respuestaIncorrecta1: string;
    let respuestaIncorrecta2: string;
    let respuestaIncorrecta3: string;
    let feedbackCorrecto: string;
    let feedbackIncorrecto: string;

    tituloPregunta = this.myForm.value.tituloPregunta;
    preguntaPregunta = this.myForm.value.preguntaPregunta;
    tematicaPregunta = this.myForm.value.tematicaPregunta;
    respuestaCorrecta = this.myForm2.value.respuestaCorrecta;
    respuestaIncorrecta1 = this.myForm2.value.respuestaIncorrecta1;
    respuestaIncorrecta2 = this.myForm2.value.respuestaIncorrecta2;
    respuestaIncorrecta3 = this.myForm2.value.respuestaIncorrecta3;
    feedbackCorrecto = this.myForm2.value.feedbackCorrecto;
    feedbackIncorrecto = this.myForm2.value.feedbackIncorrecto;

    const pregunta = new Pregunta(tituloPregunta, preguntaPregunta,
      tematicaPregunta, respuestaCorrecta, respuestaIncorrecta1,
      respuestaIncorrecta2, respuestaIncorrecta3, feedbackCorrecto,
      feedbackIncorrecto);
    console.log ('vamos a crear pregunta');
    this.peticionesAPI.CreaPregunta(pregunta, this.profesorId)
      .subscribe((res) => {
        if (res != null) {
          console.log('Pregunta creada correctamente' + res);
          this.pregunta = res;
          this.aceptarGoBack();
        } else {
          console.log('Fallo en la creacion de la pregunta');
          Swal.fire('Se ha producido un error creando la pregunta', 'ERROR', 'error');
        }
      });
  }


  // VUELTA AL INICIO
  VueltaInicio() {
    this.router.navigate([this.URLVueltaInicio, this.profesorId]);
    console.log(this.URLVueltaInicio);
  }

  goBack() {
    this.router.navigate(['/inicio/' + this.profesorId]);
  }
  aceptarGoBack() {
    Swal.fire('La pregunta se ha creado correctamente', 'Enhorabuena', 'success');
    this.finalizar = true;
    this.goBack();
  }

  // MIRO SI HAY ALGO SIMULTÁNEAMENTE EN EL TITULO, PREGUNTA Y LA TEMATICA
  Disabled() {
    if (this.myForm.value.tituloPregunta === '' || this.myForm.value.preguntaPregunta === '' || this.myForm.value.tematicaPregunta === '') {
      // Si alguno de los valores es igual a nada, entonces estará desactivado
      this.isDisabled = true;
    } else {
      // Si ambos son diferentes a nulo, estará activado.
      this.isDisabled = false;
    }
  }

  // MIRO SI HAY ALGO SIMULTÁNEAMENTE EN EL TODAS LAS RESPUESTAS Y EN LOS FEEDBACKS
  Disabled2() {
    if (this.myForm2.value.respuestaCorrecta === '' || this.myForm2.value.respuestaIncorrecta1 === '' ||
     this.myForm2.value.respuestaIncorrecta2 === '' || this.myForm2.value.respuestaIncorrecta3 === '' ||
      this.myForm2.value.feedbackCorrecto === '' || this.myForm2.value.feedbackIncorrecto === '') {
      // Si alguno de los valores es igual a nada, entonces estará desactivado
      this.isDisabled2 = true;
    } else {
      // Si ambos son diferentes a nulo, estará activado.
      this.isDisabled2 = false;
    }
  }

 // Activa la función SeleccionarFicheroPreguntas
 ActivarInputInfo() {
  console.log('Activar input');
  document.getElementById('inputInfo').click();
}


   // Par abuscar el fichero JSON que contiene la info de la colección que se va
  // a cargar desde ficheros
  SeleccionarFicheroPreguntas($event) {
    const fileInfo = $event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(fileInfo);
    reader.onload = () => {
      try {
        this.infoPreguntas = JSON.parse(reader.result.toString());
        console.log ('Ya tengo las preguntas');
        console.log (this.infoPreguntas);
        Swal.fire('Las pregunta se han cargado correctamente', '', 'success');
        this.ficheroCargado = true;
      } catch (e) {
        Swal.fire('Error en el formato del fichero', '', 'error');
      }
    };
  }



  RegistrarPreguntas() {
    let cont = 0;
    this.infoPreguntas.forEach (pregunta => {
      this.peticionesAPI.CreaPregunta(pregunta, this.profesorId)
      .subscribe((res) => {
        if (res != null) {
          cont++;
          if (cont === this.infoPreguntas.length) {
            Swal.fire('Las pregunta se han registrado correctamente', '', 'success');
            this.finalizar = true;
            this.goBack();
          }
        } else {
          console.log('Fallo en la creacion de la pregunta');
        }
      });
    });
  }

  Cancelar() {
    this.router.navigate(['/inicio/' + this.profesorId]);
  }
}
