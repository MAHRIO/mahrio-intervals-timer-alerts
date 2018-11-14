// Use Cases:
//   1. User sets up the tine
//   2. User reads time left
//   3. When times up, Alarm song rings
//   4.Press button to turn off the alarm


var five = require("johnny-five");
var board = new five.Board(), timer = 5;
var songs = require('j5-songs');
var alert = false, start = false;

board.on("ready", function() {
  var piezo = new five.Piezo(10);
  var stopStartAlert = new five.Button({
    pin: 2,
    isPullup: true
  });
  var setTime = new five.Button({
    pin: 3,
    isPullup: true
  });

  var l = new five.LCD({
    controller: "PCF8574T"
  });

  stopStartAlert.on('press', function(){
    if( alert ) {
      alert = false;
    } else {
      start = true;
    }
  });
  setTime.on('press', function() {
    timer = timer + 10;
  });

  setInterval( function(){
    if( start ) {
      if( timer >= 0 ) {
        var n = ('0' + timer--).slice(-2);
        l.cursor(0, 0).print("Time Left 00:" + n + '           ');
        if( timer === 0 ) { alert = true; }
      } else {
        if( alert ) {
          l.cursor(0, 0).print('TIMER ENDS');
          piezo.play( songs.load('mario-intro') );
        }
      }
    } else {
      var n = ('0' + timer).slice(-2);
      l.cursor(0, 0).print("Set Time 00:" + n + '           ');
    }
  }, 1000);
});
