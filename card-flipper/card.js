/**
 * This class describes a card in the game
 */
Card = function (theX, theY) {
    // Properties
    this.mText = null;
    this.mFlipUpCounter = 0;

    // Constructor
    Phaser.Sprite.call(this, Game, theX, theY, 'card');
    this.init();
};

// Lovely pants-in-the-head javascript boilerplate for OOP.
Card.prototype = Object.create(Phaser.Sprite.prototype);
Card.prototype.constructor = Card;

// Public methods

Card.prototype.init = function() {
    this.mText = Game.add.text(0, 0, '5', {font: "50px Arial", fill: "#ffffff", align: "center"});
    this.mText.visible = false;
    this.mText.anchor.set(0.5);
    this.mText.position.x = this.position.x;
    this.mText.position.y = this.position.y;

    // Centralize graphics
    this.anchor.set(0.5);

    //  Enables all kind of input actions on this image (click, etc)
	this.inputEnabled = true;
    this.events.onInputDown.add(this.onClick, this);
};

Card.prototype.isFlipped = function() {
    return this.frame != 0;
};

// Randomize the content of the card (number, color, etc)
Card.prototype.randomize = function() {
    var aRand = Game.rnd;

    this.mText.text     = aRand.integerInRange(1, Constants.CARDS_MAX_NUMBER);
    this.frame          = aRand.integerInRange(1, Constants.CARDS_MAX_COLORS);
};

Card.prototype.flip = function() {
    if(this.isFlipped()) {
        this.flipDown();

    } else {
        this.flipUp();
    }
};

Card.prototype.flipUp = function() {
    if(!this.isFlipped()) {
        this.randomize();

        this.mFlipUpCounter = Game.rnd.integerInRange(Constants.CARDS_MIN_FLIP_SHOW, Constants.CARDS_MAX_FLIP_SHOW);
        this.mText.visible = true;
    }
};

Card.prototype.flipDown = function() {
    if(this.isFlipped()) {
        this.frame = 0;
        this.mText.visible = 0;
    }
};

Card.prototype.onClick = function() {
    console.log('card clicked!');
};

Card.prototype.update = function() {
    if(this.isFlipped()) {
        this.mFlipUpCounter -= Game.time.elapsed;

        if(this.mFlipUpCounter <= 0) {
            this.flipDown();
        }
    }
};
