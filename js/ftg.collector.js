/**
 * This class collects anonymous data from the game and sends it to
 * a web server that catalogs everything. No personal information or
 * image is sent, just the current captured emotion (e.g. happy, sad, etc).
 */

var FTG = FTG || {};

FTG.Collector = function() {
	var COLLECT_INTERVAL 	= 500; 	// time, in milliseconds, to wait between logging entries.
	var SEND_INTERVAL 		= 5000;	// time, in milliseconds, to wait until data is send to the server

	var mLastTimeCollected = 0;
	var mLastTimeSent = 0;
	var mTimeGameStarted = 0;
	var mDebugConsole;
	var mServerURL = '../backend/';
	var mData = [];

	var isTimeToCollect = function() {
		return (getTimestamp() - mLastTimeCollected) >= COLLECT_INTERVAL;
	};

	var isTimeToSendData = function() {
		return (getTimestamp() - mLastTimeSent) >= SEND_INTERVAL;
	}

	var getTimestamp = function() {
		return (new Date()).getTime();
	};

	var init = function() {
		var aContainer;

		aContainer = document.getElementById('container'); // TODO: get this from config

		if(aContainer) {
			mDebugConsole = document.createElement('span');
			mDebugConsole.id = 'collector-console';
			mDebugConsole.style.position = 'absolute';
			mDebugConsole.style.bottom = '-20px';
			mDebugConsole.style.right = '20px';
			mDebugConsole.innerHTML = 'Waiting for camera setup';
			aContainer.appendChild(mDebugConsole);
		}
	};

	init();

	// Adds a new entry to the data log.
	this.log = function(theData, theForce) {
		// Collect only if it is time to do it
		if(isTimeToCollect() || theForce) {
			mData.push({t: getTimestamp(), d: JSON.stringify(theData)});

			if(!theForce) {
				mLastTimeCollected = getTimestamp();
			}
		}
	};

	// Send current recorded data to the server
	this.send = function(theUid, theGameId, theForce) {
		var aXmlRequest,
			aData;

		if(isTimeToSendData() || theForce) {
			if(mData.length < 0) {
				return;
			}

			mLastTimeSent = getTimestamp();

		    aData = new FormData();
			aData.append('uid', theUid);
			aData.append('game', theGameId);
			aData.append('data', JSON.stringify(mData));

		    aXmlRequest = new XMLHttpRequest();
	        aXmlRequest.onreadystatechange = function() {
	            if(aXmlRequest.readyState == 4 && aXmlRequest.status == 200) {
					console.log('[Collector] Data sent!', aXmlRequest.responseText);
	            }
	        };

	        aXmlRequest.open('post', mServerURL);
	        aXmlRequest.send(aData);

			// Clear the current data buffer
			this.clear();
		}
	};

	// Clear any data stored until now.
	this.clear = function() {
		mData.length = 0;
	};

	// Informs the data collector that the game has started.
	this.markGameStarted = function() {
		mTimeGameStarted = getTimestamp();
	};

	// Update the data collector internal functions (e.g. debug panel)
	this.update = function() {
		mDebugConsole.innerHTML = '<strong>Subject ID:</strong> XYZ<br /><strong>Time:</strong> ' + (getTimestamp() - mTimeGameStarted);
	};
};
