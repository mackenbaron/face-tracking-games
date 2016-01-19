/**
 * This class describes a game level (scene).
 */
var Level = function (theGame) {
    // Properties
    var mFloor,
        mObstacles,
        mCurrentPlayerFloor,
        mFlatCounter,
        mLastAdded;

    // Constructor
    Phaser.Group.call(this, theGame);
    this.init();
};

// Lovely pants-in-the-head javascript boilerplate for OOP.
Level.prototype = Object.create(Phaser.Group.prototype);
Level.prototype.constructor = Level;

// Public methods

Level.prototype.init = function() {
    var aItem,
        i;

    mFloor = this.game.add.group();
    mObstacles = this.game.add.group();
    mLastAdded = {x: 0, y: this.game.world.centerY, width: 0, height: 0};
    mCurrentPlayerFloor = mLastAdded;
    mFlatCounter = 0;

    this.initTerrain();
    this.initObstacles();

    // Add a few pieces of floor to start with
    for(i = 0; i < 4; i++) {
        this.addNewPieceOfFloor(this.getDifficulty());
    }

    this.add(mFloor);
};

Level.prototype.initTerrain = function() {
    var aItem,
        i;

    // Create the slopes
    for(i = 0; i < 8; i++) {
        aItem = new Phaser.Sprite(this.game, 0, 0, i % 2 == 0 ? 'slope-up' : 'slope-down');
        this.initPhysics(aItem);
        mFloor.add(aItem);
        aItem.kill();
    }

    // Create the platforms
    for(i = 0; i < 5; i++) {
        aItem = new Phaser.Sprite(this.game, this.game.world.width / 2 * i, this.game.world.centerY, 'platform');
        this.initPhysics(aItem);
        mFloor.add(aItem);
        aItem.kill();
    }
};

Level.prototype.initObstacles = function() {
    var aItem,
        i;

    for(i = 0; i < 15; i++) {
        aItem = new Phaser.Sprite(this.game, 0, 0, i % 2 == 0 ? 'obstacle-top' : 'obstacle-bottom');

        this.initPhysics(aItem);
        mObstacles.add(aItem);
        aItem.kill();
    }
};

Level.prototype.initPhysics = function(theItem) {
    this.game.physics.enable(theItem, Phaser.Physics.ARCADE);
    theItem.body.allowGravity = false;
    theItem.body.velocity.x = -100;
    theItem.body.immovable = true;
    theItem.checkWorldBounds = true;
};

Level.prototype.update = function() {
    var i,
        aTotal,
        aItem,
        aDifficulty;

    Phaser.Group.prototype.update.call(this);

    // Get current difficulty configuration
    aDifficulty = this.getDifficulty();

    // Let's check who is the block touching the player
    // and if anything has moved out of the screen.
    mFloor.forEachAlive(function(theItem) {
        if(this.isFloor(theItem) && theItem.x > 0 && theItem.x <= this.game.width * Constants.PLAYER_POSITION_X) {
            mCurrentPlayerFloor = theItem.x > mCurrentPlayerFloor.x ? theItem : mCurrentPlayerFloor;
        }

        // Update item velocity according to game difficulty
        theItem.body.velocity.x = aDifficulty.speed;

        if(theItem.x <= -theItem.width) {
            if(this.isFloor(theItem)) {
                this.addNewPieceOfFloor(aDifficulty);
            }
            theItem.kill();
        }
    }, this);

    // Is there a gap on the screen?
    if(mLastAdded && mLastAdded.x + mLastAdded.width < this.game.width) {
        this.addNewPieceOfFloor(aDifficulty);
    }

    // Check if obstacles left the screen.
    mObstacles.forEachAlive(function(theItem) {
        if(theItem.x <= -theItem.width) {
            theItem.kill();
        }
    }, this);
};

Level.prototype.isFloor = function(theItem) {
    return theItem.key == 'platform' || theItem.key == 'slope-up' || theItem.key == 'slope-down';
};

Level.prototype.addNewPieceOfFloor = function(theDifficulty) {
    var aNew;

    // Do we have any previously added element as
    // a reference to base on?
    if(mLastAdded != null) {
        // Yes.
        // Was the last added element a platform?
        if(mLastAdded.key == 'platform' && mFlatCounter++ >= theDifficulty.platforms_before_slope) {
            // Yep! We can add a slope here then to make things more interesting.
            if(mLastAdded.y <= this.game.height * theDifficulty.slope_max_hight) {
                // We are too high right now, no room for up-slopes.
                // We must add a down-slope.
                aNew = this.getFirstDeadByType(mFloor, 'slope-down');

            } else if(mLastAdded.y >= this.game.height * theDifficulty.slope_min_hight) {
                // We are too low. It's time for a up-slope.
                aNew = this.getFirstDeadByType(mFloor, 'slope-up');

            } else {
                // We are not too high/low, so any slope will fit.
                aNew = this.getFirstDeadByType(mFloor, this.game.rnd.frac() < 0.5 ? 'slope-up' : 'slope-down');
            }

            aNew.reset(mLastAdded.x + mLastAdded.width - 30, mLastAdded.y - (aNew.key == 'slope-up' ? aNew.height / 2 - 5 : 0));
            mFlatCounter = 0;

        } else {
            // Nop, it was not a platform. We must add a platform here then.
            aNew = this.getFirstDeadByType(mFloor, 'platform');
            aNew.reset(mLastAdded.x + mLastAdded.width - 10, mLastAdded.y);

            if(mLastAdded.key != 'platform') {
                aNew.y += mLastAdded.key == 'slope-up' ? 0 : mLastAdded.height / 2 - 5;
            }
        }
    } else {
        aNew = this.getFirstDeadByType(mFloor, 'platform');
        aNew.reset(this.game.width, this.game.world.centerY);
    }

    if(aNew) {
        // Make the platform move
        aNew.body.velocity.x = theDifficulty.speed;
        // Tigh things together
        aNew.x -= 15;
        this.addNewObstacleIfAppropriate(aNew, theDifficulty);
    }

    mLastAdded = aNew;
};

Level.prototype.addNewObstacleIfAppropriate = function(theWhere, theDifficulty) {
    var aObstacle,
        aPosX,
        aPosY,
        i;

    if(theWhere.key == 'platform' && this.game.rnd.frac() <= theDifficulty.obstacles_chance) {
        for(i = 0; i < theDifficulty.obstacles_per_platform; i++) {
            aObstacle = aNew = this.getFirstDeadByType(mObstacles, this.game.rnd.frac() < 0.5 ? 'obstacle-top' : 'obstacle-bottom');

            if(aObstacle) {
                aPosX = theDifficulty.obstacle_min_pos + theWhere.x + theDifficulty.obstacle_spacing * i;
                aPosY = theWhere.y + -aObstacle.height + 5;

                aObstacle.reset(aPosX, aPosY);
                aObstacle.body.velocity.x = theWhere.body.velocity.x;

                if(aObstacle.key == 'obstacle-top') {
                    aObstacle.anchor.setTo(0.5);
                    aObstacle.body.angularVelocity = 100;
                    aObstacle.y -= 20;
                }
            }
        }
    }
};

Level.prototype.getFirstDeadByType = function(theGroup, theType) {
    var aRet;

    theGroup.forEachDead(function(theItem) {
        if(theItem.key == theType) {
            aRet = theItem;
        }
    });

    return aRet;
};

Level.prototype.getCurrentPlayerFloor = function() {
    return mCurrentPlayerFloor;
};

Level.prototype.getFloor = function() {
    return mFloor;
};

Level.prototype.getSlopes = function() {
    return mFloor;
};

Level.prototype.getObstacles = function() {
    return mObstacles;
};

Level.prototype.getDifficulty = function() {
    return Game.state.states[Game.state.current].getDifficulty();
};
