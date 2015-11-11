/**
 * A class with all constants in the game
 */

var Constants = new function() {
	this.GAME_WIDTH 			= 1024;
	this.GAME_HEIGHT 			= 768;
	this.GAME_MATCH_DURATION	= 5 * 60 * 1000; // Duration, in milliseconds, of a single match.
	this.GAME_ENABLE_DATA_LOG	= true; 	// Defines if the game should collect and send anonymous data regarding usage
	this.GAME_HEALTH_MAX		= 100; 		// Max health points available in the game.
	this.GAME_MISTAKE_HEALTH	= 5; 		// How many health point you loose when you make a mistake.
	this.GAME_CORRECT_HEALTH	= 1; 		// How many health point you win when you make a mistake.

	this.CARDS_MAX 				= 25;		// Total number of cards in the game
	this.CARDS_PER_ROW 			= 5;		// Amount of cards in each row
	this.CARDS_MIN_FLIPS_TURN	= 2;		// Min amount of cards that will will be flipped every time a new question is generated.
	this.CARDS_MAX_FLIPS_TURN	= 5;		// Max amount of cards that will will be flipped every time a new question is generated.
	this.CARDS_COLORS			= 7;
	this.CARDS_DIST_TARGET		= 100;

	this.QUESTION_DURATION		= 20000;	// Time, in milliseconds, a question should remain active

	this.HUD_RIGHT_WRONG_TTL	= 1000;		// Time, in milliseconds, the "right/wrong" sign remains on the screen.
};
