// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const serialport = require('serialport')
const Readline = require('@serialport/parser-readline')
const createTable = require('data-table')
const stringBuf = require('./stringbuffer')
const {ipcRenderer} = require('electron');

// require('./jscii')

const asciiConv = require('./asciiConversion');

const fs = require('fs');
const path = require('path')
const os = require('os');
const homeDir = os.homedir();


const {BrowserWindow} = require('electron').remote
const url = require('url')

let lineParser = new Readline({ delimiter:"\n"})

// Holds reference to serial port connection, once connected.
let port; 

// Holds string and releases one char at a time.
let stringBuffer = new stringBuf();

// Holds our ASCII converter instance.
let asciiConversion = new asciiConv();

console.log("Homedir:",homeDir)

serialport.list((err, ports) => {
  cDiv = document.getElementById("cxnDisp")
  console.log('ports', ports);
    if(err){ console.log(err); }
    for(var i = 0; i < ports.length; i++){
        cDiv.innerHTML += '<button onclick="openSerialPort(\'' + ports[i].comName + '\')">' + ports[i].comName + "</button>";
    }
})

navigator.mediaDevices.enumerateDevices().then((md)=>{
    console.log(md)
    for(var i = 0; i < md.length; i++){
        if(md[i].kind == 'videoinput'){
            console.info(md[i].label,md[i].deviceId)
            btn = $("<button>"+md[i].label+"</button>").click(md[i].deviceId,initVideo);
            $("#vidDisp").append(btn)
        }
    }
})


window.addEventListener('keydown', function(evt) {
        if (evt.keyCode == 32) {
            evt.preventDefault();
            getPic();
        }
        if(evt.keyCode == 13){
            win = new BrowserWindow({width: 400, height: 300,fullscreen:false});
            win.loadURL(url.format({
            pathname: path.join(__dirname, 'test.html'),
            protocol: 'file:',
            slashes: true
        }))
        }
        if(evt.keyCode == 74 && evt.altKey && evt.metaKey){
            ipcRenderer.sendSync('debug', true)
        }
    });

function openSerialPort(portname){
    console.log("Opening: ",portname)
    // Inits speed of 115200 and     
    // Queues incoming data until a new line is received.
    var opts = {  
        parser: lineParser,
        baudRate:115200
    };
    port = new serialport(portname,opts);
	port.pipe(lineParser);
    
    // Register Serial Events
    port.on('open',()=>{onPortOpen(portname)})
    port.on('error', onPortError);
    lineParser.on('data',onData);
}

function onPortError(err){
    console.error(err);
    $("button","#cxnDisp").removeAttr("disabled");
}

function onPortOpen(n){
    console.log("Port Opened",n)
    $("button","#cxnDisp").attr("disabled","disabled");
    $("#cxnStatus").text("Connected to " + n)
    
}

// Vomits a bunch of text into the buffer and kicks off sending.
function doBoop(){
	stringBuffer.push("                              ``-/+oosyysssso+:-``   `                          \r                            .:osyyysyyssyyyyyyyys+:.`                           \r                          ./syyyssyyssssyyyyyssyysys/.                          \r                        `:syoooosyyysyyyyysyyyssooosys:` ``                     \r                       `+yo-````./sysyyyyyyyss/.```.-oy/`` `                    \r                      `/yy-   `` .+yyyyyyyssy+.   ```:ys/```                    \r                     `:syy/`   ``-osyyyyyyysyo-`  ` `/yys-                      \r                     `+yysyo:--:+sysyyyyyssysys+:-:/oyyss/`                     \r                     ./oo++ooooooooooooooo+oo+ooooooooo++/`                     \r                    `-/////////////////+++///////////////:.`                    \r                  `/oyyyyyyyssssssssyyyyssssssyyyssssssyyyys/`                  \r          ``.....`/sysysyyyyyysssyyso++//+oosyyyssyyyysyyysss/`.....```         \r     `.-/osssssso-+yssysssyyyyyys/-.`  `   `.-/ssyyyysyyyysyy/.osysssoo+:.`     \r   `-+ssssyyyyyso.+yyyysyyyyyys:-::-.`    `----::oysyyyyyyssy/.osyssyyyssy+-`   \r` .+syyyyyysyyyso.+ysyysyyyyso..oyyss-   `:ysyyo`.+ysyyyyyyyy/.osyssssyyysyy+.  \r`-oyyyyyyyyyyyyso-+syysyssyso.``syysso`  .oysyss `.oyssssssyy+-oyyyyyyyyyyysso-`\r.oyysyyyyyyyyyyso-+syyyysyyy/` `syysyy:``:yyosys  `/yyyyyyyyy+.oyyyyyyyyysssyyo.\r+yssysyyyysyyyyso.://///////.  `oys/sss--ss++sys`  -/:///////-.sysyyyyyyyyssyyy/\roysyyyyyyyyyyyyso-osssysssss/`  oyy:/sy++ys-/yys  `/sssssssss/-oysyyyyyyyyyyyyyo\roysyysyyyyyyysyso-oyysyssysyo-``oys-.+ysys/`/syo` -oyyyyyyyys/.osyyyyyyyyysysyyo\r/++ossyyyyyysoo+/.oyyyysysysyo-.oyy-`-oyyo``/yyo`-syysyyyyyys/./++oysyssyyso+++/\r`` `/yyyyyyyy:`  `oysysyyyyyyys+/--`  `..`  ..-:/oyysyyyyyyyy+````:ysysyyyy/`   \r```-+yyyyyyyy+.  `oyyssysyyyssyyso/-```````.-/osssssyyyyyyyyy+`  -+syysyyys+-   \r  `sssyyyyyysss` `:syysyyyyyyysssyysssoooossyyyssyyyyyssyysys: ``oysyyysyysys`  \r  .yyyyyyyyyyss.  `-+syyyssssyyyyyysyyyyysssyyyyssssyyyyyys+-`  .syyyyysyyyss.  \r  /yyyyyyyyyyyy:    `.-::::::::::::----------::::::::::::-``  ` :syyyyssyyyyy:  \r `+yysyyyyyysyy+     `/ysssssssssso.        .osssssssssss/`    `+yyyyyssyysyy+  \r `oyysyyyyyysyyo`    `/yyyyyyyysyso.        .oysyyyyyysys/`    `oysyyyysyyyyyo` \r -syysyyyyyyyyys-     /yyyyyyyysyso.        .oysyyyyyysys/     -ossyyyyyyyyyys- \r`:yysyyyyyyyysyy:    `/yyyyyyyyyyyo.        .oyyyyyyyyyyy/``  `:syyyyyyyyyssss:`\r`.:::::::::://:/.`````:////////////`        `:///////////-``   -/:::::::::::/:. \r`-osssyysssssyss:` `+sysssyysssyyys:       `:ssysssssyyssss+   :sssyyssyyyysso-`\r `-sysssysssyssy:  .syyyyyyyyysssys/       `+yyyyyyyyyssyyyo. `:yyyyyssyysyyo:` \r   ./syyyyyyyssy: `:sssyyyyyyysssys+       `oyysyyyyyyyyyyys: `/ysyyysssyys/.   \r     `:/oyysyssy: `+yyyyyyyyyssysyyo       `sysyyyyyyyyyyyyy+``/yssyysso+-``    \r        ``.-:://-`-ssssyyyyyyysyyyys`      .sysyyyyyyyyyyyyyo-`.//::-.``        \r                 `/ysyyyyyyyyyyyyyys.     `-syysyyyyyyyyyyyys:`                 \r                 `/+++o+++++++++++++.`    `-+++++++++++++++++/`  `              \r             ``./+oooososssssssssssso-`  `-oossssssssssssssosso/.`              \r             `+sssyyyyyyyyyyyyyyyyyys:   `:ssyssyyyyyyyyyyyyssyys+`             \r            ``/osooooooooooooooooooos-   `-oooooooooooooooooooooo/          \r");
    sendChar();
}

//Pulls next character from the buffer and sends.
function sendChar(){
    var c = stringBuffer.pull();
    console.log("Sending:",c);
    port.write(Buffer.from(c));
}

//Once confirmation is received, we check for more pending data.
function onData(chunk){
	console.info("I has Data:",chunk.toString(),stringBuffer.getLength());
    if(chunk.toString().substr(0,2) == "ok" && stringBuffer.getLength() > 0){
        // Ready to send more data.
        sendChar();
    }
}

function initVideo(e){
    console.log("Init Video",e.data)
    
    jQuery("#config").hide();
    videoContainer = document.getElementById("videoElement")
    $(videoContainer).show();

    navigator.mediaDevices.getUserMedia({video:{exact:'e.data'}})
        .then((s)=>{videoContainer.srcObject = s})
    
}

function getPic(){
    var vid = document.getElementById("videoElement");
    var cvs = document.createElement("canvas");
    cvs.height = 480;
    cvs.width = 640;
    
    var context = cvs.getContext('2d');
//    context.fillStyle = "#AAA";
//    context.fillRect(0,0,640,480);
    context.drawImage(vid,0,0,cvs.width,cvs.height);
    formatPic(cvs)
    previewImg(cvs);
}
function formatPic(cvs){
    if(stringBuffer.getLength() > 0){
        console.warn("Serial Buffer is not clear");
        return;
    }
    //var str = webcamJscii.getAsciiString();
    asciiConversion.debugImg = document.getElementById("debugImg");
    var str = asciiConversion.getAsciiString(cvs,110);
    str = str.replace(/&nbsp;/g,' ');
    str = str.replace(/\~/g,'-');
    console.log(str);
    if(port && port.isOpen){
//        stringBuffer.push(str + "\rMaker Faire Orlando 2017\rCybernath Labs\r\r\r\r\r\r\r");
        stringBuffer.push(str + "\rPicture by 'PhotoTYPE'\rCybernath Labs & MakerFX Makerspace\r\r\r\r\r\r\r");
        sendChar();
    }
}

function previewImg(cvs){
    var img = document.getElementById("previewImg");

    var data = cvs.toDataURL('image/png');
    img.setAttribute('src',data);
    //console.log(data);
    
    // Spit Out Img
    
    var imageBuffer = processBase64Image(data);
    var imgName = 'MFO18-' + Date.now() + '.png';
    var savePath = path.join(homeDir,"MFO2018");
    
    console.log("File Path",savePath);
    console.log("imageBuffer",imageBuffer)
    
    if(!fs.existsSync(savePath)) fs.mkdirSync(savePath)
    
    fs.writeFile(path.join(savePath,imgName), imageBuffer.data, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
        
    });
}

function processBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

// Enables callback from DOM.  TODO: Figure out what the "correct" way is.
document.openSerialPort = openSerialPort;