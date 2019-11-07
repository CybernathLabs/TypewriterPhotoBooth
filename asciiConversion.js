class AsciiConversion {
    constructor(){

    }

    debugImg;

    chars = ['$','@','B','%','&','W','M','#','*','Z','O','0','Q','Y','X','z',
				'u','x','r','/','(',')','1',
				'?','-','_','+','~','i','!','l',';',':',',','"','`','.',' ' ];
	
	getChar(val) { 
        return this.chars[parseInt(val*(this.chars.length-1), 10)]; 
    }


    getAsciiString(pCanvas,width){

        //Calculate current aspect ration of canvas.
//        let ratio = pCanvas.width/pCanvas.height;
        let ratio = pCanvas.height/pCanvas.width;

        //Scale height based on width and aspect ratio of input.
        let height = parseInt(width*ratio*0.5);

        //Resizing data to match given size.
        var cvs = document.createElement("canvas");
        var miniCxt = cvs.getContext('2d');
        miniCxt.drawImage(pCanvas,0,0,width,height)

        // Start Processing Image Data into ASCII

        var len = width*height
        let d = miniCxt.getImageData(0,0,width,height).data;
        let str = '';

		// helper function to retrieve rgb value from pixel data
		var getRGB = function(i) { return [d[i=i*4], d[i+1], d[i+2]]; };

		for(var i=0; i<len; i++) {
			if(i%width === 0) str += '\n';
			var rgb = getRGB(i);
			var val = Math.max(rgb[0], rgb[1], rgb[2])/255;
			str += this.getChar(val);
		}
		return str;
        
    }
}

module.exports = AsciiConversion