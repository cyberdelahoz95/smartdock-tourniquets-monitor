#!/usr/bin/env node

'use strict'

/* eslint new-cap: "off" */
const blessed = require('blessed')
const contrib = require('blessed-contrib')
const moment = require('moment')
const mqtt = require('mqtt')

const mqttClient  = mqtt.connect('mqtt://192.168.10.10:1883')

const screen = blessed.screen()

const tourniquets = new Map()
const tourniquetsMetrics = new Map()

let extended = []

let selected = {
    ip: null,
    type: null
}

const grid = new contrib.grid({
    rows: 2,
    cols: 4,
    screen
})

const tree = grid.set(0, 0, 1, 1, contrib.tree, {
    label: 'Torniquetes'
})

const metricsTable = grid.set(0, 1, 1, 3, contrib.table, {
    label: 'Lecturas',
    showLegend: true,
    minY: 0,
    xPadding: 5
})

mqttClient.on('connect', () => {
    mqttClient.subscribe('connectedTourniquets', () => {});
    mqttClient.subscribe('disconnectedTourniquets', () => {});
})

mqttClient.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())  
    switch (topic) {
        case 'connectedTourniquets':
            if (!tourniquets.has(message)) {
                tourniquets.set(message,true)
                tourniquetsMetrics.set(message, {})
            }
        break;
    }
    renderData()
});

agent.on('agent/disconnected', payload => {
  const { uuid } = payload.agent

  if (agents.has(uuid)) {
    agents.delete(uuid)
    agentMetrics.delete(uuid)
  }

  renderData()
})

agent.on('agent/message', payload => {
  const { uuid } = payload.agent
  const { timestamp } = payload

  if (!agents.has(uuid)) {
    agents.set(uuid, payload.agent)
    agentMetrics.set(uuid, {})
  }

  const metrics = agentMetrics.get(uuid)

  payload.metrics.forEach(m => {
    const { type, value } = m

    if (!Array.isArray(metrics[type])) {
      metrics[type] = []
    }

    const length = metrics[type].length
    if (length >= 20) {
      metrics[type].shift()
    }

    metrics[type].push({
      value,
      timestamp: moment(timestamp).format('HH:mm:ss')
    })
  })

  renderData()
})

tree.on('select', node => {
  const { uuid } = node

  if (node.agent) {
    node.extended ? extended.push(uuid) : extended = extended.filter(e => e !== uuid)
    selected.uuid = null
    selected.type = null
    return
  }

  selected.uuid = uuid
  selected.type = node.type

  renderMetric()
})

function renderData () {
  const treeData = {}
  let idx = 0
  for (let [ uuid, val ] of agents) {
    const title = ` ${val.name} - (${val.pid})`
    treeData[title] = {
      uuid,
      agent: true,
      extended: extended.includes(uuid),
      children: {}
    }

    const metrics = agentMetrics.get(uuid)
    Object.keys(metrics).forEach(type => {
      const metric = {
        uuid,
        type,
        metric: true
      }

      const metricName = ` ${type} ${' '.repeat(1000)} ${idx++}`
      treeData[title].children[metricName] = metric
    })
  }

  tree.setData({
    extended: true,
    children: treeData
  })

  renderMetric()
}

function renderMetric () {
  if (!selected.uuid && !selected.type) {
    line.setData([{ x: [], y: [], title: '' }])
    screen.render()
    return
  }

  const metrics = agentMetrics.get(selected.uuid)
  const values = metrics[selected.type]
  const series = [{
    title: selected.type,
    x: values.map(v => v.timestamp).slice(-10),
    y: values.map(v => v.value).slice(-10)
  }]

  line.setData(series)
  screen.render()
}

screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => {
  process.exit(0)
})

agent.connect()
tree.focus()
screen.render()