var FTG = FTG || {};

FTG.Camera = function() {
	var mSelf = this;
	var mVideo;
	var mOverlay;
	var mCanvas;

	// Code from:
	// 	https://github.com/auduno/clmtrackr/tree/dev/examples
	// 	MIT licensed, Copyright (c) 2013, Audun Mathias Øygard
	var initUserMediaStuff = function() {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

		// check for camerasupport
		if (navigator.getUserMedia) {

			var aVideoSelector = {video : true};

			if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
				var aChromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
				if (aChromeVersion < 20) {
					aVideoSelector = "video";
				}
			}

			navigator.getUserMedia(aVideoSelector, function( theStream ) {
				if (mVideo.mozCaptureStream) {
					mVideo.mozSrcObject = theStream;
				} else {
					mVideo.src = (window.URL && window.URL.createObjectURL(theStream)) || theStream;
				}
				mVideo.play();

			}, function() {
				alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
			});

		} else {
			alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
		}
	};

	this.init = function(theVideoElement, theOverlay, theCallback) {
		console.debug('Camera init');

		mVideo 	 = document.getElementById(theVideoElement);
		mOverlay = document.getElementById(theOverlay);
		mCanvas  = mOverlay.getContext('2d');

		initUserMediaStuff();
		mVideo.addEventListener('canplay', theCallback, false);
	};

	this.playCameraFeed = function() {
		mVideo.play();
	};

	this.getVideo = function() {
		return mVideo;
	};
};
