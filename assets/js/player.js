exports.PodcastPlayer = class{
  
    constructor(player_element, offset = 0){
      this.isPlaying = false;
      this.src;
      this.progress;
      this.currentTime = 0;
      this.timeLeft = 0;
      this.timeOffset = offset;

      //setting up elements
      this.player = player_element;
      this.audio = this.player.querySelector('.podcast-player-audio');
      this.play_button = this.player.querySelector('.podcast-play-button');
      this.pause_button = this.player.querySelector('.podcast-pause-button');
      this.bar = this.player.querySelector('.podcast-player-progress');
      this.progress = this.player.querySelector('.podcast-player-progress-bar');
      this.time = this.player.querySelector('.podcast-player-progress-time');
  
      //attach this to the dom so its accesible externally
      this.player.podcastplayer = this;
  
      this.init();
    }
  
  
    init() {
  
      //setup native audio event listeners
      this.audio.addEventListener('loadedmetadata', e => this.onCanPlay(e) );
      this.audio.addEventListener('playing', e => this.onPlaying(e) );
      this.audio.addEventListener('pause', e => this.onPause(e) );
      this.audio.addEventListener('ended', e => this.onEnd(e) );
      this.audio.addEventListener('error', e => this.onError(e) );
  
      // apply the audio start time property
      this.audio.currentTime = this.timeOffset; 

      //setup click listeners
      this.play_button.addEventListener('click', e => this.playPause(e));
      this.pause_button.addEventListener('click', e => this.playPause(e));
      this.bar.addEventListener('click', e => this.barClick(e));
  
      //setup global array of players 
      if(!window.podcast_players){
        window.podcast_players = [];
      }
      window.podcast_players.push(this.player);
    }
  
    playPause(e){
      if (!!e) e.preventDefault();
  
      this.player.classList.toggle('playing');
  
      if (this.canBePlayed) {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      }
      else if (this.preload === 'none') {
        // If player can't be played, because audio wasn't pre-loaded
        // due to the preload="none" property set,
        // load the audio file at this point and start playing it immediately
        this.audio.load();
        this.play();
      }
    }

    stopAllPlayers(current){
      for(let player of window.podcast_players){
        if(player != current){
          player.podcastplayer.pause();
        }
      }
    }
  
    play() {
      if(!this.player.classList.contains('played')){
        this.player.classList.add('played');
      }
      this.stopAllPlayers(this.player);
      this.player.classList.add('playing');
      this.audio.play();
    }
    
    pause() {
      this.player.classList.remove('playing');
      this.audio.pause();
    }
  
  
    // Restart audio
    restart(e){
      if (!!e) e.preventDefault();
  
      this.currentTime = 0;
      if (!this.isPlaying) this.play();
    }
  
  
    // when audio file can be played in user's browser
    onCanPlay() {
      this.canBePlayed = true;
      this.timeLeft = this.audio.duration;
      var percentagePlayed = 0;
  
      // If player has a time offset specified
      // style the progress bar and title accordingly
      if (this.timeOffset > 0) {
        var percentagePlayed = this.timeOffset / this.audio.duration;
      }
  
      this.updateVisualProgress(percentagePlayed);
    }
  
    // when player starts playing
    onPlaying(){
      this.ended = false;
      this.isPlaying = true;
      this.startProgressTimer();
    }
  
  
    // starts timer
    startProgressTimer() {
      this.timer = {};
  
      if (this.timer.sliderUpdateInterval) {
        clearInterval(this.timer.sliderUpdateInterval);
      }
  
      this.timer.sliderUpdateInterval = setInterval( () => {
        if ( this.isPlaying ) {
          this.currentTime = this.audio.currentTime;
          this.timeLeft = this.audio.duration - this.currentTime;
          var percentagePlayed = this.currentTime / this.audio.duration;
          this.updateVisualProgress(percentagePlayed);
        } 
        else {
          clearInterval(this.timer.sliderUpdateInterval);
        }
      }, 60);
    }
  
  
    // when Player is paused
    onPause() {
      this.isPlaying = false;
    }
  
  
    // when Player ended playing an audio file
    onEnd() {
      this.ended = true;
      this.isPlaying = false;
    }
  
  
    // on file load error
    onError() {
      this.player.classList.add('cantplay');
      this.error = true;
      this.player.setAttribute('aria-invalid', 'true');
    }
  
  
    // to convert seconds to 'm:ss' format
    convertSecToMin(seconds){
      if (seconds === 0) return '0:00';
      var minutes = Math.floor(seconds / 60);
      var secondsToCalc = Math.floor(seconds % 60) + '';
      return minutes + ':' + (secondsToCalc.length < 2 ? '0' + secondsToCalc : secondsToCalc);
    }
  
  
    // When user clicks somewhere on the progress bar
    barClick(e) {
      e.preventDefault();
  
      if (this.canBePlayed) {
        this.updateProgressBar(e);
        if (!this.isPlaying) {
          this.play();
        }
      }
      else if (this.preload === 'none') {
        this.audio.load();
        this.audio.addEventListener('loadedmetadata', () => {
          this.updateProgressBar(e);
          if (!this.isPlaying) {
            this.play();
          }
        }, false);
      }
    }
  

    // Helper function
    // that recalculates the progress bar position
    // based on the event.click position
    updateProgressBar(e) {
      var x = e.x - this.bar.getBoundingClientRect().left;
      var r = (x / this.bar.getBoundingClientRect().width) * this.audio.duration;
      this.updatePlayPosition(r);
    }
    
    
    // Helper function
    // updates the current time based on a time variable
    updatePlayPosition(newTime) {
      this.currentTime = this.audio.currentTime = newTime;
      var percentagePlayed = this.currentTime / this.audio.duration;
      this.updateVisualProgress(percentagePlayed);
    }
    
    
    // Helper function
    // updates the progress bar based on a percentage played
    updateVisualProgress(percentagePlayed) {
      this.progress.style.width = (percentagePlayed * 100) + '%';
      this.time.innerHTML = this.convertSecToMin(this.timeLeft);
    }
  
  };