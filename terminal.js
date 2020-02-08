#!/usr/bin/env node
/* eslint new-cap: "off" */

'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const moment = require('moment');
const follow = require('text-file-follower');

const follower = follow('/home/cyberdelahoz95/Developer/service.log');
let connectedCount = 0;

const screen = blessed.screen();

const tourniquets = new Map();
const connectedTourniquets = [];

let selected = {
  ip: null,
};

const grid = new contrib.grid({
  rows: 2,
  cols: 5,
  screen
});

const tree = grid.set(0, 0, 1, 1, contrib.tree, {
  label: 'Torniquetes detectados'
});

const codesLogs = grid.set(0,1,1,1, contrib.log,{
  fg: "green",
  selectedFg: "green", 
  label: 'Codigos Recibidos'
});

const responseLogs = grid.set(0,2,1,1, contrib.log,{
  fg: "green",
  selectedFg: "green", 
  label: 'Resultados'
});

const confirmLogs = grid.set(0,3,1,1, contrib.log,{
  fg: "green",
  selectedFg: "green", 
  label: 'Confirmaciones'
});

const errorLogs = grid.set(0,4,1,1, contrib.log,{
  fg: "red",
  selectedFg: "red", 
  label: 'Errores'
});

const line = grid.set(1, 0, 1, 5, contrib.line, {
  label: 'Actividad',
  showLegend: true,
  minY: 0,
  wholeNumbersOnly: true,
  xPadding: 5
});

follower.on('line', (_filename, line) => {
  const message = line.split('-');    
  switch (message[0]) {
    case process.env.CONNECTED:      
      connectedCount++;      
      if(!tourniquets.has(message[1])){ // message[1] contains IP of connected tourniquet
        tourniquets.set(message[1],{barcodes:[],confirmations:[],errors:[], responses:[]});
      }
      connectedTourniquets.push({timestamp:moment().format('HH:mm:ss'),connected:connectedCount});
    break;
    case process.env.BARCODE:
      if(selected.ip && selected.ip === message[1])
        codesLogs.log(`${message[1]} - ${message[2]}`);
    break;
    case process.env.RESPONSE:
      if(selected.ip && selected.ip === message[1])
        responseLogs.log(`${message[1]} - ${message[2]} - ${message[3]}`);
    break;
    case process.env.CONFIRMATION:
      if(selected.ip && selected.ip === message[1])
        confirmLogs.log(`${message[1]} - ${message[2]}`);     
      
      connectedCount--;
      connectedTourniquets.push({timestamp:moment().format('HH:mm:ss'),connected:connectedCount});
    break;
    case process.env.ERROR:
      if(selected.ip && selected.ip === message[1])
        errorLogs.log(`${message[1]} - ${message[2]}`);       
      
      connectedCount--;
      connectedTourniquets.push({timestamp:moment().format('HH:mm:ss'),connected:connectedCount});
    break;
  }
  renderData();
});

const renderData = () => {  
  const treeData = {};
  for (let [ ip ] of tourniquets) {
    const title = ip;
    treeData[title] = {};
  }
  
  tree.setData({ 
    extended: true,
    children: Object.assign({},treeData,{'Acciones':{extended: true,children:{'Reiniciar':{}}}})
  });

  renderActivity();  
};

const renderActivity = () => {  
  const values = connectedTourniquets;
  const series = [{
    title: 'Conexiones',
    x: values.map(v => v.timestamp).slice(-10),
    y: values.map(v => v.connected).slice(-10)
  }];

  line.setData(series);
  screen.render();
};

screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => {
  process.exit(0);
});

tree.on('select', node => {    
  const { name } = node;
  selected.ip = name;    
});

tree.focus();
screen.render();
follower.close();