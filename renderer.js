// Monolithic JS file containing 90% of my logic.
// If my students submitted something like this, I'd cringe.

const serialport = require('serialport')
const Readline = require('@serialport/parser-readline')
//const createTable = require('data-table')
const stringBuf = require('./stringbuffer')
const {ipcRenderer} = require('electron');

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

// Queries attached cameras, microphones, and speakers.
// Displays buttons for camera choice.
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

        // Spacebar or B key (Remote) triggers photo to be taken.
        if (evt.keyCode == 32 || evt.keyCode == 66) {
            evt.preventDefault();
            getPic();
        }

        // Enter Key Opened a second window intended as a Preview Display
        // For a second monitor.  Not yet implemented.
        if(evt.keyCode == 13){
        //     win = new BrowserWindow({width: 400, height: 300,fullscreen:false});
        //     win.loadURL(url.format({
        //     pathname: path.join(__dirname, 'test.html'),
        //     protocol: 'file:',
        //     slashes: true
        // }))
        }
        
        // Attempted to have an "open debugger" hotkey.
        // Got as far as locking up and crashing the program.  Gave up for now.
        // if(evt.keyCode == 74 && evt.altKey && evt.metaKey){
        //     ipcRenderer.sendSync('debug', true)
        // }
    });

// Opens the specified port, and pipes the output to a parser that waits for a
// Newline before throwing events.
function openSerialPort(portname){
    console.log("Opening: ",portname)
    // Inits speed of 115200 and     
    // Queues incoming data until a new line is received.
    // TODO: Can I remove lineParser from the options here?
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

// Something went wrong with the selected port.
// Re-enables buttons to allow for a second try.
function onPortError(err){
    console.error(err);
    $("button","#cxnDisp").removeAttr("disabled");
}

// Something went right with the selected port.
// TODO: Consider a handshake with the typewriter to verify it's the desired device.
function onPortOpen(n){
    console.log("Port Opened",n)
    $("button","#cxnDisp").attr("disabled","disabled");
    $("#cxnStatus").text("Connected to " + n);
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

    // Update progress display.
    let prog = document.getElementById('progressDisp')
    $(prog).text(stringBuffer.getLength() + " Characters Remain.")
}

//Once confirmation is received via serial, we check for more pending data.
function onData(chunk){
	console.info("I has Data:",chunk.toString(),stringBuffer.getLength());
    if(chunk.toString().substr(0,2) == "ok"){
        if(stringBuffer.getLength() > 0){
        // Ready to send more data.
        sendChar();
        }else{
            readyForPhoto();
        }
    }
}

// Receives the user selection regarding video, and initializes the chosen video.
// (Hopefully).
function initVideo(e){
    let videoElement = document.getElementById("videoElement");
    console.log("Init Video",e.data)
    
    jQuery("#config").hide();
    readyForPhoto();

    navigator.mediaDevices.getUserMedia({video:{exact:'e.data'}})
        .then((s)=>{videoElement.srcObject = s})
    
}

// Kicks off the photo taking process by creating a canvas with the snapshot.
function getPic(){
    var vid = document.getElementById("videoElement");
    var cvs = document.createElement("canvas");
    cvs.height = 480;
    cvs.width = 640;
    
    var context = cvs.getContext('2d');
//    context.fillStyle = "#AAA";
//    context.fillRect(0,0,640,480);
    context.drawImage(vid,0,0,cvs.width,cvs.height);

    // Passes snapshot for conversion to ASCII & output.
    formatPic(cvs)

    // Passes snapshot for preview and writing to file.
    previewImg(cvs);

    printingPhoto();
}

// Convert and output photo as ASCII art.
function formatPic(cvs){

    // If we're still outputting, abort.
    if(stringBuffer.getLength() > 0){
        console.warn("Serial Buffer is not clear");
        return;
    }

    // Implemented new helper.
    var str = asciiConversion.getAsciiString(cvs,110);
    str = str.replace(/&nbsp;/g,' ');
    str = str.replace(/\~/g,'-');
    console.log(str);
    if(port && port.isOpen){
//        stringBuffer.push(str + "\rMaker Faire Orlando 2017\rCybernath Labs\r\r\r\r\r\r\r");
        stringBuffer.push(str + "\rPicture by 'PhotoTYPE'\rCybernath Labs & MakerFX Makerspace\r\r\r\r\r\r\r");
        sendChar();
    }else{
        setTimeout(()=>{ readyForPhoto() },1500)
    }
}

function previewImg(cvs){
    
    //Converts canvas to Base64 image data url
    var data = cvs.toDataURL('image/png');
    
    // Throw update into image preview.
    var img = document.getElementById("previewImg");
    img.setAttribute('src',data);
    
    // File Save Prep.
    var imageBuffer = processBase64Image(data);

    // Generate File Name & path.
    var imgName = 'MFO18-' + Date.now() + '.png';
    var savePath = path.join(homeDir,"MFO2019");
    
    console.log("File Path",savePath);
    // console.log("imageBuffer",imageBuffer)
    
    // Creates save directory if it doesn't exist yet.
    if(!fs.existsSync(savePath)) fs.mkdirSync(savePath)
    
    // Spit out the file to the file system.
    fs.writeFile(path.join(savePath,imgName), imageBuffer.data, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
        
    });
}

// Shows video for live preview.
function readyForPhoto(){
    let videoContainer = document.getElementById("vidContainer")
    $(videoContainer).show("fast");
    let previewContainer = document.getElementById("previewOverlay")
    $(previewContainer).hide("fast");
}

// Displays currently printing photo, and progress meter.
function printingPhoto(){
    let videoContainer = document.getElementById("vidContainer")
    // $(videoContainer).hide("fast");
    let previewContainer = document.getElementById("previewOverlay")
    $(previewContainer).show("fast");
}


// Converts Base64 Image Data to an array containing buffer and image type for file creation.
function processBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];

    // TODO: Evidently, Buffer instantiation makes node angry now. Should replace with something else.
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

// Enables callback from DOM.  TODO: Figure out what the "correct" way is.
document.openSerialPort = openSerialPort;