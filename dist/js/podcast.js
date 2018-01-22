(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

exports.PodcastPlayer = function () {
  function _class(player_element) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, _class);

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

  _createClass(_class, [{
    key: 'init',
    value: function init() {
      var _this = this;

      //setup native audio event listeners
      this.audio.addEventListener('loadedmetadata', function (e) {
        return _this.onCanPlay(e);
      });
      this.audio.addEventListener('playing', function (e) {
        return _this.onPlaying(e);
      });
      this.audio.addEventListener('pause', function (e) {
        return _this.onPause(e);
      });
      this.audio.addEventListener('ended', function (e) {
        return _this.onEnd(e);
      });
      this.audio.addEventListener('error', function (e) {
        return _this.onError(e);
      });

      // apply the audio start time property
      this.audio.currentTime = this.timeOffset;

      //setup click listeners
      this.play_button.addEventListener('click', function (e) {
        return _this.playPause(e);
      });
      this.pause_button.addEventListener('click', function (e) {
        return _this.playPause(e);
      });
      this.bar.addEventListener('click', function (e) {
        return _this.barClick(e);
      });

      //setup global array of players 
      if (!window.podcast_players) {
        window.podcast_players = [];
      }
      window.podcast_players.push(this.player);
    }
  }, {
    key: 'playPause',
    value: function playPause(e) {
      if (!!e) e.preventDefault();

      this.player.classList.toggle('playing');

      if (this.canBePlayed) {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      } else if (this.preload === 'none') {
        // If player can't be played, because audio wasn't pre-loaded
        // due to the preload="none" property set,
        // load the audio file at this point and start playing it immediately
        this.audio.load();
        this.play();
      }
    }
  }, {
    key: 'stopAllPlayers',
    value: function stopAllPlayers(current) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = window.podcast_players[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var player = _step.value;

          if (player != current) {
            player.podcastplayer.pause();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'play',
    value: function play() {
      if (!this.player.classList.contains('played')) {
        this.player.classList.add('played');
      }
      this.stopAllPlayers(this.player);
      this.player.classList.add('playing');
      this.audio.play();
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.player.classList.remove('playing');
      this.audio.pause();
    }

    // Restart audio

  }, {
    key: 'restart',
    value: function restart(e) {
      if (!!e) e.preventDefault();

      this.currentTime = 0;
      if (!this.isPlaying) this.play();
    }

    // when audio file can be played in user's browser

  }, {
    key: 'onCanPlay',
    value: function onCanPlay() {
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

  }, {
    key: 'onPlaying',
    value: function onPlaying() {
      this.ended = false;
      this.isPlaying = true;
      this.startProgressTimer();
    }

    // starts timer

  }, {
    key: 'startProgressTimer',
    value: function startProgressTimer() {
      var _this2 = this;

      this.timer = {};

      if (this.timer.sliderUpdateInterval) {
        clearInterval(this.timer.sliderUpdateInterval);
      }

      this.timer.sliderUpdateInterval = setInterval(function () {
        if (_this2.isPlaying) {
          _this2.currentTime = _this2.audio.currentTime;
          _this2.timeLeft = _this2.audio.duration - _this2.currentTime;
          var percentagePlayed = _this2.currentTime / _this2.audio.duration;
          _this2.updateVisualProgress(percentagePlayed);
        } else {
          clearInterval(_this2.timer.sliderUpdateInterval);
        }
      }, 60);
    }

    // when Player is paused

  }, {
    key: 'onPause',
    value: function onPause() {
      this.isPlaying = false;
    }

    // when Player ended playing an audio file

  }, {
    key: 'onEnd',
    value: function onEnd() {
      this.ended = true;
      this.isPlaying = false;
    }

    // on file load error

  }, {
    key: 'onError',
    value: function onError() {
      this.player.classList.add('cantplay');
      this.error = true;
      this.player.setAttribute('aria-invalid', 'true');
    }

    // to convert seconds to 'm:ss' format

  }, {
    key: 'convertSecToMin',
    value: function convertSecToMin(seconds) {
      if (seconds === 0) return '0:00';
      var minutes = Math.floor(seconds / 60);
      var secondsToCalc = Math.floor(seconds % 60) + '';
      return minutes + ':' + (secondsToCalc.length < 2 ? '0' + secondsToCalc : secondsToCalc);
    }

    // When user clicks somewhere on the progress bar

  }, {
    key: 'barClick',
    value: function barClick(e) {
      var _this3 = this;

      e.preventDefault();

      if (this.canBePlayed) {
        this.updateProgressBar(e);
        if (!this.isPlaying) {
          this.play();
        }
      } else if (this.preload === 'none') {
        this.audio.load();
        this.audio.addEventListener('loadedmetadata', function () {
          _this3.updateProgressBar(e);
          if (!_this3.isPlaying) {
            _this3.play();
          }
        }, false);
      }
    }

    // Helper function
    // that recalculates the progress bar position
    // based on the event.click position

  }, {
    key: 'updateProgressBar',
    value: function updateProgressBar(e) {
      var x = e.x - this.bar.getBoundingClientRect().left;
      var r = x / this.bar.getBoundingClientRect().width * this.audio.duration;
      this.updatePlayPosition(r);
    }

    // Helper function
    // updates the current time based on a time variable

  }, {
    key: 'updatePlayPosition',
    value: function updatePlayPosition(newTime) {
      this.currentTime = this.audio.currentTime = newTime;
      var percentagePlayed = this.currentTime / this.audio.duration;
      this.updateVisualProgress(percentagePlayed);
    }

    // Helper function
    // updates the progress bar based on a percentage played

  }, {
    key: 'updateVisualProgress',
    value: function updateVisualProgress(percentagePlayed) {
      this.progress.style.width = percentagePlayed * 100 + '%';
      this.time.innerHTML = this.convertSecToMin(this.timeLeft);
    }
  }]);

  return _class;
}();

},{}],2:[function(require,module,exports){
'use strict';

var _player = require('./player');

var docReady = function docReady() {
  var players = document.querySelectorAll('.podcast-player');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = players[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var player = _step.value;

      var player = new _player.PodcastPlayer(player);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
  docReady();
} else {
  document.addEventListener('DOMContentLoaded', docReady);
}

},{"./player":1}]},{},[2])

//# sourceMappingURL=podcast.js.map
