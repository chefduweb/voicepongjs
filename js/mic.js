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
                console.log( 'left: '+ leftPitch );
    
                rightPitch = self.autoCorrelate( rightData, sampleRate   );
                console.log( 'right: '+ rightPitch );
    
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
    this.autoCorrelate = function (audioBuffer, sampleRate) {

        var self = this;
        var SIZE = audioBuffer.length;
        var MAX_SAMPLES = Math.floor(SIZE / 2);
        var MIN_SAMPLES = 0;

        var bestOffset = -1;
        var bestCorrelation = 0;
        var rms = self.calculateRMS( audioBuffer );
        var foundGoodCorrelation = false;
        var correlations = new Array( MAX_SAMPLES );
        var i;
        var lastCorrelation;
        var offset;
        var correlation;

        // not enough signal
        if( rms < 0.01 ){
            return -1;
        }

        lastCorrelation = 1;

        for( offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++ ){
            correlation = 0;

            for( i = 0; i < MAX_SAMPLES; i++ ){
                correlation += Math.abs((audioBuffer[i]) - (audioBuffer[i + offset]));
            }
        
            correlation = 1 - (correlation / MAX_SAMPLES);
        
            // store it, for the tweaking we need to do below.
            correlations[offset] = correlation;
        
            if( ( correlation > 0.9 ) && ( correlation > lastCorrelation ) ){
                foundGoodCorrelation = true;
                
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestOffset = offset;
                }
            
            } else if (foundGoodCorrelation) {
        
                var shift = ( correlations[bestOffset + 1] - correlations[bestOffset - 1] ) / correlations[bestOffset];
                return sampleRate / ( bestOffset + ( 8 * shift ) );
        
            }
        
            lastCorrelation = correlation;
        }

        if( bestCorrelation > 0.01 ) {

            return sampleRate / bestOffset;
        }

        return -1;
    }


    /**
     * [calculateRMS description]
     * @param  {[type]} audioBuffer [description]
     * @return {[type]}             [description]
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