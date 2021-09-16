import { Component, OnInit, Output } from '@angular/core';
import { MapService } from '../map.service';
import * as XLSX from 'xlsx';
import { nls } from './nls';
//import ChartDataLabels from 'chartjs-plugin-datalabels';
/*import { SidebarComponent } from '../sidebar/sidebar.component';*/
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
/* ChartDataLabels. Se tiene instalado sinembargo no se usa por temas de tiempo
Chart.register(ChartDataLabels);
*/
@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})

export class LegendComponent implements OnInit {
  private _chartLegend01:any;
  private _chartLegend02:any;
  public paramCod:string  = "";
  public paramNom:string  = "..... Cargando CUENCA";
  public paramAAA:string  = "";
  public paramArea:string = "";
  public paramAltu:string = "";
  public paramPrec:string = "";
  public paramEvap:string = "";
  public paramIA:string   = "";
  public paramIAC:string  = "";
  public nls = nls;
  constructor(private MapService:MapService) {}
  //nls.select.cuenca

  ngOnInit(): void {
    this.MapService.disparadorMap.subscribe( data => {
      const LEYEND = data.legend;
      this.paramCod   = LEYEND.codigo;
      this.paramNom   = LEYEND.nombre;
      this.paramAAA   = LEYEND.aaa;
      this.paramArea  = LEYEND.ar_sqkm.toFixed(2);
      this.paramAltu  = LEYEND.amn.toFixed(2);
      this.paramPrec  = LEYEND.pcp.toFixed(2);
      this.paramEvap  = LEYEND.pet.toFixed(2);
      this.paramIA    = LEYEND.ia.toFixed(2);
      this.paramIAC   = LEYEND.ia_lab;
      this.chartBarUpdate(
        this._chartLegend01,
        [
          "Acrisoles",
          "Cambisoles",
          "Ferralsoles",
          "Gleysoles",
          "Phaeozems",
          "Litosoles",
          "Fluvisoles",
          "Kastanozems",
          "Nitosoles",
          "Regosoles",
          "Andosoles",
          "Vertisoles",
          "Xerosoles",
          "Planosoles"
        ],[
          LEYEND.acrisls,
          LEYEND.cambsls,
          LEYEND.frrlsls,
          LEYEND.gleysls,
          LEYEND.phaezms,
          LEYEND.litosls,
          LEYEND.fluvsls,
          LEYEND.kstnzms, 
          LEYEND.nitosls,
          LEYEND.regosls,
          LEYEND.andosls,
          LEYEND.vertsls,
          LEYEND.xerosls,
          LEYEND.plansls
        ],
        [
          "#dd1abd",
          "#ddee87",
          "#7de400",
          "#00dad3",
          "#af171c",
          "#dd5d1c",
          "#d5ad6b",
          "#517cd1",
          "#28c8a0",
          "#ece66a",
          "#4a8bda",
          "#9873c0",
          "#9768ef",
          "#006464"
        ]
      );

      this.chartBarUpdate(
        this._chartLegend02,
        [
          "Tierra secano",
          "Poca vegetación",
          "Bosque caduco",
          "Bosque perenne",
          "Tierra cultivo",
          "Pradera",
          "Matorral",
          "Áreas urbanas",
          "Cuerpos de agua",
          "Humedales",
          "Arbustos"
        ],[
          LEYEND.agrl,
          LEYEND.barr,
          LEYEND.frsd,
          LEYEND.frse,
          LEYEND.frst,
          LEYEND.past,
          LEYEND.rngb,
          LEYEND.urml,
          LEYEND.watr,
          LEYEND.wetf,
          LEYEND.wetl
        ],
        [
          "#dc0f0f",
          "#44ce5d",
          "#7533e6",
          "#de8313",
          "#dfef4d",
          "#98e16e",
          "#bb3cc9",
          "#455dca",
          "#3feabd",
          "#cf3c8d",
          "#64caef"
        ]
      );
    });    

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

    Chart.defaults.font.size = 12; 
    this._chartLegend01 = this.chartBarCreate(document.getElementById("ID_Legend01"), 'TIPO DE SUELO', 'Tipo de suelo', 'Área (%)');
    this._chartLegend02 = this.chartBarCreate(document.getElementById("ID_Legend02"), 'USO DE SUELO', 'Uso de Suelo', 'Área (%)');
  }

  exportExcel(nameChart:string): void
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
              (cell as any)[DATALABEL] = DATA[B];
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
        val = Math.round(val);
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
      console.error(`Error: numberFormat => ${error.name} - ${error.message}`);
    }
  }

  searchData(nameChart:string){
    let arrJSON:Array<any> = [];                      
      const DATACHART       = (this as any)[nameChart].config;
      const TITLE           = DATACHART.options.plugins.title.text || 'Información';
      const SCALE_Y         = DATACHART.options.scales["y"].title.text;
      const SCALE_X         = DATACHART.options.scales["x"].title.text;
      const DATALABELS      = DATACHART.data.labels;
      const DATALABELLENGTH = DATACHART.data.labels.length;
      for(let H = 0; H < DATALABELLENGTH; H++) {
        let cell = {}; (cell as any)[SCALE_Y]  = DATALABELS[H];
        const DATASETLENGTH     = DATACHART.data.datasets.length;
        for(let E = 0; E < DATASETLENGTH; E++) {
          const DATASETS    = DATACHART.data.datasets[E];
          const DATA        = DATASETS.data;
          const DATALABEL   = DATASETS.label || SCALE_X;
          const DATALENGTH  = DATASETS.data.length;
          for(let B = 0; B < DATALENGTH; B++) {
            if(B == H) {
              (cell as any)[DATALABEL] = DATA[B];
              break;
            }
          }   
        } 
        arrJSON.push(cell); 
      }
      return {paramJson: arrJSON, paramTitle: TITLE};
  }

  onClickExportCuenca() {
    const TITLE = this.paramNom;
    const ELEMENT = document.getElementById("ID_TableCuenca");
    //const WS: XLSX.WorkSheet = XLSX.utils.json_to_sheet(ELEMENT);
    const WS: XLSX.WorkSheet = XLSX.utils.table_to_sheet(ELEMENT);
    const WB: XLSX.WorkBook = XLSX.utils.book_new();
    const SUELOTIPO = this.searchData("_chartLegend01"); 
    const SUELOUSO  = this.searchData("_chartLegend02");    
    const WS_USO: XLSX.WorkSheet = XLSX.utils.json_to_sheet(SUELOUSO.paramJson);
    const WS_TIPO: XLSX.WorkSheet = XLSX.utils.json_to_sheet(SUELOTIPO.paramJson);
    XLSX.utils.book_append_sheet(WB, WS, TITLE);
    XLSX.utils.book_append_sheet(WB, WS_TIPO, SUELOTIPO.paramTitle);
    XLSX.utils.book_append_sheet(WB, WS_USO,  SUELOUSO.paramTitle);    
    XLSX.writeFile(WB,`${TITLE}.xlsx`);
  }

  chartBarCreate(paramID:any, paramTitle:any, yTitle:any, xTitle:any) {
    return new Chart(paramID, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
        }]        
      },
      options: {
        indexAxis: 'y',
        plugins: {
          title: {
            color: '#000000',
            display: paramTitle == ''? false : true,
            text: paramTitle
          },
          legend: { 
            labels: { color: '#000000' },
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) { 
                  label += ': ';
                }

                if (context.parsed.y !== null) {
                  //label += this.numberFormat(context.parsed.x);
                  label += context.parsed.x.toFixed(2);
                }
                return `${label}%`;
              }
            }
          },
         

        },
        responsive: false,    
        scales: {
          y: {
            stacked: true,
            ticks: { color: '#000000' },
            title: { color: '#000000', display:false, text: yTitle},
            grid:  { lineWidth: 0.1 }          
          },
          x: {
            stacked: true,
            ticks: { color: '#000000', callback: (value:any) => { return value; } },
            title: { color: '#000000', display:true, text: xTitle},
            grid:  { lineWidth: 0.1 }
          }          
        }        
      }
    });
  }

  chartBarUpdate(
    paramCharts:any,
    labels:Array<any>,
    data:Array<any>,
    color:Array<string>
  ) {
    try {
      paramCharts.data.labels = labels;
      paramCharts.data.datasets[0].backgroundColor = color;
      paramCharts.data.datasets[0].data = data;
      paramCharts.update();  
    } catch (error) {
      console.error(`ERROR: chartBarUpdate => ${error.name} - ${error.message}`);
    }    
  }
}