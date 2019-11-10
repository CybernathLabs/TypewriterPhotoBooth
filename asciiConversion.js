class AsciiConversion {
    constructor(){

    }

    // TODO: Allow character selection via constructor.
    
    // Wider Character Set for more shades of grey.
    // chars = ['$','@','B','%','&','W','M','#','*','Z','O','0','Q','Y','X','z',
	// 			'u','x','r','/','(',')','1',
    //             '?','-','_','+','~','i','!','l',';',':',',','"','`','.',' ' ];
             
    // Original character set for more contrast.
    // chars = ['@','#','$','=','*','!',';',':','~','-',',','.','&nbsp;', '&nbsp;'];

    // Horrible Hack for a little more contrast.
    chars = ['@','@','@','#','$','=','*','!',';',':','~','-',',','.','&nbsp;', '&nbsp;'];
    
    // Grabs char at selected index, based on the 0.0 - 1.0 range of contrast.
	getChar(val) { 
        return this.chars[parseInt(val*(this.chars.length-1), 10)]; 
    }

    // DOES EVERYTHING OF IMPORTANCE
    getAsciiString(pCanvas,width){

        //Calculates the current aspect ratio of canvas based on the input.
//        let ratio = pCanvas.width/pCanvas.height;
        let ratio = pCanvas.height/pCanvas.width;

        //Scale output height based on desired width and aspect ratio of input.
        //Multiplied by half to account for ASCII line height.
        let height = parseInt(width*ratio*0.5);

        //Resizing image data to match needed size.
        var cvs = document.createElement("canvas");
        var miniCxt = cvs.getContext('2d');
        miniCxt.drawImage(pCanvas,0,0,width,height)

        // Start Processing Image Data into ASCII

        // Expected length of the imageData object based on number of pixels.
        var len = width*height

        // Raw image data from the resized canvas.
        let d = miniCxt.getImageData(0,0,width,height).data;

        // Initialize output string.
        let str = '';

		// helper function to retrieve RGB values from pixel data
		var getRGB = function(i) { return [d[i=i*4], d[i+1], d[i+2]]; };

        // GET ALL THE PIXELS!
		for(var i=0; i<len; i++) {
            // If we've reached the end of the line, throw in a return.
            if(i%width === 0) str += '\n';
            
            // Grabs RGB values for a pixel as a 3 position array.
            var rgb = getRGB(i);
            
            // Takes the highest RGB value and scales it from 0-1.
            var val = Math.max(rgb[0], rgb[1], rgb[2])/255;
            
            // Adds to the string in progress.
			str += this.getChar(val);
        }
        
        // All done.
		return str;
        
    }
}

module.exports = AsciiConversion