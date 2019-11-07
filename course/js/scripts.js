//===================================================================================================================

// Page completion
/*function ScrollIndicator() { // Our Scroll progress.
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;

    if (document.getElementById('progress').style.width === 100 + '%'){
        document.getElementById('progress').style.width === 100 + '%';
    } else {
        document.getElementById('progress').style.width = scrolled + '%';
    }
}

// fills the page progress bar
window.onscroll = function () {
    ScrollIndicator();
}; */

// Calculates trackable items in each page and divides the progress bar by that amount.
/*var tracked = document.querySelectorAll('.tracking').length;
var val = 0;
var newval = 0;

val = Math.ceil(100 / tracked);

function percentage(){
  document.getElementById('elementalProgress').style.width = val + newval + '%';
  newval += parseFloat(val);
  
   console.log(newval);
  return newval;
}

// puts all items with class tracking into variable array
var completedItems = document.getElementsByClassName('tracking');

// Create event listener on all 'tracking' items
for (var i = 0; i < completedItems.length; i++) {
    completedItems[i].addEventListener('click', markDone);
}

// increment the progress bar and run page completion check on click event
function markDone() {
    percentage();
    markPageComplete();
} */