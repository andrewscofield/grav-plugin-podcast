import { PodcastPlayer } from './player'

var docReady = function(){
  let players = document.querySelectorAll('.podcast-player');
  for(var player of players){
    var player = new PodcastPlayer(player);
  }
};


if ( document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
  docReady();
} 
else {
  document.addEventListener('DOMContentLoaded', docReady);
}

