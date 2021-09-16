import { Component, OnInit } from '@angular/core';
/* import colorLib from '@kurkle/color'; */
import { nls } from './nls';
/* import { FormBuilder, FormGroup, Validators } from '@angular/forms';*/
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { debounceTime, reduce } from 'rxjs/operators';
import { RestService } from '../rest.service';
import { SidebarService } from '../sidebar.service';
import { MapService } from '../map.service';
import * as XLSX from 'xlsx';

import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement, 
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip
} from 'chart.js';

//declare let $:any = jQuery;
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  //public formData: FormGroup;
  /* Localhost */
  private _url:string = "http://localhost:3000";
  /* Production */
  /*private _url:string = "https://idesep.senamhi.gob.pe/geocuenca";*/
  private _chartBHMensual: any;
  private _chartBHHistorico: any;
  private _chartER: any;
  private _chartPC: any;
  private _chartQD: any;
  private _chartRH: any;
  private _chartDeCambio: any;
  private _chartClimatologia: any;  
  private _selectCuenca:number = 137554;
  private _selectVariable:string = 'bh_pc';
  private _selectVariableText:string = '';
  public nls = nls;
  public listOptionCuenca:any = [];
  public listOptionEscenario:any = [];
  public radioGroup = new FormControl('', [Validators.required]);
  public Tab01 = "RadioPresente";
  public Tab02 = "RadioFuturo";
  public ID_Tab01 = `ID_${this.Tab01}`;
  public ID_Tab02 = `ID_${this.Tab02}`;
  public defaultRadio = this.Tab01; /* RADIO por defecto */
  /* public defaultSelect = "Evapotranspiración real"; // por defecto */
  public defaultSelectCuenca:number = 137554; // por defecto
  public defaultSelect = "bh_er"; // por defecto
  public dtOptions: DataTables.Settings = {};
  /* Validators.maxLength(10), Validators.minLength(4) */
  public emailCtrl = new FormControl('', [Validators.required]);  
  public imageMinam:string;
  public imageSenamhi:string;
  public imageLibelula:string;
  public imageGestion:string;
  public imageSuiza:string;
  public imageSsn:string;
  public content:string;
  public content_01:string;
  public content_02:string;
  public content_03:string;
  public content_0301:string;
  public content_04:string;

  constructor(
    private RestService:RestService,
    private SidebarService:SidebarService,
    private MapService:MapService
  ) {
    /* 350 mls */
    this.emailCtrl.valueChanges.pipe(debounceTime(500)).subscribe(value => { console.log(value); });
    //this.nls.checkBox.checkBoxFisrt;
    //this._selectVariableText = `% Cambio de Precipitación`;
    this._selectVariableText = `Precipitación (mm)`;
    this.imageMinam    = nls.img.minam;
    this.imageSenamhi  = nls.img.senamhi;
    this.imageLibelula = nls.img.libelula;
    this.imageGestion  = nls.img.gestion;
    this.imageSuiza    = nls.img.suiza;
    this.imageSsn      = nls.img.ssn;
    this.content = nls.text.content;
    this.content_01 = nls.about.content_01;
    this.content_02 = nls.about.content_02;
    this.content_03 = nls.about.content_03;
    this.content_0301 = nls.about.content_0301;
    this.content_04 = nls.about.content_04;
  }
  
  ngOnInit(): void {
    /* $("label[for='heber']").on("click", function() {}); */
    $(".toggleCheckbox").on("change",(event) => {
      const TARGET:any      = $(event)[0].target;
      const DATASET         = TARGET.dataset;
      const CHART:string    = DATASET.chart || "";
      const DATACHART       = (this as any)[CHART].config;
      const VARIABLE:string = DATASET.variable || "";
      if(TARGET.checked) {
        DATACHART.options.scales["x"].title.text = "Meses";
        this.loadDataBh_SerieMensual((this as any)[CHART], this._selectCuenca, VARIABLE, 'YYYY-MM');
      } else {
        DATACHART.options.scales["x"].title.text = "Diario";
        this.loadDataBh_SerieMensual((this as any)[CHART], this._selectCuenca, VARIABLE, 'YYYY-MM-DD');
      }      
    });
    this.loadDataCuenca();
    this.loadDataEscenario();    
    //Chart.register(...registerables);
    Chart.register(
      ArcElement,
      LineElement,
      BarElement,
      PointElement,
      BarController,
      BubbleController,
      DoughnutController,
      LineController,
      PieController,
      PolarAreaController,
      RadarController,
      ScatterController,
      CategoryScale,
      LinearScale,
      LogarithmicScale,
      RadialLinearScale,
      TimeScale,
      TimeSeriesScale,
      Decimation,
      Filler,
      Legend,
      Title,
      Tooltip
    );
    
    this.dtOptions = {
      /*pagingType: 'full_numbers',*/
      scrollX: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json'
      }
    };
    /* BEGIN - Balance hidrico */
    //$('#toggle-trigger').prop('checked', true).change()
    Chart.defaults.font.size = 12;
    //ABC.height(100);
    this._chartBHMensual = this.createChartBar(
      document.getElementById("ID_BHMensual"), 'Balance hídrico', 'Variables', 'Meses',
      'Precipitación (mm)', 'Evapotranspiración real (mm)', 'Escurrimiento (mm)'
    );
    this._chartBHHistorico = this.createChartBar(
      document.getElementById("ID_BHHistorico"), 'Balance histórico', 'Variables', 'Años',
      'Precipitación (mm)', 'Evapotranspiración real (mm)', 'Escurrimiento (mm)'
    );
    /* this.loadDataBh_Balance(this._chartBHMensual, this.defaultSelectCuenca, 'mm');     
    this.loadDataBh_Balance(this._chartBHHistorico, this.defaultSelectCuenca, 'YYYY'); */
    /* END - Balance hidrico */

    /* BEGIN - Serie Mensual */
    this._chartPC = this.createChartLine(document.getElementById("ID_BHPC"), 'Precipitación (mm)', 'Precipitación (mm)', 'Meses');
    this._chartER = this.createChartLine(document.getElementById("ID_BHER"), 'Evapotranspiración real (mm)', 'Evapotranspiración real (mm)', 'Meses');
    this._chartRH = this.createChartLine(document.getElementById("ID_BHRH"), 'Rendimiento hídrico (mm)', 'Rendimiento hídrico (mm)', 'Meses');
    this._chartQD = this.createChartLine(document.getElementById("ID_BHQD"), 'Caudal (m³/s)', 'Caudal (m3/s)', 'Meses');
    /* this.loadDataBh_SerieMensual(this._chartPC, this.defaultSelectCuenca, 'bh_pc', 'YYYY-MM');
    this.loadDataBh_SerieMensual(this._chartER, this.defaultSelectCuenca, 'bh_er', 'YYYY-MM');
    this.loadDataBh_SerieMensual(this._chartRH, this.defaultSelectCuenca, 'bh_rh', 'YYYY-MM');
    this.loadDataBh_SerieMensual(this._chartQD, this.defaultSelectCuenca, 'bh_qd', 'YYYY-MM'); */
    /* END - Serie Mensual */

    /* BEHIND - % De cambio */
    this._chartDeCambio = this.createChart_DeCambio(
      document.getElementById("ID_DeCambio"), "", "% Cambio de flujo", "Meses", "ACCESS 1.0", "HadGEM2-ES", "MPI-ESM-LR"
    );
    /* END - % De cambio */
    
    /* BEHIND -Climatologia */
    this._chartClimatologia = this.createChart_Climatologia(
      document.getElementById("ID_Climatologia"), "", "Caudal (m3/s)", "Meses", "Access 1.0", "HadGEM2-ES", "MPI-ESM-LR", "Observado"
    );
    /* END - Climatologia */

    /*this.loadDataBh_DeCambio(this._chartDeCambio, this.defaultSelectCuenca,'ACCESS 1.0', 'HadGEM2-ES', 'MPI-ESM-LR','Observado', 'bh_pc');
    this.loadDataBh_Climatologia(this._chartClimatologia, this.defaultSelectCuenca, 'ACCESS 1.0', 'HadGEM2-ES', 'MPI-ESM-LR', 'Observado', 'bh_pc');*/

    this.MapService.disparadorMap.subscribe( data => {
      /* let e:any = document.getElementById("Hola"); 
      console.log(e.options[e.selectedIndex].value); */
      if(data.boolean) {
        let idCuenca = <HTMLInputElement>document.getElementById("ID_Cuenca")!;
        this._selectCuenca =  data.legend.codigo;
        idCuenca.value = data.legend.codigo;
        this.loadDataBh_Balance(this._chartBHMensual, this._selectCuenca, 'mm'); 
        this.loadDataBh_Balance(this._chartBHHistorico, this._selectCuenca, 'YYYY');
        $('.toggleCheckbox').prop('checked', true).change();
        /* this.loadDataBh_SerieMensual(this._chartPC, this._selectCuenca, 'bh_pc', 'YYYY-MM');
        this.loadDataBh_SerieMensual(this._chartER, this._selectCuenca, 'bh_er', 'YYYY-MM');
        this.loadDataBh_SerieMensual(this._chartRH, this._selectCuenca, 'bh_rh', 'YYYY-MM');
        this.loadDataBh_SerieMensual(this._chartQD, this._selectCuenca, 'bh_qd', 'YYYY-MM'); */
        this.onChangeSelect();      
      }
    });
  }
  
  ngAfterViewInit() {
    this.onChangeRadio(null);
  }

  ngAfterContentInit() {}
  
  getEmail(event: Event) {
    event.preventDefault();
    /*console.log(this.emailCtrl.value);*/
  }

  exportExcel(nameChart:string, ): void
  {
    try {
      let arrJSON:Array<any> = [];                      
      const DATACHART       = (this as any)[nameChart].config;
      const TITLE           = DATACHART.options.plugins.title.text || 'Información';
      const SCALE_X         = DATACHART.options.scales["x"].title.text;
      const DATALABELS      = DATACHART.data.labels;
      const DATALABELLENGTH = DATACHART.data.labels.length;
      for(let H = 0; H < DATALABELLENGTH; H++) {
        let cell = {}; (cell as any)[SCALE_X]  = DATALABELS[H];
        const DATASETLENGTH     = DATACHART.data.datasets.length;
        for(let E = 0; E < DATASETLENGTH; E++) {
          const DATASETS    = DATACHART.data.datasets[E];
          const DATA        = DATASETS.data;
          const DATALABEL   = DATASETS.label;
          const DATALENGTH  = DATASETS.data.length;
          for(let B = 0; B < DATALENGTH; B++) {
            if(B == H) {
              (cell as any)[DATALABEL] = Math.abs(DATA[B]);
              break;
            }
          }   
        } 
        arrJSON.push(cell); 
      } 
      const ELEMENT = arrJSON;
      const WS: XLSX.WorkSheet = XLSX.utils.json_to_sheet(ELEMENT);
      const WB: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(WB, WS, TITLE);
      XLSX.writeFile(WB, `${TITLE}.xlsx`);
    } catch (error) {
      console.error(`ERROR: exportExcel => ${error.name} - ${error.message}`);
    }
  }
  
  exportGraphic(nameChart:string) {
    try {
      const DATACHART = (this as any)[nameChart];
      const TITLE = DATACHART.config.options.plugins.title.text || 'Información';      
      const DATE  = new Date();
      const ATAG  = document.createElement('a');      
      ATAG.href = DATACHART.toBase64Image();
      ATAG.download = `Grafico_${TITLE}_${DATE.getDate()}${DATE.getMonth()+1}${DATE.getFullYear()}_${DATE.getHours()}${DATE.getMinutes()}${DATE.getSeconds()}.png`;
      ATAG.click();
    } catch (error) {
      console.error(`ERROR: exportGraphic => ${error.name} - ${error.message}`);
    }
  }

  numberFormat(val:any) {
    try {
      if(isNaN(val)) {
        return val;
      } else {
        val = Math.round(val);/* e agrega para redondear */
        let valAbs = val/Math.abs(val);
        val = Math.abs(val);
        val = val.toString();
        val = val.split(/(?=(?:...)*$)/);
        val = val.join(',');
        //val = (valAbs == -1 ? '-'+val: val);
        val = (valAbs == -1 ? val: val);
        return val;
      }
    } catch (error) {
      console.error(`Error: numberFormat ${error.name} - ${error.message}`);
    }
  }

  onChangeRadio(htmlElement: any) {
    try {
      const element = htmlElement || null;
      const ID_Node = element === null ? `ID_${this.defaultRadio}` : element.id;
      /* element.value - element.id */
      document.getElementById(`${this.ID_Tab01}_Content`)!.style.display = "none";
      document.getElementById(`${this.ID_Tab02}_Content`)!.style.display = "none";
      document.getElementById(`${ID_Node}_Content`)!.style.display = "block";
    } catch (error) {
      console.error(`ERROR: onChangeRadio => ${error.name} - ${error.message}`);
    }
  }

  /* CBO - Cuenca */
  loadDataCuenca() {
    try {
      let arrOption:any = [{value: '', name: nls.select.cuenca}];
      this.RestService.get(`${this._url}/listCuenca`)
        .subscribe( response => {
          let _response:any = response;
          for (let h = 0; h < _response.length; h++) {
            const element = _response[h];
            arrOption.push({value: element.codigo, name: element.nombre});
          }
          this.listOptionCuenca = arrOption;
      });
    } catch (error) {
      console.error(`ERROR: loadDataCuenca => ${error.name} - ${error.message}`);
    } 
  }
  /* CBO - Escenario */
  loadDataEscenario() {
    try {
      //let arrOption:any = [{value: '', name: nls.select.escenario}];
      let arrOption:any = [];
      this.listOptionEscenario = arrOption;
      /* this.RestService.get(`${this._url}/listEscenario`)
        .subscribe( response => {
          let _response:any = response;
          for (let r = 0; r < _response.length; r++) {
            const element = _response[r];
            //arrOption.push({value: element.codigo, name: element.nombre});
            arrOption.push({value: element.nombre, name: element.nombre});
          }
          this.listOptionEscenario = arrOption;
      }); */
      arrOption.push(
        {value: 'bh_qd', name: 'Caudal (m³/s)', select:"false"},
        {value: 'bh_er', name: 'Evapotranspiración real (mm)', select:"false"},
        {value: 'bh_pc', name: 'Precipitación (mm)', select:"false"},
        {value: 'bh_rh', name: 'Rendimiento hídrico (mm)', select:"true"},
      );
      this.listOptionEscenario = arrOption;
    } catch (error) {
      console.error(`ERROR: loadDataEscenario => ${error.name} - ${error.message}`);
    }
  }

  createChartBar(paramID:any, paramTitle:any, yTitle:any, xTitle:any, label0:any, label1:any, label2:any) {
    //paramID.height(500);
    return new Chart(paramID, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: label0,
          data: [],
          backgroundColor: 'rgb(60,51,255)',
        }, {
          label: label1,
          data: [],
          backgroundColor: 'rgb(255,51,51)'
        }, {
          label: label2,
          data: [],
          backgroundColor: 'rgb(14,130,2)'
        }]        
      },
      options: {
        plugins: {
          title: {
            /*color: '#FFFFFF',*/
            display: true,
            text: paramTitle
          },
          /*legend: { labels: { color: '#FFFFFF' } },*/
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) { 
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += this.numberFormat(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        /*responsive: true,*/
        maintainAspectRatio: false,
        scales: {
          y: {
            stacked: true,
            ticks: {
              /*color: '#FFFFFF',*/
              callback: (value:any) => { return this.numberFormat(value); },
            },
            title: { /*color: '#FFFFFF',*/ display: true, text: yTitle},
            grid:  { /*color: '#FFFFFF',*/ lineWidth: 0.3 }
          },
          x: {
            stacked: true,
            title: { /*color: '#FFFFFF',*/ display: true, text: xTitle},
            grid:  { /*color: '#FFFFFF',*/ lineWidth: 0.3 }
          }          
        }
      }
    });
  }

  createChartLine(paramID:any, paramTitle:any, yTitle:any, xTitle:any) {
    return new Chart(paramID, {
      type: 'line',
      data: {
        labels: [''],
        datasets: [{
          label: paramTitle,
          backgroundColor:'rgba(51,104,255)',
          borderColor: 'rgba(51,104,255)',
          borderWidth: 1,
          data: [],
        }]
      },
      options: {
        elements: {
          point: { radius: 0 }
        },
        scales: {
          y: {
            stacked: true,
            /* ticks: { color: '#FFFFFF', callback: (value:any) => { return this.numberFormat(value); },}, */
            ticks: { callback: (value:any) => { return value.toFixed(2); } },
            title: { /*color: '#FFFFFF',*/ display: yTitle == ''? false : true, text: yTitle},
            grid:  { /*color: '#FFFFFF',*/ lineWidth: 0.3 }
          },
          x: {
            stacked: true,
            title: { /*color: '#FFFFFF',*/ display: xTitle == ''? false : true, text: xTitle},
            grid:  { /*color: '#FFFFFF',*/ lineWidth: 0.3 }
          }
        },
        plugins: {
          title:  { display: paramTitle==''? false : true, /*color: '#FFFFFF',*/ text: paramTitle },
          legend: { display: false, /*labels: { color: '#FFFFFF' }*/ },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) { 
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += this.numberFormat(context.parsed.y);
                }
                return label;
              }
            }
          }
        }
      }

    });
  } 

  createChart_DeCambio(paramID:any, paramTitle:any, yTitle:any, xTitle:any, label0:any, label1:any, label2:any) {
    return new Chart(paramID, {
      type: 'bar',
      data: {
        labels: [''],
        datasets: [{
          label: label0, data: [],
          backgroundColor: ['rgba(79, 255, 51, 1)'],
          borderColor: ['rgba(79, 255, 51, 1)']
        }, {
          label: label1, data: [],
          backgroundColor: ['rgba(51, 104, 255, 1)'],
          borderColor: ['rgba(51, 104, 255, 1)']
        }, {
          label: label2, data: [],
          backgroundColor: ['rgba(255, 172, 51, 1)'],
          borderColor: ['rgba(255, 172, 51, 1)']
        }]
      },
      options: {
        /*responsive: true,*/
        plugins: {
          title:  { display: paramTitle==''? false : true, /*color: '#FFFFFF',*/ text: paramTitle },
          legend: { position: 'top', /*labels: { color: '#FFFFFF'}*/ },
        },
        scales: {
          y: {
            stacked: false,
            /*
            ticks: {
              callback: (value:any) => { return this.numberFormat(value); },
              //color: '#FFFFFF'
            },
            */
            title: { /*color: '#FFFFFF',*/ display: yTitle == ''? false : true, text: yTitle },
            grid:  { /*color: '#FFFFFF',*/ lineWidth: 0.3 }
          },
          x: {
            stacked: false,
            title: { /*color: '#FFFFFF',*/ display: xTitle == ''? false : true, text: xTitle },
            grid:  { /*color: '#FFFFFF',*/ lineWidth: 0.3 }
          }
        }        
      }
    });
  }

  createChart_Climatologia(paramID:any, paramTitle:any, yTitle:any, xTitle:any, label0:any, label1:any, label2:any, label3:any) {
    return new Chart(paramID, {
      type: 'line',
      data: {
        labels: [''],
        datasets: [{
          label: label0, data: [],
          backgroundColor: 'rgba(79, 255, 51, 1)',
          borderColor: 'rgba(79, 255, 51, 1)'
        }, {
          label: label1, data: [],
          backgroundColor: 'rgba(51, 104, 255, 1)',
          borderColor: 'rgba(51, 104, 255, 1)'
        }, {
          label: label2, data: [],
          backgroundColor: 'rgba(255, 172, 51, 1)',
          borderColor: 'rgba(255, 172, 51, 1)'
        }, {
          label: label3, data: [],
          backgroundColor: 'rgba(216, 43, 6, 1)',
          borderColor: 'rgba(216, 43, 6, 1)'
        }]
      },
      options: {
        /*responsive: true,*/
        plugins: {
          title:  { display: paramTitle==''? false : true, /*color: '#FFFFFF',*/ text: paramTitle },
          legend: { position: 'top', /*labels: { color: '#FFFFFF'}*/ },
        },
        elements: {
          point: { radius: 0 }
        },
        scales: {
          y: {
            stacked: false,
            ticks: {
              /*callback: (value:any) => { return this.numberFormat(value); },*/
              callback: (value:any) => { return value.toFixed(4); },
              /*color: '#FFFFFF'*/
            },
            title: { /*color: '#FFFFFF',*/ display: yTitle == ''? false : true, text: yTitle },
            grid:  { /*color: '#FFFFFF',*/ lineWidth: 0.3 }
          },
          x: {
            stacked: false,
            title: { /*color: '#FFFFFF',*/ display: xTitle == ''? false : true, text: xTitle },
            grid:  { /*color: '#FFFFFF',*/ lineWidth: 0.3 }
          }
        }        
      }
    });
  }

  loadDataBh_Balance(paramCharts:any, paramCodigo:Number, paramVariable:String) {
    try {
      //let arrOption:any = [{value: '', name: nls.select.escenario}];
      this.RestService.get(`${this._url}/bhBalance/${paramCodigo}/${paramVariable}`)
        .subscribe( response => { 
          const _response:any = response;
          const _labels = _response.map((element:any) => { return element.fecha; });          
          const _dataPC = _response.map((element:any) => { 
            let elemVariable:number = parseFloat(element.variablepc);
            //let variableFixed:number = parseInt(elemVariable.toFixed(2)); return variableFixed;
            return elemVariable;
          });
          const _dataER = _response.map((element:any) => { 
            let elemVariable:number = parseFloat(element.variableer)*-1;
            //let variableFixed:number = parseInt(elemVariable.toFixed(2))*-1; return variableFixed;
            return elemVariable;
          });
          const _dataRH = _response.map((element:any) => {
            let elemVariable:number = parseFloat(element.variablerh)*-1;
            //let variableFixed:number = parseInt(elemVariable.toFixed(2))*-1; return variableFixed;
            return elemVariable;
          });
          /* _labels.map((item:any) => {paramCharts.data.labels.push(item);}); */
          paramCharts.data.labels = _labels;
          paramCharts.data.datasets[0].data = _dataPC;
          paramCharts.data.datasets[1].data = _dataER;
          paramCharts.data.datasets[2].data = _dataRH;
          paramCharts.update();
      });
    } catch (error) {
      console.error(`ERROR: loadDataBh_Balance => ${error.name} - ${error.message}`);
    }
  }

  loadDataBh_SerieMensual(paramCharts:any, paramCodigo:Number, paramVariable:String, paramFormat:String) {
    try {
      //let arrOption:any = [{value: '', name: nls.select.escenario}];
      this.RestService.get(`${this._url}/bhSerieMensual/${paramCodigo}/${paramVariable}/${paramFormat}`)
        .subscribe( response => { 
          const _response:any = response;
          const _labels = _response.map((element:any) => { return element.fecha; });
          const _data = _response.map((element:any) => { 
            let elemVariable:number = parseFloat(element.variable);
            //let variableFixed:number = parseInt(elemVariable.toFixed(2));
            //return variableFixed;
            return elemVariable;
          });

          if(paramCharts === null)
            return;
                   
          paramCharts.data.labels = _labels;
          /* _labels.map((item:any) => { paramCharts.data.labels.push(item); }); */
          paramCharts.data.datasets[0].data = _data;
          paramCharts.update();
      });
    } catch (error) {
      console.error(`ERROR: loadDataBh_SerieMensual => ${error.name} - ${error.message}`);
    }
  }

  loadDataBh_DeCambio(
    paramCharts:any, paramCodigo:Number, paramEscenario00:String, 
    paramEscenario01:String, paramEscenario02:String, paramEscenario03:String, paramVariable:String
  ) {
    try {
      if(paramEscenario03 != '') {
        this.RestService.get(`${this._url}/bh_DeCambio/${paramCodigo}/${paramEscenario03}/${paramVariable}`)
          .subscribe( response => { 
            const _response:any = response; 
            const _dataObservado = _response.map((element:any) => { 
              let elemCantidad:number = parseFloat(element.cantidad);
              //let cantidadFixed:number = parseInt(elemCantidad.toFixed(2));
              //return cantidadFixed;
              return elemCantidad;
            });

            if(paramEscenario00 != '') {
              this.RestService.get(`${this._url}/bh_DeCambio/${paramCodigo}/${paramEscenario00}/${paramVariable}`)
                .subscribe( response => { 
                  const _response:any = response;
                  const _data = _response.map((currentValue:any, index:any, array:any) => { 
                    let _currentValue:number = parseFloat(currentValue.cantidad);
                    // ((Access - OBS)/Access) * 100
                    let _currentValueFixed:any;
                    if((_currentValue == _dataObservado[index]) || Math.abs(_currentValue - _dataObservado[index]) < 0.1) {
                      //_currentValueFixed = 0.1;
                      _currentValueFixed = 0;
                    } else {
                      _currentValueFixed = ((_currentValue-_dataObservado[index])/_dataObservado[index])*100;
                    }
                    return _currentValueFixed;
                  });
                  paramCharts.data.datasets[0].data = _data;
                  paramCharts.update();
              });
            } else {
              paramCharts.data.datasets[0].data = [];
              paramCharts.update();
            }
            
            if(paramEscenario01 != '') {
              this.RestService.get(`${this._url}/bh_DeCambio/${paramCodigo}/${paramEscenario01}/${paramVariable}`)
                .subscribe( response => { 
                  const _response:any = response;
                  const _data = _response.map((currentValue:any, index:any, array:any) => { 
                    let _currentValue:number = parseFloat(currentValue.cantidad);
                    //_currentValue == 'O'? : 
                    //Data escenario == Data Observada o Valor absoluto
                    let _currentValueFixed:any;
                    if((_currentValue == _dataObservado[index]) || Math.abs(_currentValue - _dataObservado[index]) < 0.1) {
                      //_currentValueFixed = 0.1;
                      _currentValueFixed = 0;
                    } else {
                      _currentValueFixed = ((_currentValue-_dataObservado[index])/_dataObservado[index])*100;
                    }
                    return _currentValueFixed;
                  });
                  paramCharts.data.datasets[1].data = _data;
                  paramCharts.update();
              });
            } else {
              paramCharts.data.datasets[1].data = [];
              paramCharts.update();
            }
      
            if(paramEscenario02 != '') {
              this.RestService.get(`${this._url}/bh_DeCambio/${paramCodigo}/${paramEscenario02}/${paramVariable}`)
                .subscribe( response => { 
                  const _response:any = response;
                  const _data = _response.map((currentValue:any, index:any, array:any) => { 
                    let _currentValue:number = parseFloat(currentValue.cantidad);
                    let _currentValueFixed:any;
                    if((_currentValue == _dataObservado[index]) || Math.abs(_currentValue - _dataObservado[index]) < 0.1) {
                      //_currentValueFixed = 0.1;
                      _currentValueFixed = 0;
                    } else {
                      _currentValueFixed = ((_currentValue-_dataObservado[index])/_dataObservado[index])*100;
                    }
                    return _currentValueFixed;
                  });
                  paramCharts.data.datasets[2].data = _data;
                  paramCharts.update();
              });
            } else {
              paramCharts.data.datasets[2].data = [];
              paramCharts.update();
            }
            const LABELS = _response.map((element:any) => { return element.tiempo; }); 
            let labelY = this._selectVariableText.replace('(mm)', '');
            labelY = labelY.replace('(m³/s)', '');
            paramCharts.options.scales.y.title.text = `% Cambio de ${labelY}`;
            paramCharts.data.labels = LABELS;
            paramCharts.update();
        });
      } else {
        paramCharts.data.datasets[0].data = [];
        paramCharts.update();
      }      
    } catch (error) {
      console.error(`ERROR: loadDataBh_DeCambio => ${error.name} - ${error.message}`);
    }
  }

  loadDataBh_Climatologia(
    paramCharts:any, paramCodigo:Number, 
    paramEscenario00:String, paramEscenario01:String, 
    paramEscenario02:String, paramEscenario03:String, paramVariable:String
  ) {
    try {
      /* const {confirmed, deaths, recovered} = data;
      data: { labels: confirmed.map(item=> item.date), datasets: [{label: 'Label prueba',data: deaths.map(item => item.cases)}] } */
      if(paramEscenario00 != '') {
        this.RestService.get(`${this._url}/bh_Climatologia/${paramCodigo}/${paramEscenario00}/${paramVariable}`)
          .subscribe( response => { 
            const _response:any = response;
            const _dataPC = _response.map((element:any) => { 
              let elemCantidad:number = parseFloat(element.cantidad);
              return elemCantidad;
            });
            const _labels = _response.map((element:any) => { return element.tiempo; }); 
            paramCharts.data.labels = _labels;
            paramCharts.data.datasets[0].data = _dataPC;
            paramCharts.options.scales.y.title.text = this._selectVariableText
            paramCharts.update();
        });
      } else {
        paramCharts.data.datasets[0].data = [];
        paramCharts.update();
      }

      if(paramEscenario01 != '')
        this.RestService.get(`${this._url}/bh_Climatologia/${paramCodigo}/${paramEscenario01}/${paramVariable}`)
          .subscribe( response => { 
            const _response:any = response;
            const _dataPC = _response.map((element:any) => { 
              let elemCantidad:number = parseFloat(element.cantidad);
              //let cantidadFixed:number = parseInt(elemCantidad.toFixed(2));
              //return cantidadFixed;
              return elemCantidad;
            });
            const _labels = _response.map((element:any) => { return element.tiempo; }); 
            paramCharts.data.labels = _labels;
            paramCharts.data.datasets[1].data = _dataPC;
            paramCharts.update();
        });
      else {
        paramCharts.data.datasets[1].data = [];
        paramCharts.update();
      }

      if(paramEscenario02 != '')
        this.RestService.get(`${this._url}/bh_Climatologia/${paramCodigo}/${paramEscenario02}/${paramVariable}`)
          .subscribe( response => { 
            const _response:any = response;
            const _dataPC = _response.map((element:any) => { 
              let elemCantidad:number = parseFloat(element.cantidad);
              //let cantidadFixed:number = parseInt(elemCantidad.toFixed(2));
              //return cantidadFixed;
              return elemCantidad;
            });
            const _labels = _response.map((element:any) => { return element.tiempo; }); 
            paramCharts.data.labels = _labels;
            paramCharts.data.datasets[2].data = _dataPC;
            paramCharts.update();
        });
      else {
        paramCharts.data.datasets[2].data = [];
        paramCharts.update();
      }

      if(paramEscenario03 != '')
        this.RestService.get(`${this._url}/bh_Climatologia/${paramCodigo}/${paramEscenario03}/${paramVariable}`)
          .subscribe( response => { 
            const _response:any = response;
            const _dataPC = _response.map((element:any) => { 
              let elemCantidad:number = parseFloat(element.cantidad);
              //let cantidadFixed:number = parseInt(elemCantidad.toFixed(2));
              //return cantidadFixed;
              return elemCantidad;
            });
            const _labels = _response.map((element:any) => { return element.tiempo; }); 
            paramCharts.data.labels = _labels;
            paramCharts.data.datasets[3].data = _dataPC;
            paramCharts.update();
        });
      else {
        paramCharts.data.datasets[3].data = [];
        paramCharts.update();
      }      
    } catch (error) {
      console.error(`ERROR: loadDataBh_Climatologia => ${error.name} - ${error.message}`);
    }
  }

  /* CBO Change - Cuenca */
  onChangeCuenca(htmlElement: any) {
    try {
      let value = htmlElement.target.value;
      value = (value == '' ? 0: value);
      this._selectCuenca = parseInt(value);
      this.SidebarService.disparadorSidebar.emit({ 
        cuenca: this._selectCuenca,
        load: false /* Para que no vuelva a ejecuar las peticiones */
      });      
      this.loadDataBh_Balance(this._chartBHMensual, this._selectCuenca, 'mm'); 
      this.loadDataBh_Balance(this._chartBHHistorico, this._selectCuenca, 'YYYY');
      /* this.loadDataBh_SerieMensual(this._chartPC, this._selectCuenca, 'bh_pc', 'YYYY-MM');
      this.loadDataBh_SerieMensual(this._chartER, this._selectCuenca, 'bh_er', 'YYYY-MM');
      this.loadDataBh_SerieMensual(this._chartRH, this._selectCuenca, 'bh_rh', 'YYYY-MM');
      this.loadDataBh_SerieMensual(this._chartQD, this._selectCuenca, 'bh_qd', 'YYYY-MM'); */
      /* Resetear TOOGLE */
      $('.toggleCheckbox').prop('checked', true).change();
      this.onChangeSelect(); 
    } catch (error) {
      console.error(`ERROR: onChangeCuenca => ${error.name} - ${error.message}`);
    }
  }
  /* CBO Change - Escenario */
  onChangeVariable(htmlElement: any) {
    try {
      const value = htmlElement.target.value;
      /* this.loadDataBh_Climatologia(this._chartDeCambio01, value, 'mm'); */
      this._selectVariable = value;
      this._selectVariableText = `${htmlElement.target.options[htmlElement.target.options.selectedIndex].text}`;
      /* this.loadDataBh_Delta(this._chartClimatologia01, value, 'YYYY'); */
      this.onChangeSelect();      
    } catch (error) {
      console.error(`ERROR: onChangeVariable => ${error.name} - ${error.message}`);
    }
  }

  onChangeSelect() {
    try {
      const CUENCA   = this._selectCuenca;
      const VARIABLE = this._selectVariable;
      /* if(VARIABLE == 'ACCESS 1.0') {
        //this.loadDataBh_DeCambio(this._chartDeCambio, valuePresente, 'ACCESS 1.0', '', '','Observado');
        this.loadDataBh_Climatologia(this._chartClimatologia, CUENCA , 'ACCESS 1.0', '', '', '');
      } else if(VARIABLE == 'HadGEM2-ES') {
        //this.loadDataBh_DeCambio(this._chartDeCambio, valuePresente, '', 'HadGEM2-ES', '','Observado');
        this.loadDataBh_Climatologia(this._chartClimatologia, CUENCA , '', 'HadGEM2-ES', '', '');        
      } else if(VARIABLE == 'MPI-ESM-LR') {
        //this.loadDataBh_DeCambio(this._chartDeCambio, valuePresente, '', '', 'MPI-ESM-LR','Observado');
        this.loadDataBh_Climatologia(this._chartClimatologia, CUENCA , '', '', 'MPI-ESM-LR', '');
      } else if(VARIABLE == 'Observado') {
        this.loadDataBh_Climatologia(this._chartClimatologia, CUENCA , '', '', '', 'Observado');
      } else {
        //this.loadDataBh_DeCambio(this._chartDeCambio, valuePresente, 'ACCESS 1.0', 'HadGEM2-ES', 'MPI-ESM-LR','Observado');
        this.loadDataBh_Climatologia(this._chartClimatologia, CUENCA , 'ACCESS 1.0', 'HadGEM2-ES', 'MPI-ESM-LR', 'Observado');
      } */
      this.loadDataBh_Climatologia(
        this._chartClimatologia, CUENCA, 'ACCESS 1.0', 'HadGEM2-ES', 'MPI-ESM-LR', 'Observado', VARIABLE
      );

      this.loadDataBh_DeCambio(
        this._chartDeCambio, CUENCA, 'ACCESS 1.0', 'HadGEM2-ES', 'MPI-ESM-LR', 'Observado', VARIABLE
      );
    } catch (error) {
      console.error(`ERROR: onChangeSelect => ${error.name} - ${error.message}`);
    }
  }
}