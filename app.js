$("#toggle-switch").hide();

/* 
SEARCHBAR SECTION
*/
var barOpen = false; //ONCLICK => ANIMATE MAGNIFYING GLASS INTO SEARCHBAR:
$(".bar").click(function() { //AND RECORD INCIDENT
  barOpen = true;

  //KEEP TXT POSITIONING BALANCED:
  $('.bar').addClass('barTextAlign');
  /* $('.underBarText').addClass('raiseUBText'); */

  //WORKING:
  $('.bar').addClass("expandDiv");
  $(".bar").addClass("motion");
  $(".handle").addClass("shrinkHandle");

  setTimeout(function() {
    $(".bar").attr('placeholder', "WIKIPEDIA SEARCH");
    $("#toggle-switch").show();
  }, 385);
});

/*
SPELLCHECKER SECTION
*/
//RESULT KEY (AJAX):
//data[0] = Original search txt
//data[1] = Proper search results
//data[2] = Titles of results
//data[3] = Related URL if found

var spellcheck = function(data) {
  var found = false;
  var url = '';
  var text = data[0];

  if (text != document.getElementById('bar').value) {
    return;
  }
  for (i = 0; i < data[1].length; i++) {
    if (text.toLowerCase() == data[1][i].toLowerCase()) {
      found = true;
      currentSearchIsValid = true;
      url = 'https://en.wikipedia.org/wiki/' + text;
      document.getElementById('spellcheckresult').innerHTML = '<b style="color:green; margin-left:71px;">Valid</b>';
 $('.underBarText').removeClass('raiseUBText');
    }
  }
  if (!found) {
    currentSearchIsValid = true;
    document.getElementById('spellcheckresult').innerHTML = '<b style="color:red; margin-left:57px;">Not Valid</b>';
  }
$('.underBarText').removeClass('raiseUBText');  
};

//
/*
FUNCTION TO TRAP BACKSPACE KEY IN SEARCHBAR TO CLOSE IT WHEN MADE EMPTY:
*/
//
var backspaceCount = 0;

$('.bar').keyup(function(e) { //If key is pressed...

  if (e.keyCode == 8 && barOpen) { //If key is 'backspace' && #bar is open

    var test4input = $(".bar").val(); //Check state to see if input is empty
    
    if (test4input === "") { //If so, do this:
      backspaceCount++; // COUNT BACKSPACE PRESSES WHEN INPUT IS EMPTY

      $("#spellcheckresult").hide()  // HIDE THE VALID/INVALID TEXT

      // CLOSE THE INPUT ON SECOND PRESS OF BACKSPACE
      
      if (backspaceCount >= 2) {
        backspaceCount = 0;

        $("#spellcheckresult").hide();
        $(".toggle-switch").click();

        $('body').focus();
        barOpen = false;
      }
    }
  } else { 
    //MAKE SURE SEARCHBAR IS NOT CLOSED PREMATURELY
    //RESET COUNTER ON INPUT
    backspaceCount = 0;
    
    if (backspaceCount === 0) {
      
      return;
    }
  }
});

var getjs = function(value) {
  if (!value) {
    return; //ERR!
  }

  if ($(".bar").val() === "" || !barOpen) {
    $(".bar").val(""); //DELETE NEW CHARS
    return; //AND CANCEL FUNC

  } else if (barOpen && !barOpenAndMoved) {
    $(".toggle-switch").css('top', '15px');
  }
  $("#spellcheckresult").show();

  var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + value + '&format=json&callback=spellcheck';

  document.getElementById('spellcheckresult').innerHTML = '<span id="checkingTxt"><small>Checking ...</small></span>';
  var elem = document.createElement('script');
  elem.setAttribute('src', url);
  elem.setAttribute('type', 'text/javascript');
  document.getElementsByTagName('head')[0].appendChild(elem);
};

barOpenAndMoved = false;

$(document).on('keydown', function(evt) {

  if (evt.keyCode == 13 && barOpen == true) {
    if ($("#spellcheckresult")[0].innerText === "Not Valid") {
      $(".bar").addClass("invalid-input");

      setTimeout(function(){
        $(".bar").removeClass("invalid-input");
      }, 200)

      return false;
    }

    var val1 = $("#bar").val();

    if (val1.length <= 0) {
      return false;
    } else {
      $(".container").offset({
        top: 30
      });
      $("#btn1").click();
      barOpenAndMoved = true;

      $("#result-container").empty();
    }
  }
});

/*
RESULT CONTAINER SEGMENT
*/
var result = [];
var result2 = [];

//KEYBOARD KEYS SANS ENTER TRIGGER SPELLCHECK FUNC
//REPLACE BUTTON TRIGGER WITH ENTER KEY ONLY:
$("#btn1").click(function() {

  if ($("#spellcheckresult")[0].innerText === "Not Valid") {
    return false;
  }

  $(".toggle-switch").addClass("no-click");

  var input = $("#bar").val();

  $.getJSON("https://en.wikipedia.org/w/api.php?  format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch=" + input + "&callback=?", function(data) {
    if (data == undefined) {
      return false;
    }

    $('html, body').scrollTop(0);

    //FIRST SEE IF OLD RESULTS NEED CLEARING BEFORE WE BEGIN POSTING NEW RESULTS TO THE SCREEN:
    if (result.length > 0) {
      result = [];
      $("#result-container").empty();
    }

    //JSONP response data is now in the input variable
    var page = 'http://en.wikipedia.org/?curid=';
    var input = data.query.pages;

    $.each(input, function(index) {

      result.push({ //Move items to new array to turn into hyperlinks to associated websites
        title: input[index].title,
        body: input[index].extract,
        page: page + input[index].pageid
      });
    });

    var countDivs = 0;
    var len = result.length;

    function passObject(i) {
      countDivs++;
      $("#makeNoise").click();

      var newElement = document.createElement('div');
      newElement.id = "div" + countDivs;
      newElement.className = "resultDiv";
      newElement.innerHTML = "<h3 class='h3items'><span class='divTitle'>" + result[i].title + "</span></h3><br />";
      newElement.innerHTML += "<span class='divBody'>" + result[i].body + "</span></p>";
      newElement.innerHTML += "<a href='" + result[i].page + "' target='_blank'><span class='hyperspan'></span></a>";

      $("#result-container").append(newElement);

      if (countDivs === len) {
        // Enable the toggle button
        $(".toggle-switch").removeClass("no-click");
      }

    }

    if (result == undefined) {
      
      return;
    }

    var num = 0;

    for (var i in result) {
      (function() {
        num++;
        var div = i;
        setTimeout(function() {
          passObject(div);
        }, 150 * num);
      })();
    }

  });
});

/*
'X' TOGGLE SWITCH FUNCTION
*/
$(".toggle-switch").click(function() {
  $("#spellcheckresult").hide();
  $(".toggle-switch").css('top', '23px');
  $('.bar').removeClass('barTextAlign');
  $('.underBarText').removeClass('raiseUBText');
  if (barOpenAndMoved) {
    recenterDiv();
  }
  $('.underBarText').css('top','580px !important');
  $(".toggle-switch").hide();
  barOpen = false;

  if (barOpenAndMoved) {
    $("#result-container").empty();
    barOpenAndMoved = false;
  }

  $("#toggle-switch").hide();
  $('.bar').removeClass("expandDiv");
  $(".bar").removeClass("motion");
  $(".handle").removeClass("shrinkHandle");
  $(".bar").attr('placeholder', ""); //CLEAR
  $(".bar").val(""); //CLEAR

});

//SCROLL TO CENTER OF SCREEN AUTOMAGICALLY ON DOCUMENT LOAD:
$(document).ready(function() {
  $('html, body').animate({
    scrollTop: $('#container').offset().top
  }, 'slow');
});

/*
BEGIN CODE TO CENTER DIV
*/
//Return searchbar to center of page upon close-down
function recenterDiv() {
  $("#container").css("position", "absolute");
  $("#container").css("top", Math.max(0, (($(window).height() - $("#container").outerHeight()) / 2) +
    $(window).scrollTop()) + "px");
  $("#container").css("left", Math.max(0, (($(window).width() - $("#container").outerWidth()) / 2) +
    $(window).scrollLeft()) + "px");
  return;
}

var removed = false;

function sndFX_click() {
  var audio = document.createElement("audio");
  audio.src = "http://soundbible.com/mp3/Click-SoundBible.com-1387633738.mp3";
  audio.addEventListener("ended", function() {
    document.removeChild(this);
  }, false);

  audio.play();
}

// MAKE A CLACKING NOISE WHEN EACH RESULT IS LOADED
$('#makeNoise').bind("click", function() {
  sndFX_click();
});