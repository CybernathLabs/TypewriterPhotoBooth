// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const serialport = require('serialport')
const createTable = require('data-table')
const stringBuf = require('./stringbuffer')
require('./jscii')

// Holds reference to serial port connection, once connected.
let port; 

// Holds string and releases one char at a time.
let stringBuffer = new stringBuf();

var webcamJscii;

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
    });
/*document.getElementById("booper").addEventListener("click",function(e){
    //e.currentTarget.styles.display = 'none;'
	if(!port || !port.isOpen){
		console.log("Opening Port");
		//openSerialPort("/dev/cu.usbmodem1421");
        openSerialPort("/dev/cu.usbmodem1411");
        //openSerialPort("/dev/cu.usbserial-00002114");
        
	}else{
	//	doBoop();
	   console.info("BOOPED");
	   }
   })
*/
function openSerialPort(portname){
    console.log("Opening: ",portname)
    // Inits speed of 115200 and     
    // Queues incoming data until a new line is received.
    var opts = {  
        parser: serialport.parsers.readline("\n"),
        baudRate:115200
    };
    port = new serialport(portname,opts);
    
    // Register Serial Events
    port.on('open',()=>{onPortOpen(portname)})
    port.on('error', onPortError);
    port.on('data',onData);
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
    port.write(new Buffer(c,'utf8'));
}

//Once confirmation is received, we check for more pending data.
function onData(chunk){
	console.info("I has Data:",chunk,stringBuffer.getLength());
    if(chunk.substr(0,2) == "ok" && stringBuffer.getLength() > 0){
        // Ready to send more data.
        sendChar();
    }
}

function initVideo(e){
    console.log("Init Video",e.data)
   // navigator.mediaDevices.enumerateDevices().then((md)=>{console.log(md)})
    
    webcamJscii = new Jscii({
        cameraId: e.data,
        el: document.getElementById('jscii-element-webrtc'),
        width:110, // landscape...  80=portrait
        webrtc: true
    });
    jQuery("#config").hide();
    videoContainer = document.getElementById("jscii-element-webrtc")
    $(videoContainer).show();
    if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
      else if (videoContainer.mozRequestFullScreen) videoContainer.mozRequestFullScreen();
      else if (videoContainer.webkitRequestFullScreen) videoContainer.webkitRequestFullScreen();
      else if (videoContainer.msRequestFullscreen) videoContainer.msRequestFullscreen();
    
}

function getPic(){
    if(stringBuffer.getLength() > 0){
        console.warn("Serial Buffer is not clear");
        return;
    }
    var str = webcamJscii.getAsciiString();
    str = str.replace(/&nbsp;/g,' ');
    str = str.replace(/\~/g,'-');
    console.log(str);
    if(port && port.isOpen){
//        stringBuffer.push(str + "\rMaker Faire Orlando 2017\rCybernath Labs\r\r\r\r\r\r\r");
        stringBuffer.push(str + "\rPicture by 'PhotoTYPE'\rCybernath Labs & MakerFX Makerspace\r\r\r\r\r\r\r");
        sendChar();
    }
}

// Enables callback from DOM.  TODO: Figure out what the "correct" way is.
document.openSerialPort = openSerialPort;