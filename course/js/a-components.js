var gameModel = new GameModel();
var gameController = new GameController(gameModel);

const DO_WIN = 'doWin';
const PLAY_SOUND = 'playSound';
const APP_ID = 'eduleaders';
const CLOSING = 'closing';

// GLOBAL APP COMPONENT
AFRAME.registerSystem(APP_ID, {
    nextSound: null,
    hasWon: false,
    dispatchSound: function(id){
        console.log('app dispatchSound:', id);
        this.el.emit(PLAY_SOUND, id);
    },
    doWin: function(){
        this.hasWon = true;

        this.el.emit(DO_WIN);
    }
});

AFRAME.registerComponent(APP_ID, {
    init: function () {
        // start the game
        gameController.startGame();

        // alert('Starting Eduleaders with camera rotation object:' + document.querySelector('a-camera').object3D.position.y + " " + document.querySelector('a-camera').object3D.rotation.y)
        document.querySelector('a-camera').object3D.rotation.y = 0;
    }
});

// AUDIO CONTROLLER
AFRAME.registerComponent('audio-controller', {
    currSound: null,
    init: function(){
        // listen for the scene to emit a scene change event, and play an audio cue
        document.querySelector('a-scene').addEventListener(PLAY_SOUND, this.playSound.bind(this));

        // $(window).blur( this.pauseSound.bind(this) );
        // $(window).focus( this.resumeSound.bind(this) );
    },
    pauseSound: function(){
        console.log('pauseSound:', this.currSound);

        if(this.currSound){
            this.currSound.pause();
        }
    },
    resumeSound: function(){
        if(this.currSound){
            this.currSound.play();
        }
    },
    playSound: function(evt){
        var soundId = './assets/audio/';
        var nextSound;
        switch(evt.detail){
            case 'start':
                // soundId += 'Intro Text-testing.mp3';
                soundId += 'Intro Text.mp3';
                break;
            case CLOSING:
                soundId += 'Closing.mp3';
                break;
            case GameModel.TEACHER_DESK + '_BODY':
                soundId += 'Interaction_teacherDesk_BODY.mp3';
                nextSound = GameModel.TEACHER_DESK + '_RESULT';
                break;
            case GameModel.TEACHER_DESK + '_RESULT':
                soundId += 'Interaction_teacherDesk_RESULT.mp3';
                break;
            case GameModel.LIBRARY + '_BODY':
                soundId += 'Interaction_library_BODY.mp3';
                nextSound = GameModel.LIBRARY + '_RESULT';
                break;
            case GameModel.LIBRARY + '_RESULT':
                soundId += 'Interaction_library_RESULT.mp3';
                break;
            case GameModel.RULES + '_BODY':
                soundId += 'Interaction_rules_BODY.mp3';
                nextSound = GameModel.RULES + '_RESULT';
                break;
            case GameModel.RULES + '_RESULT':
                soundId += 'Interaction_rules_RESULT.mp3';
                break;
            case GameModel.DESKS + '_BODY':
                soundId += 'Interaction_desks_BODY.2.mp3';
                nextSound = GameModel.DESKS + '_RESULT';
                break;
            case GameModel.DESKS + '_RESULT':
                soundId += 'Interaction_desks_RESULT.mp3';
                break;
            case GameModel.BULLETIN + '_BODY':
                soundId += 'Interaction_bulletin_BODY.mp3';
                nextSound = GameModel.BULLETIN + '_RESULT';
                break;
            case GameModel.BULLETIN + '_RESULT':
                soundId += 'Interaction_bulletin_RESULT.mp3';
                break;
            case GameModel.PROMPT:
                soundId += 'Prompt_Ver_1.mp3';
                console.log('nextSound:', evt.next);
                break;
            default:
                soundId = '';
                break;
        }

        if(this.currSound){
            TweenMax.to(this.currSound, 0.5, {volume: 0, onCompleteScope: this.currSound, onComplete: function(){ this.stop(); }});
        }

        // if there was a sound to play, play it, and handle the end of the sound differently depending on the sound id
        if(soundId){

            // save the next sound
            if(nextSound){
                console.log('saving the next sound as:', nextSound);
                document.querySelector('a-scene').systems[APP_ID].nextSoundId = nextSound;
            }

            this.currSound = new Howl({
                src: [soundId],
                autoplay: true,
                onend: (function() {
                    var shouldPlayPrompt = true;
                    if(nextSound){
                        switch (nextSound) {
                            case GameModel.LIBRARY + '_RESULT':
                            case GameModel.RULES + '_RESULT':
                            case GameModel.DESKS + '_RESULT':
                                shouldPlayPrompt = false;
                                break;
                            default:
                                break;
                        }

                        if(shouldPlayPrompt){
                            this.playPrompt(nextSound);
                        }
                        else {
                            this.dispatchSound(nextSound);
                        }
                    }
                    else {
                        this.currSound = null;
                    }
                }).bind(this)
            });

        }
    },
    playPrompt: function(nextSound){
        console.log('playPrompt:', nextSound);

        this.playSound( {detail: GameModel.PROMPT} );
    }
});

// CURSOR-COMPONENT
AFRAME.registerComponent('cursor-component', {
    init: function () {
        // make sure the object is in front of other objects
        this.el.object3D.renderOrder = 1000;
    }
});

AFRAME.registerComponent('color-shift', {
    init: function () {
        TweenMax.to(this.el, 0, {attr: {color: GameModel.PURPLE}});

        this.el.addEventListener('fusing', (function (evt) {
            evt.stopPropagation();

            console.log('fusing started on color shifter');
            TweenMax.to(this.el, 1, {attr: {color: GameModel.RED}});
        }).bind(this));

        this.el.addEventListener('click', (function (evt) {
            evt.stopPropagation();

            console.log('click started on color shifter');
            TweenMax.to(this.el, 1, {attr: {color: GameModel.PURPLE}});
        }).bind(this));

        this.el.addEventListener('mouseleave', (function (evt) {
            evt.stopPropagation();

            console.log('mouseleave started on color shifter');
            TweenMax.to(this.el, 1, {attr: {color: GameModel.PURPLE}});
        }).bind(this));
    }
});

// WHITEBOARD
AFRAME.registerComponent('whiteboard', {
    init: function () {
        var obj3D = this.el.querySelector('.logo').object3D;
        obj3D.renderOrder = 35;

        obj3D = this.el.querySelector('.check-1').object3D;
        obj3D.renderOrder = 33;
        console.log('whiteboard check 1:', obj3D);

        // set the render order of the layers
        obj3D = this.el.querySelector('.check-2').object3D;
        obj3D.renderOrder = 30;
        console.log('whiteboard check 2:', obj3D);

        obj3D = this.el.querySelector('.check-3').object3D;
        obj3D.renderOrder = 28;
        console.log('whiteboard check 3:', obj3D);

        obj3D = this.el.querySelector('.check-4').object3D;
        obj3D.renderOrder = 25;
        console.log('whiteboard check 4:', obj3D);

        obj3D = this.el.querySelector('.check-5').object3D;
        obj3D.renderOrder = 25;
        console.log('whiteboard check 5:', obj3D);

        obj3D = this.el.querySelector('.tasks').object3D;
        obj3D.renderOrder = 23;
    }
});

// INTRO MODAL
AFRAME.registerComponent('intro-modal', {
    init: function () {
        console.log('intro modal:', this.el.object3D);

        var obj3D = this.el.querySelector('.logo').object3D;
        obj3D.renderOrder = 35;
        console.log('intro logo:', obj3D);

        obj3D = this.el.querySelector('.purple-accent').object3D;
        obj3D.renderOrder = 33;
        console.log('intro accent:', obj3D);

        // set the render order of the layers
        obj3D = this.el.querySelector('.header').object3D;
        obj3D.renderOrder = 30;
        console.log('intro header:', obj3D);

        obj3D = this.el.querySelector('.body').object3D;
        obj3D.renderOrder = 28;
        console.log('intro body:', obj3D);

        obj3D = this.el.querySelector('.ok-button').object3D;
        obj3D.renderOrder = 25;
        console.log('intro button:', obj3D);

        obj3D = this.el.querySelector('.white-blocker').object3D;
        obj3D.renderOrder = 23;
        console.log('intro blocker:', obj3D);

        this.el.addEventListener('show', this.show.bind(this));

        this.el.addEventListener('hide', this.hide.bind(this));

        this.el.emit('show');

        // trigger play the sound event
        setTimeout(function(){
            document.querySelector('a-scene').systems[APP_ID].dispatchSound('start');
        }, 100);

        if(document.querySelector('a-scene').is('vr-mode')){
            this.el.object3D.position.y -= 1.6;
        }

    },
    show: function(evt){
        evt.stopPropagation();

        console.log('show event handled');
        var initialDelay = 1;

        // animations
        var obj3D = this.el.querySelector('.accent-holder').object3D;
        TweenMax.to(obj3D.scale, 0.5, {x: 0.15, delay: initialDelay});

        obj3D = this.el.querySelector('.header');
        TweenMax.to(obj3D, 1, {attr: { opacity: 1}, delay: initialDelay + .5});

        obj3D = this.el.querySelector('.body');
        TweenMax.to(obj3D, 1, {attr: { opacity: 1}, delay: initialDelay + .7});

        obj3D = this.el.querySelector('.logo');
        TweenMax.to(obj3D, 1, {attr: { opacity: 1}, delay: initialDelay});

        // show the black blocker
        obj3D = document.querySelector('#modal-blocker-sphere');
        obj3D.object3D.visible = true;
        obj3D.classList.add('clickable');

        // tell the button to fade in
        setTimeout((function(){
                this.emit('show');
            }).bind(this.el.querySelector('.ok-button')),
            2000);

    },
    hide: function(evt){
        evt.stopPropagation();

        var initialDelay = 0;

        // animations
        var obj3D = this.el.querySelector('.accent-holder').object3D;
        TweenMax.to(obj3D.scale, 0.7, {x: 1, delay: initialDelay});

        obj3D = this.el.querySelector('.header');
        TweenMax.to(obj3D, 0.4, {attr: { opacity: 0}, delay: initialDelay});

        obj3D = this.el.querySelector('.body');
        TweenMax.to(obj3D, 0.4, {attr: { opacity: 0}, delay: initialDelay + .2});

        obj3D = this.el.querySelector('.logo');
        TweenMax.to(obj3D, 0.4, {attr: { opacity: 0}, delay: initialDelay});

        document.querySelector('a-scene').systems[APP_ID].dispatchSound();

        // tell the button to fade out
        this.el.querySelector('.ok-button').emit('hide');
        setTimeout(
            (function(){
                this.el.setAttribute('visible', 'false');

                // hide the black blocker
                obj3D = document.querySelector('#modal-blocker-sphere');
                obj3D.object3D.visible = false;
                obj3D.classList.remove('clickable');
            }).bind(this),
            700);
    },
    remove: function(){
        console.log('remove intro modal');

        this.el.removeEventListener('show', this.show);
        this.el.removeEventListener('hide', this.hide);
    }

});

// FOUND MODAL
AFRAME.registerComponent('found-modal', {

    init: function () {
        console.log('found modal:', this.el.object3D);
        var obj3D;

        // obj3D = this.el.querySelector('.purple-accent').object3D;
        // obj3D.renderOrder = 33;
        console.log('intro accent:', obj3D);

        obj3D = this.el.querySelector('.image-new').object3D;
        obj3D.renderOrder = 25;
        obj3D.scale.x = obj3D.scale.y = obj3D.scale.z = (document.querySelector('a-scene').is('vr-mode')) ? 0.7 : 1;

            console.log('new image:', obj3D);

        obj3D = this.el.querySelector('.image-old').object3D;
        obj3D.renderOrder = 23;
        obj3D.scale.x = obj3D.scale.y = obj3D.scale.z = (document.querySelector('a-scene').is('vr-mode')) ? 0.7 : 1;
        console.log('old image:', obj3D);

/*
        // set the render order of the layers
        obj3D = this.el.querySelector('.header').object3D;
        obj3D.renderOrder = 29;
        console.log('intro header:', obj3D);

        obj3D = this.el.querySelector('.body').object3D;
        obj3D.renderOrder = 28;
        console.log('intro body:', obj3D);

        obj3D = this.el.querySelector('.white-blocker').object3D;
        obj3D.renderOrder = 23;
        console.log('intro blocker:', obj3D);
*/

        this.el.addEventListener('show', this.show.bind(this));
        this.el.addEventListener('hide', this.hide.bind(this));
        this.el.addEventListener('back', this.back.bind(this));
        this.el.addEventListener('next', this.next.bind(this));
    },
    back: function(evt){
        // hide the old image and show the new one
        var obj3D;

        obj3D = this.el.querySelector('.image-new');
        TweenMax.to( obj3D, 0.8, {attr:{opacity:0}, delay: 0});

        obj3D = this.el.querySelector('.image-old');
        TweenMax.to( obj3D, 0.8, {attr:{opacity:1}, delay: 0.2});

        // hide the close/back buttons
        this.el.querySelector('.close-button').emit('hide');
        this.el.querySelector('.back-button').emit('hide');

        // show the next button
        setTimeout((function(){
                this.emit('show');
            }).bind(this.el.querySelector('.next-button')),
            1000);
    },
    next: function(evt){
        // hide the old image and show the new one
        var obj3D;

        obj3D = this.el.querySelector('.image-old');
        TweenMax.to( obj3D, 0.8, {attr:{opacity:0}, delay: 0});

        obj3D = this.el.querySelector('.image-new');
        TweenMax.to( obj3D, 0.8, {attr:{opacity:1}, delay: 0.2});

        // hide the next button
        this.el.querySelector('.next-button').emit('hide');

        // show the close and back buttons
        setTimeout((function(){
                this.emit('show');
            }).bind(this.el.querySelector('.close-button')),
            1200);

        // tell the button to fade in
        setTimeout((function(){
                this.emit('show');
            }).bind(this.el.querySelector('.back-button')),
            900);

        console.log('doing next sound:', this.nextSoundId, document.querySelector('a-scene').systems[APP_ID].nextSoundId)
        // play the "NEXT SOUND" and set nextSoundId to null
        if(document.querySelector('a-scene').systems[APP_ID].nextSoundId){
            document.querySelector('a-scene').systems[APP_ID].dispatchSound(document.querySelector('a-scene').systems[APP_ID].nextSoundId);

            document.querySelector('a-scene').systems[APP_ID].nextSoundId = null;
        }
    },
    show: function(evt){
        evt.stopPropagation();

        this.el.setAttribute('visible', 'true');

        var initialDelay = 0, obj3D;

        // hide the new image
        obj3D = this.el.querySelector('.image-new');
        obj3D.setAttribute('opacity', '0');

        // hide the old image and show it first
        obj3D = this.el.querySelector('.image-old');
        obj3D.setAttribute('opacity', '0');
        TweenMax.to( obj3D, 1, {attr:{opacity:1}, delay: initialDelay});

        /*
                // animations
                obj3D = this.el.querySelector('.accent-holder').object3D;
                TweenMax.to(obj3D.scale, 0.5, {x: 0.08, delay: initialDelay});

                obj3D = this.el.querySelector('.header');
                TweenMax.to(obj3D, 1, {attr: { opacity: 1}, delay: initialDelay + .5});

                obj3D = this.el.querySelector('.body');
                TweenMax.to(obj3D, 1, {attr: { opacity: 1}, delay: initialDelay + .7});
        */

        // show the black blocker
        obj3D = document.querySelector('#modal-blocker-sphere');
        obj3D.object3D.visible = true;
        obj3D.classList.add('clickable');

        // tell the button to fade in
        setTimeout((function(){
                this.emit('show');
            }).bind(this.el.querySelector('.next-button')),
            1000);

    },
    hide: function(evt){
        evt.stopPropagation();

        var initialDelay = 0;

        /*
                // animations
                var obj3D = this.el.querySelector('.accent-holder').object3D;
                TweenMax.to(obj3D.scale, 0.7, {x: 1, delay: initialDelay});

                obj3D = this.el.querySelector('.header');
                TweenMax.to(obj3D, 0.4, {attr: { opacity: 0}, delay: initialDelay});

                obj3D = this.el.querySelector('.body');
                TweenMax.to(obj3D, 0.4, {attr: { opacity: 0}, delay: initialDelay + .2});
        */

        // tell the button to fade out
        this.el.querySelector('.back-button').emit('hide');
        this.el.querySelector('.close-button').emit('hide');
        TweenMax.to(document.querySelector('.image-new'), 0.7, {attr:{opacity:0}, onCompleteScope: this, onComplete: function(){
            this.el.setAttribute('visible', 'false');

            // hide the black blocker
            obj3D = document.querySelector('#modal-blocker-sphere');
            obj3D.object3D.visible = false;
            obj3D.classList.remove('clickable');

        }});

        // play the next sound, which is likely nothing
        document.querySelector('a-scene').systems[APP_ID].dispatchSound(document.querySelector('a-scene').systems[APP_ID].nextSoundId);

        // TODO: Update placement of this logic
        // set a timer to play the win animation if we're there yet
        let hasWon = !document.querySelector('a-scene').systems[APP_ID].hasWon && gameModel.foundObjects.length >= 5;
        if(hasWon){
            setTimeout((function(){
                document.querySelector('a-scene').systems[APP_ID].doWin();

                xAPId.SetReachedEnd();
                xAPId.TCAPI_CommitData();
        


            }).bind(this), 2000);
        }
        else {
          console.log('still havent won with foundObjects:', gameModel.foundObjects, 'hasWon:', document.querySelector('a-scene').systems[APP_ID].hasWon);
        }


        /*
                setTimeout(
                    (function(){
                        this.el.setAttribute('visible', 'false');

                        // hide the black blocker
                        obj3D = document.querySelector('#modal-blocker-sphere');
                        obj3D.object3D.visible = false;
                        obj3D.classList.remove('clickable');
                    }).bind(this),
                    700);
        */
    },
    remove: function(){
        console.log('remove intro modal');

        this.el.removeEventListener('show', this.show);
        this.el.removeEventListener('hide', this.hide);
        this.el.removeEventListener('back', this.back);
        this.el.removeEventListener('next', this.next);
    }

});

// WIN MODAL
AFRAME.registerComponent('win-modal', {
    init: function () {
        console.log('intro modal:', this.el.object3D);

        var obj3D = this.el.querySelector('.logo').object3D;
        obj3D.renderOrder = 35;
        console.log('intro logo:', obj3D);

        obj3D = this.el.querySelector('.purple-accent').object3D;
        obj3D.renderOrder = 24;
        console.log('intro accent:', obj3D);

        // set the render order of the layers
        obj3D = this.el.querySelector('.header').object3D;
        obj3D.renderOrder = 30;
        console.log('intro header:', obj3D);

        obj3D = this.el.querySelector('.body').object3D;
        obj3D.renderOrder = 28;
        console.log('intro body:', obj3D);

        obj3D = this.el.querySelector('.ok-button').object3D;
        obj3D.renderOrder = 25;
        console.log('intro button:', obj3D);

        obj3D = this.el.querySelector('.white-blocker').object3D;
        obj3D.renderOrder = 23;
        console.log('intro blocker:', obj3D);

        this.el.addEventListener('show', this.show.bind(this));

        this.el.addEventListener('hide', this.hide.bind(this));

        document.querySelector('a-scene').addEventListener(DO_WIN, this.show.bind(this));

        if(document.querySelector('a-scene').is('vr-mode')){
            this.el.object3D.position.y -= 1.6;
        }

    },
    show: function(evt){
        evt.stopPropagation();

        console.log('showing win screen because WE WON!');

        document.querySelector('a-scene').systems['eduleaders'].dispatchSound(CLOSING);

        gameController.faceModalToCamera(this.el.object3D);
        this.el.object3D.position.y = 0;
        this.el.object3D.rotation.x = 0;
        this.el.object3D.lookAt(new THREE.Vector3());

        this.el.setAttribute('visible', 'true');

        console.log('show event handled');
        var initialDelay = 1;

        // animations
        var obj3D = this.el.querySelector('.accent-holder').object3D;
        TweenMax.to(obj3D.scale, 0.5, {x: 0.15, delay: initialDelay});

        obj3D = this.el.querySelector('.header');
        TweenMax.to(obj3D, 1, {attr: { opacity: 1}, delay: initialDelay + .5});

        obj3D = this.el.querySelector('.body');
        TweenMax.to(obj3D, 1, {attr: { opacity: 1}, delay: initialDelay + .7});

        obj3D = this.el.querySelector('.logo');
        TweenMax.to(obj3D, 1, {attr: { opacity: 1}, delay: initialDelay});

        // show the black blocker
        obj3D = document.querySelector('#modal-blocker-sphere');
        obj3D.object3D.visible = true;
        obj3D.classList.add('clickable');

        // tell the button to fade in
        setTimeout((function(){
                this.emit('show');
            }).bind(this.el.querySelector('.ok-button')),
            2000);

    },
    hide: function(evt){
        evt.stopPropagation();

        var initialDelay = 0;

        // animations
        var obj3D = this.el.querySelector('.accent-holder').object3D;
        TweenMax.to(obj3D.scale, 0.7, {x: 1, delay: initialDelay});

        obj3D = this.el.querySelector('.header');
        TweenMax.to(obj3D, 0.4, {attr: { opacity: 0}, delay: initialDelay});

        obj3D = this.el.querySelector('.body');
        TweenMax.to(obj3D, 0.4, {attr: { opacity: 0}, delay: initialDelay + .2});

        obj3D = this.el.querySelector('.logo');
        TweenMax.to(obj3D, 0.4, {attr: { opacity: 0}, delay: initialDelay});

        document.querySelector('a-scene').systems[APP_ID].dispatchSound();

        setTimeout( (function(){
            console.log('modal:', this);
                this.el.setAttribute('visible', 'false');

                // hide the black blocker
                obj3D = document.querySelector('#modal-blocker-sphere');
                obj3D.object3D.visible = false;
                obj3D.classList.remove('clickable');

            }).bind(this), 1000);

        // tell the button to fade out
        this.el.querySelector('.ok-button').emit('hide');
        setTimeout(
            (function(){
                this.el.setAttribute('visible', 'false');

                // hide the black blocker
                obj3D = document.querySelector('#modal-blocker-sphere');
                obj3D.object3D.visible = false;
                obj3D.classList.remove('clickable');
            }).bind(this),
            700);
    },
    remove: function(){
        console.log('remove intro modal');

        this.el.removeEventListener('show', this.show);
        this.el.removeEventListener('hide', this.hide);
    }

});

// FINDABLES
AFRAME.registerComponent('findable', {
    schema: {
        id: {
            type: 'string',
            default: ''
        }
    },
    init: function () {

        console.log('this.data.target:', this.data.target, gameController);
        console.log('create marker:', this.data.id, this.el.object3D);

        // give the object a clickable class
        this.el.classList.add('clickable');

        // make sure the object is in front of other objects
        var el3D = this.el.object3D.children[0];
        el3D.renderOrder = 10;
        el3D.material.opacity = 0;

        // Face the marker towards the camera
        var cameraPosition = document.querySelector('a-camera').object3D.getWorldPosition();
        el3D.lookAt(cameraPosition);

        this.el.addEventListener('click', (function(evt){
            // set the controller's item as found
            gameController.foundItem(this.data.id);

            // turn on the material
            TweenMax.to( el3D.material, 0.5, {opacity:1});
        }).bind(this));

        this.el.addEventListener('fusing', (function(evt){
        }).bind(this));

        this.el.addEventListener('mouseleave', (function(evt){
            console.log('gameController:', gameController);
        }).bind(this));
    }
});

// OK-button
AFRAME.registerComponent('ok-button', {
    schema: {
        id: {
            type: 'string',
            default: ''
        }
    },
    init: function () {

        console.log('this.data.target:', this.data.target, gameController);
        console.log('create ok-button:', this.data.id, this.el.object3D);

        // give the object a clickable class
        // this.el.querySelector('.button-image').classList.add('clickable');

        console.log('button:', this.el.object3D);

        // set the render order of the layers
        var obj3D = this.el.querySelector('.button-caption').object3D;
        obj3D.renderOrder = 30;
        console.log('ok caption: ', obj3D);

        obj3D = this.el.querySelector('.button-image').object3D;
        obj3D.renderOrder = 28;

        this.el.addEventListener('show', (function(evt){
            evt.stopPropagation();

            this.enable();

            this.el.setAttribute('visible', 'true');

            TweenMax.to(this.el.querySelector('.button-image'), 0.5, {attr:{ opacity: 1}})
            TweenMax.to(this.el.querySelector('.button-caption'), 0.5, {attr:{ opacity: 1}, delay: 0.3})
        }).bind(this));

        this.el.addEventListener('hide', (function(evt){
            evt.stopPropagation();

            this.disable();

            TweenMax.to(this.el.querySelector('.button-caption'), 0.5, {attr:{ opacity: 0}})
            TweenMax.to(this.el.querySelector('.button-image'), 0.5, {attr:{ opacity: 0}, delay: 0.3, onCompleteScope: this.el, onComplete: function(){
                this.setAttribute('visible', 'false');
            }})
        }).bind(this));

        // add mouse events
        TweenMax.to(this.el.querySelector('.button-image'), 0, {attr:{ color: GameModel.RED}});
        this.el.addEventListener('mouseenter', (function(evt){
            console.log('mouse over ok button');

            TweenMax.to(this.el.querySelector('.button-image'), 1, {attr:{ color: GameModel.PURPLE}});
        }).bind(this));
        this.el.addEventListener('mouseleave', (function(evt){
            console.log('mouse over ok button');

            TweenMax.to(this.el.querySelector('.button-image'), 0.5, {attr:{ color: GameModel.RED}});
        }).bind(this));

        this.el.querySelector('.button-image').addEventListener('click', (function(evt){
            console.log('clicked ok in modal: ', this.data.id);

            // HANDLE THE DIFFERENT CLOSE BUTTON EVENT TYPES
            switch(this.data.id){
                case 'close-intro':
                    document.querySelector('#intro-modal-ent').emit('hide');
                    break;
                case 'close-win':
                    document.querySelector('#win-modal-ent').emit('hide');
                    break;
                case 'next-found':
                    document.querySelector('#found-modal-ent').emit('next');
                    break;
                case 'back-found':
                    document.querySelector('#found-modal-ent').emit('back');
                    break;
                case 'close-found':
                    document.querySelector('#found-modal-ent').emit('hide');
                    break;
                default:
                    break;
            }
        }).bind(this));
    },
    enable: function(){
        this.el.querySelector('.button-image').classList.add('clickable');
    },
    disable: function(){
        this.el.querySelector('.button-image').classList.remove('clickable');
    },
    remove: function(){

    }
});

// MODAL BLOCKER
AFRAME.registerComponent('modal-blocker', {
    init: function () {
        // give the object a clickable class
        this.el.classList.add('clickable');

        console.log('modal-blocker component:', this.el.object3D)
        this.el.object3D.children[0].material.side = THREE.DoubleSide;
        this.el.object3D.children[0].material.transparent = true;
        this.el.object3D.children[0].material.opacity = 0.8;

        this.el.addEventListener('click', (function(){
            console.log('just bind this to the click handler')
        }).bind(this))
    },

});
