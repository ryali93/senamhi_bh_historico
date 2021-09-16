import {  Component, OnDestroy, OnInit} from '@angular/core';
import { MapService } from '../map.service';
import { SidebarService } from '../sidebar.service';
import { nls } from './nls';
import * as turf from '@turf/turf';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

declare let L:any;

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnDestroy, OnInit {
    public imageLayers:string;
    public imageBasemap:string;
    public imageMinam:string;
    public imageSenamhi:string;
    public iconMinam:string;
    public iconSenamhi:string;
    public urlMinam:string;
    public urlSenamhi:string;
    public mapLeaflet:any;
    public listWidget:Array<any> = [];
    public dataListLayer:any;
    public features:any;
    public cuencaPolygon:any;
    public cuencaLabel:any;
    public cuencaLabel2:any;
    public nls = nls;
    //private _map: MapService, 
    constructor(private MapService:MapService, private SidebarService:SidebarService) {
        /* Widget Z-Index */
        (window as any).initialize_zIndex = 401;
        this.imageLayers  = nls.icon.listLayer;
        this.imageBasemap = nls.icon.baseMap;
        this.imageMinam   = nls.img.minam;
        this.imageSenamhi = nls.img.senamhi;
        this.iconMinam   = nls.icon.minam;
        this.iconSenamhi = nls.icon.senamhi;
        this.urlMinam = nls.web.minam;
        this.urlSenamhi = nls.web.senamhi;
        
        /*this.map.disparadorMap.subscribe(data => (
        console.log("Recibiendo data:", data)
        ));*/ 
    }

    ngOnInit() {
        this.dataListLayer = this.initializeMap();
        
        this.SidebarService.disparadorSidebar.subscribe( data => {
            /* data.load = false. Como viene del un select para que no recargue */
            this.loadCuenca(data.cuenca, data.load);
        });
        
        /* Bing Map
        L.tileLayer.bing(
            'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L'
        ).addTo(this.mapLeaflet);
        */
        this.listWidget = [{
            title: "Mapa Base", icon: "assets/img/map/basemap/basemap_50.png",
            top: "10px", right: "150px", bottom: "", left: ""
        },{
            title: "Lista de capas", icon: "assets/img/map/listlayer/layers.png",
            top: "10px", right: "200px", bottom: "", left: ""
        }];
        this.widgetDisablePropagation(document.querySelectorAll(`.widget-panel`));
        let nodeCloseTimes = document.querySelectorAll('.panel-btn .fa-times');
        this.widgetClose(nodeCloseTimes);
        this.widgetMinimizarMaximizar(document.querySelectorAll('.fa-angle-up'));
        this.widgetMinimizarMaximizar(document.querySelectorAll('.fa-angle-down'));
        document.getElementById("ID_HDRamosMendoza")!.click(); 
    }

    ngOnDestroy(): void{ }

    initializeMap() {
        const MAP_CENTER = [-10,-76];
        const MAP_ZOOM = 6;
        /* Map */
        this.mapLeaflet = L.map('map', { center: MAP_CENTER, zoom: 6, zoomControl: true }); 
        $.ajax('https://idesep.senamhi.gob.pe/geoserver/dhi_bh/wfs', {
            type: 'GET',
            data: {
                service: 'WFS',
                version: '1.0.0',
                request: 'GetFeature',
                typeName: 'dhi_bh:cuencas_oferta_hidrica',
                cql_filter: "1=1",
                srsname: 'EPSG:4326',
                outputFormat: 'application/json'
            }
        }).done((item) => {
            this.features = item.features;
            const polylineCalle = L.geoJson(this.features, {
                /*onEachFeature: (feature:any, layer:any) => {
                    const prop = feature.properties;
                    layer.bindPopup(`<div class="popup-content">
                        <strong>${prop.nombre}</strong>
                        <hr>
                        <p><strong>Código</strong>: ${prop.codigo}</p>
                        <p><strong>Nivel</strong>: ${prop.nivel}</p>
                        <p><strong>Área</strong>: ${prop.area_km2}</p>
                    </div>`);
                },*/
                onEachFeature: (feature:any, layer:any) => {
                    layer.on({
                        'mouseover': (event:any) => {
                            let layer = event.target;
                            layer.setStyle({
                                color: "#E22200",
                                fillColor: "#E22200",
                                fillOpacity: 0,                                
                                opacity: 1,
                                weight: 4
                            });
                        },
                        'mouseout': (event:any) => {
                            polylineCalle.setStyle({
                                color: "#96e200",
                                fillColor: "#43f8f5",
                                fillOpacity: 0,
                                opacity: 0,
                                radius: 8,
                                weight: 0
                            });
                        }
                    });
                },
                style: {
                    color: "#96e200",
                    fillColor: "#43f8f5",
                    fillOpacity: 0,
                    opacity: 0,
                    radius: 8,
                    weight: 0
                }, 
            }).addTo(this.mapLeaflet);
            polylineCalle.on('click', (event:any) => {
                this.loadCuenca(event.layer.feature.properties.codigo, true);
            });
            /* let polylineCalle = L.geoJson(features).addTo(this.mapLeaflet);
            salamancaMonumental.addLayer(polylineCalle); */
            /* polylineCalle.on('click', (ev:any) => {
                //ev.target.options.fillOpacity = 0.1;
                const prop = ev.layer.feature.properties;
                //ev.layer.feature.properties
                this.mapLeaflet.flyTo(ev.latlng, 8);
                //var poly = L.polygon(ev.layer.feature.geometry);
                //this.mapLeaflet.setView(poly.getBounds().getCenter(), MAP_ZOOM, { animation: true });
                L.popup().setLatLng(ev.latlng).setContent(`<div class="popup-content">
                    <strong>${prop.nombre}</strong>
                    <hr>
                    <p><strong>Código</strong>: ${prop.codigo}</p>
                    <p><strong>Nivel</strong>: ${prop.nivel}</p>
                    <p><strong>Área</strong>: ${prop.area_km2}</p>
                </div>`).openOn(this.mapLeaflet);
            }); */
        }).always( () => {
            $("#ID_Load").hide();
            this.loadCuenca(137554, true);
        });
        /*
    this.mapLeaflet.on("click", (e:any) => {
        let clickBounds = L.latLngBounds(e.latlng, e.latlng);
        let theMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.mapLeaflet);
        let intersectingFeatures = [];
        
        for (let l in this.mapLeaflet._layers) {
            
            let overlay = this.mapLeaflet._layers[l];
            if (overlay._layers) {
                
                for (let f in overlay._layers) {
                    
                    //let bounds;
                    //console.log(overlay._layers);
                    let feature = overlay._layers[f];
                    
                    //console.log(feature);
                    
                    if (typeof feature.toGeoJSON == 'function') {
                        //console.log(feature);
                        feature.eachLayer((layer:any) =>{
                            console.log(layer);
                        });
                        //console.log(feature.toGeoJSON());
                        //bounds = feature.getBounds();
                        //console.log(bounds);
                        //console.log(feature);
                        
                        //feature.eachLayer((layer:any) =>{
                            
                            //let isInside = turf.booleanPointInPolygon(theMarker.toGeoJSON(), feature.toGeoJSON());
                            //if (isInside) {
                            //    console.log(feature);        
                            //}
                            
                        //})
                            
                    }
                    

                    
                }    
            }
        }

        //console.log(intersectingFeatures.length);
        //var html = "Found features: " + intersectingFeatures.length + "<br/>" + intersectingFeatures.map(function(o) {

            //console.log(o.properties.type);
            //return o.properties.type
        //}).join('<br/>');

        //this.mapLeaflet.openPopup(html, e.latlng, {
        //    offset: L.point(0, -24)
        //});
    });
    */

    /**
     * 
     * "https://idesep.senamhi.gob.pe/geoserver/g_00_06/wms", { 
                        format: 'image/png',
                        transparent: true,
                        maxZoom: 30,
                        layers: '00_06_001_03_000_000_0000_00_00'
     * 
     */

    /*
                        var owsrootUrl = 'https://idesep.senamhi.gob.pe/geoserver/g_00_06/wfs';

                        var defaultParameters = {
                            service: 'WFS',
                            version: '1.0.0',
                            
                                request: 'GetFeature',
                            typeName: 'g_00_06:00_06_001_03_000_000_0000_00_00',
                            outputFormat: 'application/json',
                
                        };
                        var parameters = L.Util.extend(defaultParameters);
                
                        var URL = owsrootUrl + L.Util.getParamString(parameters);
                            
                        $.ajax({
                            url: URL,
                            //crossDomain: true,
    dataType: 'jsonp',
                            success: function (data) {
                                var geojson = new L.geoJson(data, {
                                    style: {"color":"#2ECCFA","weight":2},
                                    onEachFeature: function(feature:any, layer:any){
                                        layer.bindPopup("Has hecho click en " + feature.properties.name);
                                    }}
                                ).addTo(this.mapLeaflet);
                            }
                        });
                        */
    
    

/*
    var polygonPoints = [
        [37.786617, -122.404654],
        [37.797843, -122.407057],
        [37.798962, -122.398260], 
        [37.794299, -122.395234]];
    var poly = L.polygon(polygonPoints,{color: 'red'}).addTo(this.mapLeaflet);
    L.layerGroup([poly]).on('click', function() { 
        alert('Clicked on a member of the group!'); 
    }).addTo(this.mapLeaflet); 
    */




    /*
    let label = new L.Label()
    label.setContent("static label")
    label.setLatLng(poly.getBounds().getCenter())
    this.mapLeaflet.showLabel(label);
    */
    /*
    this.mapLeaflet.on('click', function(e:any) {
        console.log(e);
    });
    */
         //e.layer.properties;
        

    /* Home */  
    const nodeHome = document.getElementById("ID_Home")!;
    nodeHome.addEventListener('click', () => {
        this.mapLeaflet.setView(MAP_CENTER, MAP_ZOOM, { animation: true });
      /* this.mapLeaflet.flyTo(MAP_CENTER, MAP_ZOOM);
      this.map.setView(MAP_CENTER, MAP_ZOOM, { animation: true });
      map.setView(new L.LatLng(-10, -76), MAP_ZOOM);
      this.map.panTo(new L.LatLng(-10, -76)); */
    });
      

    /* Scale */
    L.control.scale({ 
        metric: true, 
        imperial: false, 
        updateWhenIdle: true 
    }).addTo(this.mapLeaflet);
    /* Coordinate */
    this.mapLeaflet.addEventListener('mousemove', (ev:any) => {
      try {
        let lat = ev.latlng.lat; let lng = ev.latlng.lng;
        document.getElementById('ID_Longitud')!.innerText = lng.toFixed(3);
        document.getElementById('ID_Latitud')!.innerText = lat.toFixed(3);
      } catch (error) {
        console.error(`Error: ${error.name} - ${error.message}`);
      }
    });
    /* Layers */
    const layerGroup_01 = {
        group: "Límite político",
        layers: [{
            active: true,
            name: "Límite de cuencas",
            layer: {
                type: "tileLayer.wms",
                args: [
                    "https://idesep.senamhi.gob.pe/geoserver/dhi_bh/wms", { 
                        format: 'image/png',
                        transparent: true,
                        maxZoom: 30,
                        layers: 'cuencas_oferta_hidrica'
                    }
                ]
            },
            widget: "ListaCapas"
        }, {
            active: true,
            name: "Límite departamental",
            layer: {
                type: "tileLayer.wms",
                args: [
                    "https://idesep.senamhi.gob.pe/geoserver/g_00_02/wms", { 
                        format: 'image/png',
                        transparent: true,
                        maxZoom: 30,
                        layers: '00_02_002_03_000_000_0000_00_00'
                    }
                ]
            },
            widget: "ListaCapas"
        }, {
            name: "Capital departamental",
            layer: {
                type: "tileLayer.wms",
                args: [
                    "https://idesep.senamhi.gob.pe/geoserver/g_00_01/wms", { 
                        format: 'image/png',
                        transparent: true,
                        maxZoom: 30,
                        layers: '00_01_001_03_000_000_0000_00_00'
                    }
                ]
            },
            widget: "ListaCapas"
        }, {            
            name: "Límite provincial",
            layer: {
                type: "tileLayer.wms",
                args: [
                    "https://idesep.senamhi.gob.pe/geoserver/g_00_02/wms", { 
                        format: 'image/png',
                        transparent:true,
                        maxZoom: 30,
                        layers: '00_02_003_03_000_000_0000_00_00'
                    }
                ]
            },
            widget: "ListaCapas"
        }, {
            name: "Capital provincial",
            layer: {
                type: "tileLayer.wms",
                args: [
                    "https://idesep.senamhi.gob.pe/geoserver/g_00_01/wms", { 
                        format: 'image/png',
                        transparent: true,
                        maxZoom: 30,
                        layers: '00_01_002_03_000_000_0000_00_00'
                    }
                ]
            },
            widget: "ListaCapas"
        }, {
            name: "Límite distrital",
            layer: {
                type: "tileLayer.wms",
                args: [
                    "https://idesep.senamhi.gob.pe/geoserver/g_carto_fundamento/wms", { 
                        format:'image/png',
                        transparent:true,
                        maxZoom:30,
                        layers:'distritos'
                    }
                ]
            },
            widget: "ListaCapas"
        }, {
            name: "Capital distrital",
            layer: {
                type: "tileLayer.wms",
                args: [
                    "https://idesep.senamhi.gob.pe/geoserver/g_00_01/wms", { 
                        format: 'image/png',
                        transparent: true,
                        maxZoom: 30,
                        layers: '00_01_003_03_000_000_0000_00_00'
                    }
                ]
            },
            widget: "ListaCapas"
        }      
      ]
  };
  
  /* Grupo 2*/
  
  const layerGroup_02 = {
        group: "Clima",
        layers:[{
                name: "Sectores climáticos",
                layer: {
                    type: "tileLayer.wms",
                    args: [
                        "https://idesep.senamhi.gob.pe/geoserver/g_00_02/wms",
                        {format: 'image/png',transparent:true,maxZoom:30,layers:'sectores_climaticos'}
                    ]
                },
                widget: "ListaCapas"
            },{
                name: "Clasificación climática",
                layer: {
                    type: "tileLayer.wms",
                    args: [
                        "https://idesep.senamhi.gob.pe/geoserver/g_05_01/wms",
                        {format:'image/png',transparent:true,maxZoom:30,layers:'05_01_001_03_001_512_2021_00_00'}
                    ]
                },
                widget: "ListaCapas"
            },{
                name: "Hidrografía",
                layer: {
                    type: "tileLayer.wms",
                    args: [
                        "https://idesep.senamhi.gob.pe/geoserver/g_00_05/wms",
                        {format: 'image/png',transparent:true,maxZoom:30,layers:'00_05_001_03_000_000_0000_00_00'}
                    ]
                },
                widget: "ListaCapas"
            },{
                name: "Lote Catastral",
                layer: {
                    type: "tileLayer.wms",
                    args: [
                        "http://geo.munisanisidro.gob.pe:8080/geoserver/msigeoportal/wms",
                        {format:'image/png',transparent:true,maxZoom:30,layers:'tg_lote'}
                    ]
                },
                widget: "ListaCapas"
            },{
                name: "Nombre de Áreas Verdes",
                layer: {
                    type: "tileLayer.wms",
                    args: [
                        "http://geo.munisanisidro.gob.pe:8080/geoserver/msigeoportal/wms",
                        {format:'image/png',transparent:true,maxZoom:30,layers:'nombres_areas_verdes'}
                    ]
                },
                widget: "ListaCapas"
        }]
      };
      

      const mapasBases = {
        basemap: {
            title: 'Mapas Bases',
            layers: [{
                group: "Basemap",
                collapsed: true,
                layers: [{
                    active: true,
                    img: "assets/img/map/basemap/ESRI-OpenStreetMap-map_200x133.jpg",
                    layer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors',
                        maxZoom: 30
                    }),
                    name: "OSM - Open Street Map"
                },{                            
                    img: "assets/img/map/basemap/MAPBOX-StreetsV11-map_200x133.png",
                    layer: L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                        attribution: 'Light V9 &copy; <a href="https://www.mapbox.com/" target="_blank">Mapbox</a>',
                        id: 'mapbox/light-v9',
                        maxZoom: 30
                    }),
                    name: "MAPBOX - Light v9"
                },{
                    img: "assets/img/map/basemap/MAPBOX-LightV9-map_200x133.png",
                    layer: L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                        attribution: 'Streets V11 &copy; <a href="https://www.mapbox.com/" target="_blank">Mapbox</a>',
                        id: 'mapbox/streets-v11',
                        maxZoom: 30
                    }),
                    name: "MAPBOX - Streets v11"
                },{
                    img: "assets/img/map/basemap/OSM_CARTO-rastertiles-voyager-map_200x133.png",
                    layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
                        attribution:`&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, 
                                    &copy; <a href="https://carto.com/about-carto/" target="_blank" >Rastertiles/voyager</a>`,
                        maxZoom: 30
                    }),
                    name: "OSM - CartoDB Rastertiles/voyager"
                },{                            
                    img: "assets/img/map/basemap/OSM_CARTO-light-all-map_200x133.png",
                    layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                        attribution:`&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, 
                                    &copy; <a href="https://carto.com/about-carto/" target="_blank" >Light</a>`,
                        maxZoom: 30
                    }),
                    name: "OSM - CartoDB Light"
                },{                            
                    img: "assets/img/map/basemap/OSM_CARTO-dark-all-map_200x133.png",
                    layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
                        attribution:`&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, 
                                    &copy; <a href="https://carto.com/about-carto/" target="_blank" >Dark</a>`,
                        maxZoom: 30
                    }),
                    name: "OSM - CartoDB Dark"
                },{                            
                    img: "assets/img/map/basemap/OSM_CARTO-spotify-dark-map_200x133.png",
                    layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/spotify_dark/{z}/{x}/{y}.png', {
                        attribution:`&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, 
                                    &copy; <a href="https://carto.com/about-carto/" target="_blank">Spotify dark</a>`,
                        maxZoom: 30
                    }),
                    name: "OSM - CartoDB Spotify dark"
                },{
                    img: "assets/img/map/basemap/ESRI-Imagery-map_200x133.jpg",
                    layer: L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Imagery Map © <a href="https://server.arcgisonline.com/ArcGIS/rest/services" target="_blank">ESRI</a>',
                        maxZoom: 30
                    }),
                    name: "ESRI - Imagery Map"
                },{
                    img: "assets/img/map/basemap/ESRI-Topografico-map_200x133.jpg",
                    layer: L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Topográfico © <a href="https://server.arcgisonline.com/ArcGIS/rest/services" target="_blank">ESRI</a>',
                        maxZoom: 30
                    }),
                    name: "ESRI - Topográfico"
                },{
                    img: "assets/img/map/basemap/ESRI-LightGrayCanvas-map_200x133.jpg",
                    layer: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Light Gray Canvas © <a href="https://server.arcgisonline.com/ArcGIS/rest/services" target="_blank">ESRI</a>',
                        maxZoom: 30
                    }),
                    name: "ESRI - Light Gray Canvas"
                },{ 
                    img: "assets/img/map/basemap/ESRI-DarkGrayCanvas-map_200x133.png",
                    layer: L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Dark Gray Canvas © <a href="https://server.arcgisonline.com/ArcGIS/rest/services" target="_blank">ESRI</a>',
                        maxZoom: 30
                    }),
                    name: "ESRI - Dark Gray Canvas"
                },{
                    img: "assets/img/map/basemap/ESRI-NationalGeographic-map_200x133.jpg",
                    layer: L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'National Geographic © <a href="https://server.arcgisonline.com/ArcGIS/rest/services" target="_blank">ESRI</a>',
                        maxZoom: 25
                    }),
                    name: "ESRI - National Geographic"
                },{
                    img: "assets/img/map/basemap/ESRI-Street-map_200x133.jpg",
                    layer: L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                        /*attribution: 'Tiles &copy; ESRI &mdash; ESRI, DeLorme, NAVTEQ',*/
                        attribution: 'Street Map © <a href="https://server.arcgisonline.com/ArcGIS/rest/services" target="_blank">ESRI</a>',
                        maxZoom: 30
                    }),
                    name: "ESRI - Street"
                },{
                    img: "assets/img/map/basemap/ESRI-Terrain-map_200x133.jpg",
                    layer: L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Terrain © <a href="https://server.arcgisonline.com/ArcGIS/rest/services" target="_blank">ESRI</a>',
                        maxZoom: 30
                    }),
                    name: "ESRI - Terrain"
                },{
                    img: "assets/img/map/basemap/ESRI-Oceans-map_200x133.jpg",
                    layer: L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Oceans © <a href="https://server.arcgisonline.com/ArcGIS/rest/services" target="_blank">ESRI</a>',
                        maxZoom: 30
                    }),
                    name: "ESRI - Oceans"
                }]
            }]
        }
    };
        /* on('click', function(ev:any) {
            console.log(ev);
            ev.target.options.fillOpacity = 0.5;
        }); */
        const listLayer = L.control.panelLayers(
        mapasBases.basemap.layers, 
        //[layerGroup_01, layerGroup_02],{
        [layerGroup_01],{
            title: mapasBases.basemap.title,
            position: 'topright',
            compact: true
        }).addTo(this.mapLeaflet); 
        // var myFeatureGroup = L.featureGroup().addTo(this.mapLeaflet).on("click", this.groupClick);
        // var marker, test;
        /* for (var i = 0; i < 20; i += 1) {
          test = "test " + i;
          marker = L.marker(getRandomLatLng()).addTo(myFeatureGroup).bindPopup("Marker " + test);
          marker.test = test;
        } */
        //var salamancaMonumental = L.layerGroup().addTo(this.mapLeaflet);
        //var salamancaMonumental = L.layerGroup();
        /* this.mapLeaflet.on("click", (event:any) => {
            if (this.mapLeaflet.getZoom() <= 9.5) {
                this.mapLeaflet.flyTo(event.latlng, 8);
                return;
            } else {
                this.mapLeaflet.flyTo(event.latlng);
            }
        }); */
        /* salamancaMonumental.on('click', (ev:any) => {
            console.log(ev);
        }); */
        /* this.mapLeaflet.eachLayer((layer:any) => {
            if( layer instanceof L.TileLayer){
                L.featureGroup([layer]).addTo(this.mapLeaflet);
            }
        }); */
        /* L.layerGroup(listLayer._layers).on('click', function() {    
            alert('Clicked on a member of the group!'); 
        }).addTo(this.mapLeaflet); */
        //console.log(mapasBases.basemap.layers);
        //console.log(listLayer._layers);
        /* this.mapLeaflet.on('click', (event:any) => {
            const lat = event.latlng.lat;
            const lon = event.latlng.lng;
            console.log(lat, lon);
            L.popup().setLatLng({lon: lon, lat: lat})
                .setContent('<p>Hello world!<br />This is a nice popup.</p>')
                .openOn(this.mapLeaflet);
            //let isInside = turf.booleanPointInPolygon(L.marker([lat,lon]).toGeoJSON(), this.mapLeaflet._layers[45].toGeoJSON());
            console.log(event.originalEvent);
            console.log(event.target);
        }); */        
        /* let layers:any = [];
        this.mapLeaflet.eachLayer(function(layer:any) {     
            if( layer instanceof L.TileLayer){
                //console.log(layer);
                layers.push(layer);
            }
        }); */
        /* L.featureGroup(layers)
            .bindPopup('Hello world!')
            .on('click', function() { 
                console.log('Clicked on a member of the group!'); 
            })
            .addTo(this.mapLeaflet); */
        return listLayer._layers;    
    }

    loadCuenca(codigo:number, booleanChart:boolean) {
        if (this.cuencaPolygon) {
            this.mapLeaflet.removeLayer(this.cuencaPolygon);
            this.mapLeaflet.removeLayer(this.cuencaLabel);
        }
        this.cuencaPolygon = L.geoJson(this.features, {
            filter: function(feature:any, layer:any) {
                //return (feature.properties.codigo == event.layer.feature.properties.codigo);
                return (feature.properties.codigo == codigo);
            },
            onEachFeature: (feature:any, layer:any) => {
                /* EMITIENDO DATOS A WIDGET DE LEYENDA */
                this.MapService.disparadorMap.emit({ 
                    legend: layer.feature.properties,
                    boolean: booleanChart
                });
                /* var group = new L.featureGroup([marker1, marker2, marker3]);
                map.fitBounds(group.getBounds()); */
                this.mapLeaflet.fitBounds(layer.getBounds()); /* ZOOM EXTENT */
                const centroId = layer.getBounds().getCenter();
                //this.mapLeaflet.setView(centroId, 8, { animation: true }); /* ZOOM SCALE */
                this.cuencaLabel = L.marker(centroId, {
                    icon: L.divIcon({
                        className: 'label',
                        html: `<div style="color: white; 
                        text-shadow: black 0.1em 0.1em 0.2em; 
                        font-weight: bolder; ">${feature.properties.nombre}</div>`,
                        iconSize: [100, 40]
                    })
                }).addTo(this.mapLeaflet)
            },/* font-size: 16px;
            -webkit-text-stroke: 0.4px black; 
            text-shadow: -1px -1px white, 1px 1px #333
            text-shadow: 0 0 3px #000000;
            text-shadow: black 0.1em 0.1em 0.2em */
            style: {
                radius: 8,
                fillColor: "#43f8f5",
                color: "#96e200",
                weight: 1,
                opacity: 0.5,
                fillOpacity: 0.8
            },
        }).addTo(this.mapLeaflet);  
    }

    groupClick(event:any) {
        console.log("Clicked on marker " + event.layer.test);
    }

    onClickWidgetOpen(nameWidget:any) {
        try {
            (window as any).initialize_zIndex = (parseInt((window as any).initialize_zIndex) + 1);
            let idStyle = document.getElementById(nameWidget)!.style;
            idStyle.display = "block";
            idStyle.zIndex = String((window as any).initialize_zIndex);
        } catch(error) {
            console.error(`ERROR: widgetWidthDefault => ${error.name} - ${error.message}`);
        }
    };

    widgetWidthDefault(nameWidget:any) {
        try {
            const widgetWidthDefault:any = {
                Widget_ListLayer : '275px',
                Widget_BaseMap   : '275px'
            };
            return widgetWidthDefault[nameWidget];
        } catch(error) {
            console.error(`ERROR: widgetWidthDefault => ${error.name} - ${error.message}`);
        }
    };

    /* Oculta el contenido del widget */
    widgetChangeContent(idNode:any, diplay:any) {
        try {
            let nodeElement:any = document.querySelectorAll(`#${idNode} div.widget-content`);
            for (let i = 0; i < nodeElement.length; i++) {
                if(diplay == 'none') {
                    nodeElement[i].style.display = "none";    
                } else if(diplay == 'block') {
                    nodeElement[i].style.display = "block";
                } else {
                    console.log('Parametro invalido');
                }                
            }
        } catch(error) { 
            console.error(`ERROR: widgetChangeContent => ${error.name} - ${error.message}`);
        }
    }

    /* BEGIN - MINIMIZAR y MAXIMIZAR el widget */
    widgetMinimizarMaximizar(elems:any) {
        try {
            for (let i=elems.length; i--;) {
                elems[i].addEventListener('click', (widgetWidthDefault:any) => {
                    try {
                        let nodeElement = elems[i].parentNode.parentNode.parentNode;
                        nodeElement.style.overflow = "hidden";
                        /* Oculta fa-angle-up */
                        elems[i].style.display = "none";
                        if (elems[i].classList[1] == "fa-angle-up") {
                            nodeElement.style.height = "34.19px";
                            nodeElement.style.width = "auto";
                            /* Muestra fa-angle-down*/
                            elems[i].nextElementSibling.style.display = "block";
                            this.widgetChangeContent(nodeElement.id,'none');
                        } else {
                            nodeElement.style.height = "auto";
                            elems[i].previousElementSibling.style.display = "block";
                            /* Le vuelve asignar el width por defecto */
                            nodeElement.style.width = this.widgetWidthDefault(nodeElement.id);
                            this.widgetChangeContent(nodeElement.id,'block');
                        }
                    } catch(error) { 
                        console.error(`${error.name} - ${error.message}.`);
                    }
                }, false);
            }
        } catch(error) { 
            console.error(`ERROR: widgetMinimizarMaximizar => ${error.name} - ${error.message}`);
        }
    };    
    /* END - MINIMIZAR y MAXIMIZAR el widget */

    /* BEGIN - Disable scroll propagation / Disable click propagation */
    widgetDisablePropagation(allDOM:any) { 
        try {
            for (const itemWidget of allDOM) {
                L.DomEvent.disableScrollPropagation(itemWidget);
                L.DomEvent.disableClickPropagation(itemWidget);
            }    
        } catch (error) {
            console.error(`ERROR: disablePropagation => ${error.name} - ${error.message}`);
        }
    }
    /* END - Disable scroll propagation / Disable click propagation */

    /* BEGIN - Close widget */
    widgetClose(elems:any) {
        try {
            for (let i=elems.length; i--;) {   
                elems[i].addEventListener('click', function() {
                    let styleId = elems[i].parentNode.parentNode.parentNode;
                    styleId.style.display="none";
                    // Se agregar esta linea para que refresque el TRANSFORM 
                        //va a la par con el setTimeout de "fnDraggable"
                    //styleId.setAttribute('style', 'transform:translate3d(0px,0px,0px)');
                }, false);
            }
        } catch(error) { console.error(`${error.name} - ${error.message}.`); }
    }
    /* END - Close widget */
}