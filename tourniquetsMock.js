const fs = require('fs');
const EOL = require('os').EOL;
const ips = ['192.168.1.1','192.168.1.2','192.168.1.3','192.168.1.4'];
const barcodes = ['ABC','DEF','GHI','JKL','MNO'];
const responses = ['Admitido','Rechazado','Invalido'];
const messagesFromTourniquets = ['K','E'];

setInterval(() => {
  const selectedIp = ips[Math.floor(Math.random() * ips.length)];
  const selectedBc = barcodes[Math.floor(Math.random() * barcodes.length)];
  const selectedResp = responses[Math.floor(Math.random() * responses.length)];
  const replyFromTour = messagesFromTourniquets[Math.floor(Math.random() * messagesFromTourniquets.length)];

  fs.appendFileSync('/home/cyberdelahoz95/Developer/service.log', `connected-${selectedIp}${EOL}`);
  fs.appendFileSync('/home/cyberdelahoz95/Developer/service.log', `barcodes-${selectedIp}-${selectedBc}${EOL}`);
  fs.appendFileSync('/home/cyberdelahoz95/Developer/service.log', `responses-${selectedIp}-${selectedBc}-${selectedResp}${EOL}`);
  if(replyFromTour === 'K' ){
    fs.appendFileSync('/home/cyberdelahoz95/Developer/service.log', `confirmations-${selectedIp}-A${EOL}`);
  }
  else {
    fs.appendFileSync('/home/cyberdelahoz95/Developer/service.log', `errors-${selectedIp}-E${EOL}`);
  }
},2000);