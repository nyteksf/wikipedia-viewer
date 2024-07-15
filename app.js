$(".search-ui__toggle-switch").hide();

/* 
search-bar SECTION
*/

let barOpen = false; //ONCLICK => ANIMATE MAGNIFYING GLASS INTO search-bar:
$(".search-ui__input").click(function() { //AND RECORD INCIDENT
  barOpen = true;

  //KEEP TXT POSITIONING BALANCED:
  $(".search-ui__input").addClass('barTextAlign');

  //WORKING:
  $(".search-ui__input").addClass("expandDiv");
  $(".search-ui__input").addClass("motion");
  $(".search-ui__handle").addClass("shrinkHandle");
  $(".search-ui__under-bar-text").css("margin-top","71px");

  setTimeout(function() {
    $(".search-ui__input").attr('placeholder', "WIKIPEDIA SEARCH");
    $(".search-ui__toggle-switch").show();
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

let spellcheck = function(data) {
  let found = false;
  let url = '';
  let text = data[0];

  if (text != document.getElementById('search-ui__input').value) {
    return;
  }
  for (i = 0; i < data[1].length; i++) {
    if (text.toLowerCase() == data[1][i].toLowerCase()) {
      found = true;
      currentSearchIsValid = true;
      url = 'https://en.wikipedia.org/wiki/' + text;
      document.getElementById('search-ui__spell-check-result').innerHTML = '<b style="color:green; margin-left:71px;">Valid</b>';
 $('.search-ui__under-bar-text').removeClass('raiseUBText');
    }
  }
  if (!found) {
    currentSearchIsValid = true;
    document.getElementById('search-ui__spell-check-result').innerHTML = '<b style="color:red; margin-left:57px;">Not Valid</b>';
  }
$('.search-ui__under-bar-text').removeClass('raiseUBText');  
};

//
/*
FUNCTION TO TRAP BACKSPACE KEY IN search-bar TO CLOSE IT WHEN MADE EMPTY:
*/
//
let backspaceCount = 0;

$('.search-ui__input').keyup(function(e) { //If key is pressed...

  if (e.keyCode == 8 && barOpen) { //If key is 'backspace' && .search-ui__input is open

    let test4input = $(".search-ui__input").val(); //Check state to see if input is empty
    
    if (test4input === "") { //If so, do this:
      backspaceCount++; // COUNT BACKSPACE PRESSES WHEN INPUT IS EMPTY

      $("#search-ui__spell-check-result").hide()  // HIDE THE VALID/INVALID TEXT

      // CLOSE THE INPUT ON SECOND PRESS OF BACKSPACE
      
      if (backspaceCount >= 2) {
        backspaceCount = 0;

        $("#search-ui__spell-check-result").hide();
        $(".search-ui__toggle-switch").click();

        $('body').focus();
        barOpen = false;
      }
    }
  } else { 
    //MAKE SURE search-bar IS NOT CLOSED PREMATURELY
    //RESET COUNTER ON INPUT
    backspaceCount = 0;
    
    if (backspaceCount === 0) {
      
      return;
    }
  }
});

let search = function(value) {
  if (!value) {
    return; //ERR!
  }

  if ($(".search-ui__input").val() === "" || !barOpen) {
    $(".search-ui__input").val(""); //DELETE NEW CHARS
    return; //AND CANCEL FUNC

  } else if (barOpen && !barOpenAndMoved) {
    $(".search-ui__toggle-switch").css("top", "15px");
  }
  $("#search-ui__spell-check-result").show();

  let url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + value + '&format=json&callback=spellcheck';

  document.getElementById('search-ui__spell-check-result').innerHTML = '<span id="checkingTxt"><small>Checking ...</small></span>';
  let elem = document.createElement('script');
  elem.setAttribute('src', url);
  elem.setAttribute('type', 'text/javascript');
  document.getElementsByTagName('head')[0].appendChild(elem);
};

barOpenAndMoved = false;

$(document).on('keydown', function(evt) {

  if (evt.keyCode == 13 && barOpen == true) {
    if ($("#search-ui__spell-check-result")[0].innerText === "Not Valid") {
      $(".search-ui__input").addClass("invalid-input");

      setTimeout(function(){
        $(".search-ui__input").removeClass("invalid-input");
      }, 200)

      return false;
    }

    let val1 = $(".search-ui__input").val();

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
let result = [];
let result2 = [];

//KEYBOARD KEYS SANS ENTER TRIGGER SPELLCHECK FUNC
//REPLACE BUTTON TRIGGER WITH ENTER KEY ONLY:
$("#btn1").click(function() {

  if ($("#search-ui__spell-check-result")[0].innerText === "Not Valid") {
    return false;
  }

  $(".search-ui__toggle-switch").addClass("no-click");

  let input = $(".search-ui__input").val();

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

    //JSONP response data is now in the input
    let page = 'http://en.wikipedia.org/?curid=';
    let input = data.query.pages;

    $.each(input, function(index) {

      result.push({ //Move items to new array to turn into hyperlinks to associated websites
        title: input[index].title,
        body: input[index].extract,
        page: page + input[index].pageid
      });
    });

    let countDivs = 0;
    let len = result.length;

    function passObject(i) {
      countDivs++;
      $("#soundFX-trigger").click();

      let newElement = document.createElement('div');
      newElement.id = "div" + countDivs;
      newElement.className = "resultDiv";
      newElement.innerHTML = "<h3 class='h3items'><span class='divTitle'>" + result[i].title + "</span></h3><br />";
      newElement.innerHTML += "<span class='divBody'>" + result[i].body + "</span></p>";
      newElement.innerHTML += "<a href='" + result[i].page + "' target='_blank'><span class='hyperspan'></span></a>";

      $("#result-container").append(newElement);

      if (countDivs === len) {
        // Enable the toggle button
        $(".search-ui__toggle-switch").removeClass("no-click");
      }

    }

    if (result == undefined) {
      
      return;
    }

    let num = 0;
    
    for (let i in result) {
      (function() {
        num++;
        let div = i;
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
$(".search-ui__toggle-switch").click(function() {
  $("#search-ui__spell-check-result").hide();
  $(".search-ui__toggle-switch").css('top', '23px');
  $('.search-ui__input').removeClass('barTextAlign');
  $('.search-ui__under-bar-text').removeClass('raiseUBText');
  if (barOpenAndMoved) {
    recenterDiv();
  }
  $('.search-ui__under-bar-text').css('top','580px !important');
  $(".search-ui__toggle-switch").hide();
  barOpen = false;

  if (barOpenAndMoved) {
    $("#result-container").empty();
    barOpenAndMoved = false;
  }

  $(".search-ui__toggle-switch").hide();
  $(".search-ui__input").removeClass("expandDiv");
  $(".search-ui__input").removeClass("motion");
  $(".search-ui__under-bar-text").css("margin-top","48px");
  $(".search-ui__handle").removeClass("shrinkHandle");
  $(".search-ui__input").attr('placeholder', ""); //CLEAR
  $(".search-ui__input").val(""); //CLEAR

});

//SCROLL TO CENTER OF SCREEN AUTOMAGICALLY ON DOCUMENT LOAD:
$(document).ready(function() {
  $('html, body').animate({
    scrollTop: $('.container').offset().top
  }, 'slow');
});

/*
BEGIN CODE TO CENTER DIV
*/
//Return search-bar to center of page upon close-down
function recenterDiv() {
  $(".container").css("position", "absolute");
  $(".container").css("top", Math.max(0, (($(window).height() - $(".container").outerHeight()) / 2 + 42) +
    $(window).scrollTop()) + "px");
  $(".container").css("left", Math.max(0, (($(window).width() - $(".container").outerWidth()) / 2) +
    $(window).scrollLeft()) + "px");
  return;
}

let removed = false;

function sndFX_click() {
  let audio = document.createElement("audio");
  audio.src = "http://soundbible.com/mp3/Click-SoundBible.com-1387633738.mp3";
  audio.addEventListener("ended", function() {
    document.removeChild(this);
  }, false);

  audio.play();
}

// MAKE A CLACKING NOISE WHEN EACH RESULT IS LOADED
$('#soundFX-trigger').bind("click", function() {
  sndFX_click();
});