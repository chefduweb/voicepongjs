var Mic = function(){


    /**
     * Set the UserStream and devide it in two channels.
     * Then tell the Game class to alter the position of the Paddles.
     * 
     * @return void
     */
    this.init = function(){

        var self = this;

        if( navigator.webkitGetUserMedia ){
            navigator.webkitGetUserMedia({ audio: { optional: [{ echoCancellation: false }] } }, function( e ){


            // creates the audio context
            audioContext = window.AudioContext || window.webkitAudioContext;
            context = new audioContext();

            // retrieve the current sample rate to be used for WAV packaging
            sampleRate = context.sampleRate;

            // creates a gain node
            volume = context.createGain();

            // creates an audio node from the microphone incoming stream
            audioInput = context.createMediaStreamSource(e);

            // connect the stream to the gain node
            audioInput.connect(volume);


            var bufferSize = 2048;
            recorder = context.createScriptProcessor(bufferSize, 2, 2);
            recorder.connect( context.destination );

            recorder.onaudioprocess = function(e){
    
                var left = e.inputBuffer.getChannelData (0);
                var leftData = new Float32Array( left );
                var right = e.inputBuffer.getChannelData (1);
                var rightData = new Float32Array( right );
    
                leftPitch = self.autoCorrelate( leftData, sampleRate   );
                // console.log( 'left: '+ leftPitch );
    
                rightPitch = self.autoCorrelate( rightData, sampleRate   );
                // console.log( 'right: '+ rightPitch );
                if (leftPitch > 0) {
                    window.game.voiceControlPaddle(leftPitch, 'left');
                }
                if (rightPitch > 0) {
                    window.game.voiceControlPaddle(rightPitch, 'right');
                }
    
            }

            // we connect the recorder
            volume.connect (recorder);
      


        }, function(e) {

            alert('Error capturing audio.');
        
        });

        } else alert('getUserMedia not supported in this browser.');
    }


    /**
     * AutoCorrelate an AudioBuffer to figure out the pitch
     * 
     * @param  AudioBuffer audioBuffer
     * @param  Int sampleRate
     * @return Float
     */
    this.autoCorrelate = function( audioBuffer, sampleRate ){

        var self = this;
        var size = audioBuffer.length;
        var maxSamples = Math.floor( size / 2 );
        var minSamples = 0;

        var bestOffset = -1;
        var bestCorrelation = 0;
        var rms = self.calculateRMS( audioBuffer );
        var foundGoodCorrelation = false;
        var correlations = new Array( maxSamples );
        var i;
        var lastCorrelation;
        var offset;
        var correlation;

        // not enough signal
        if( rms < 0.01 ){
            return -1;
        }

        lastCorrelation = 1;

        //loop through all samples
        for( offset = minSamples; offset < maxSamples; offset++ ){

            correlation = 0;

            //calculate correlation per sample
            for( i = 0; i < maxSamples; i++ ){
                correlation += Math.abs( ( audioBuffer[i] ) - ( audioBuffer[i + offset ] ) );
            }
        
            correlation = 1 - (correlation / maxSamples);
        
            //store it, for the tweaking we need to do below.
            correlations[offset] = correlation;
        
            //we found a matching correlation
            if( ( correlation > 0.9 ) && ( correlation > lastCorrelation ) ){
                
                foundGoodCorrelation = true;
                
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestOffset = offset;
                }
            
            } else if (foundGoodCorrelation) {
                
                //make a best guest on the right correlation based on the best offset
                var shift = ( correlations[bestOffset + 1] - correlations[bestOffset - 1] ) / correlations[bestOffset];
                return sampleRate / ( bestOffset + ( 8 * shift ) );
        
            }
        
            lastCorrelation = correlation;
        }

        //if we've found a positive correlation, return it
        if( bestCorrelation > 0.01 )
            return sampleRate / bestOffset;
        
        
        return -1;
    }


    /**
     * Calculates signal strength by using the
     * root mean square of the audio buffer
     * 
     * @param  AudioBuffer audioBuffer
     * @return float Quadratic mean
     */
    this.calculateRMS = function ( audioBuffer ) {
  
        var bufLength = audioBuffer.length;
        var rms = 0;
        var i;
    
        for (i = 0; i < bufLength; i++) {
          rms += audioBuffer[i] * audioBuffer[i];
        }
    
        return Math.sqrt(rms / bufLength);
    }
}