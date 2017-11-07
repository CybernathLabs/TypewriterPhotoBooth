'use strict';

class StringBuffer {
	constructor(){
        this.strHolder = '';
    }
	
    
	// Appends supplied string to the internal queue.
	push(str){
		this.strHolder += str;
	}
	
    // Returns a single character from the beginning, and removes it.
	pull(){
		let tmp = this.strHolder.substr(0,1);
		this.strHolder = this.strHolder.substr(1);
		
		return tmp;
	}

    // Gives the length of the queue.
    getLength(){
        return this.strHolder.length;
    }

}

module.exports = StringBuffer;