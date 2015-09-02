
var ac = new AudioContext();

function autoCorrelate (audioBuffer, sampleRate) {

  var SIZE = audioBuffer.length;
  var MAX_SAMPLES = Math.floor(SIZE / 2);
  var MIN_SAMPLES = 0;

  var bestOffset = -1;
  var bestCorrelation = 0;
  var rms = calculateRMS(audioBuffer);
  var foundGoodCorrelation = false;
  var correlations = new Array(MAX_SAMPLES);
  var i;
  var lastCorrelation;
  var offset;
  var correlation;

  // not enough signal
  if (rms < 0.01) {
    return -1;
  }

  lastCorrelation = 1;

  for (offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
    correlation = 0;

    for (i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs((audioBuffer[i]) - (audioBuffer[i + offset]));
    }

    correlation = 1 - (correlation / MAX_SAMPLES);

    // store it, for the tweaking we need to do below.
    correlations[offset] = correlation;

    if ((correlation > 0.9) && (correlation > lastCorrelation)) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
      // Now we need to tweak the offset - by interpolating between the values to the left and right of the
      // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
      // we need to do a curve fit on correlations[] around bestOffset in order to better determine precise
      // (anti-aliased) offset.

      // we know bestOffset >=1,
      // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
      // we can't drop into this clause until the following pass (else if).
      var shift = (correlations[bestOffset + 1] - correlations[bestOffset - 1]) / correlations[bestOffset];
      return sampleRate / (bestOffset + (8 * shift));
    }

    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }

  return -1;
};


function calculateRMS ( audioBuffer ) {
  
  var bufLength = audioBuffer.length;
  var rms = 0;
  var i;

  for (i = 0; i < bufLength; i++) {
    rms += audioBuffer[i] * audioBuffer[i];
  }

  return Math.sqrt(rms / bufLength);
};






var Mic = new function(){


  
  
  this.init = function(){
  
    if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.webkitGetUserMedia){
        navigator.webkitGetUserMedia({audio:true, video:false}, function( e ){


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

            console.log( recorder );
            recorder.onaudioprocess = function(e){
                console.log ('recording');
                var left = e.inputBuffer.getChannelData (0);
                var right = e.inputBuffer.getChannelData (1);

                pitch = autoCorrelate( left, sampleRate   );
                console.log( 'left: '+ pitch );

                pitch = autoCorrelate( right, sampleRate   );
                console.log( 'right: '+ pitch );

            }

            // we connect the recorder
            volume.connect (recorder);
            //recorder.connect (context.destination); 
      


        }, function(e) {
          alert('Error capturing audio.');
        });

    } else alert('getUserMedia not supported in this browser.');
  
    console.log( 'init ran' );
  }





  this.hasGetUserMedia = function() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
  }

}

Mic.init();