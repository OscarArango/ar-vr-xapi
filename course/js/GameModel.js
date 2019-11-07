// Model for the experience data
function GameModel ( startState ) {
    this.state = startState || GameModel.START;

    // the array of objects that has been identified in the scene
    this.foundObjects = [];
}

// STATIC CONSTANTS (don't need to be instantiated)
GameModel.START = 'start';
GameModel.LOOKING = 'looking'
GameModel.MODAL_OPEN = 'modalOpen';
GameModel.WON = 'won';
GameModel.PROMPT = 'prompt';

// ITEM CONSTANTS
GameModel.DESKS = 'desks';
GameModel.LIBRARY = 'library';
GameModel.RULES = 'rules';
GameModel.BULLETIN = 'bulletin';
GameModel.TEACHER_DESK = 'teacherDesk';

// COLORS
GameModel.RED = "#e73133";
GameModel.PURPLE = "#5a3580";

GameModel.ITEMS = [
    GameModel.DESKS,
    GameModel.LIBRARY,
    GameModel.RULES,
    GameModel.BULLETIN,
    GameModel.TEACHER_DESK
];

// PROPERTIES
// The current state of the application
GameModel.prototype.state = "";
// The list of objects that have been found so far
GameModel.prototype.foundObjects;

// METHODS
GameModel.prototype.setState = function( state ) {

};

GameModel.prototype.hasFoundItem = function( itemId ){
    return this.foundObjects.indexOf(itemId) >= 0;
};

GameModel.prototype.foundItem = function( itemId ){
    // already found killswitch
    if(this.hasFoundItem(itemId)){
        console.log('already found item:', itemId);
        return false;
    }

    // adding item
    this.foundObjects.push(itemId);
    console.log('added item:', itemId);

    return true;
};