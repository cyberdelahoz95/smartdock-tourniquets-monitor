var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.10.10:1883')
 
client.on('connect', function () {
  client.subscribe('connectedTourniquets', () => {});
  client.subscribe('disconnectedTourniquets', () => {});
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())  
});