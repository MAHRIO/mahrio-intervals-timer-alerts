// Use Cases:
//   1. User adds time to timer
//   2. User reads timer preset
//   3. User start timer
//   4. User stops/pauses timer
//   5. When times up alert is display, sound emitted & text message sent
//   6. User turns off system or resets the timer

var five = require("johnny-five");
var songs = require('j5-songs');

var board = new five.Board();
var alert = false,
  startTimer = false,
  piezo, lcd, stopStartButton, addTimeButton, addTimeButtonClicks = 0, inputTimer, inputTimeout = 1000,
  timer = 0, currentTime, setTime;

var processCommand = function(){
  switch( addTimeButtonClicks ) {
    case 2: // add 30 seconds
      timer = timer + 30;
      break;
    case 3: // add one minute
      timer = timer + 60;
      break;
    case 4: // add 5 minutes
      timer = timer + 60 * 5;
      break;
    default:
      timer = timer + 1;
      break;
  }
  displayTime('Add Time');
};
var resetTimer = function() {
  inputTimer = null;
  addTimeButtonClicks = 0;
};
var displayTime = function( msg ) {
  currentTime = new Date();
  setTime = new Date();
  setTime.setSeconds( currentTime.getSeconds() + timer );

  var lengthTime = setTime - currentTime;
  var hours = Math.floor((lengthTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((lengthTime % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((lengthTime % (1000 * 60)) / 1000);

  lcd.clear();
  lcd.cursor(0,0).print( msg );
  if( lengthTime > 0) {
    lcd.cursor(1,0).print(hours + "h "
      + minutes + "m " + seconds + "s ");
  } else {
    lcd.cursor(1,0).print('Time Expired');
    if( !alert ) {
      piezo.play( songs.load('mario-intro') );
      alert = true;
    }
  }
};

board.on("ready", function() {
  piezo = new five.Piezo(10);
  lcd = new five.LCD({
    controller: "PCF8574T"
  });
  stopStartButton = new five.Button({
    pin: 2,
    isPullup: true
  });
  stopStartButton.on('press', function(){
    startTimer = !startTimer;
  });
  stopStartButton.on('hold', function() {
    resetTimer();
    startTimer = false;
    timer = 0;
    alert = false;
  });
  addTimeButton = new five.Button({
    pin: 3,
    isPullup: true
  });
  addTimeButton.on('press', function() {
    addTimeButtonClicks += 1;
    if( !inputTimer ) {
      inputTimer = setTimeout(function(){
        processCommand(1);
        resetTimer();
      }, inputTimeout);
    }
  });
});
setInterval( function() {
  currentTime = new Date();
  if( startTimer ) {
    timer = timer - 1;
    displayTime('Time Remaining');
  }
}, 1000);