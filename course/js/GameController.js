function GameController( gameModel ){
    this.gameModel = gameModel;

    console.log('inited gamecontroller with model:', gameModel);
}

// METHODS
GameController.prototype.startGame = function(){
    // start by setting the game model to be visible
    var introModal = document.getElementById('intro-modal-ent').object3D;

    // position the modal to face the camera
    // this.faceModalToCamera(introModal, false);

    // show the modal
    introModal.visible = true;

};

GameController.prototype.foundItem = function( itemId ){
    // if we are just finding this item, say so
    console.log('GameController found item:', itemId);

    this.gameModel.foundItem(itemId);
    // if(this.gameModel.foundItem(itemId)){
        // show the found item modal if we're just finding this
        this.showFoundModal( itemId );

        // check if we've found everything, and if so change the classroom
        if(GameModel.ITEMS.length === this.gameModel.foundObjects.length){
            document.querySelector('#sky-bg').setAttribute('src', '#img-clean-plate');
        }
    // }

};

GameController.prototype.showFoundModal = function( itemId ){
    var foundModal = document.querySelector('#found-modal-ent').object3D;

    // position the modal to face the camera
    this.faceModalToCamera(foundModal);

    // set modal content for the item found
    this.setModalInfo( itemId );

    // trigger play the sound event
    document.querySelector('a-scene').systems['eduleaders'].dispatchSound(itemId + '_BODY');

    // show the modal
    document.querySelector('#found-modal-ent').emit('show');

    // turn on the checkmark
    var checkId;
    switch(itemId){
        case GameModel.DESKS:
            checkId = 1;
            break;
        case GameModel.LIBRARY:
            checkId = 2;
            break;
        case GameModel.TEACHER_DESK:
            checkId = 3;
            break;
        case GameModel.BULLETIN:
            checkId = 4;
            break;
        case GameModel.RULES:
            checkId = 5;
            break;
    }

    document.querySelector('.check-' + checkId).setAttribute('visible', 'true');
};

GameController.prototype.setModalInfo = function( itemId ){
    var title, body, image1Id, image2Id;

    // get references to the modal data
    switch( itemId ){
        case GameModel.DESKS:
            title = 'Student Desks';
            body = 'Students have no flexible seating options. Teacher desk is front and center. When students have a say in how they learn, when they are trusted to exercise good judgment, awesome things can happen. The best classroom seating arrangements are the ones designed by the students to meet their individual needs.';
            image1Id = '#img-desks-dirty';
            image2Id = '#img-desks-clean';
            break;
        case GameModel.LIBRARY:
            title = 'Classroom Library';
            body = 'The library collection is Euro-centered and includes books with mostly white protagonists. Instead, build an inclusive library that features diverse authors and showcases multiple perspectives. When students see themselves reflected in the literature, they are more likely to engage with the text.';
            image1Id = '#img-library-dirty';
            image2Id = '#img-library-clean';
            break;
        case GameModel.TEACHER_DESK:
            title = 'Curricula and Materials';
            body = 'The materials do not reflect the diversity of experiences and cultures in the classroom. Critical questions about power, privilege and systems are missing across content areas. We encourage you to consider how course content and assignments represent and give voice to all learners.';
            image1Id = '#img-teacher-desk-dirty';
            image2Id = '#img-teacher-desk-clean';
            break;
        case GameModel.BULLETIN:
            title = 'Bulletin Board';
            body = 'This area is displaying only A+ student test papers and completed math worksheets. Use this area instead to capture the scope of a class project, different approaches to problem solving or group work. Feedback in this space should be positive and affirming.';
            image1Id = '#img-bulletin-dirty';
            image2Id = '#img-bulletin-clean';
            break;
        case GameModel.RULES:
            title = 'Rules Poster';
            body = 'This poster was bought at a store with no student input. Create a list of values with your students to help define the classroom community as a socially and emotionally safe space. Create a list of agreements about how class members will treat each other. Identity, difference and power should always be addressed explicitly.';
            image1Id = '#img-rules-dirty';
            image2Id = '#img-rules-clean';
            break;
        default:
            break;
    }

    var foundModal = document.querySelector('#found-modal-ent');
    // foundModal.querySelector('.header').setAttribute('value', title);
    // foundModal.querySelector('.body').setAttribute('value', body);

    foundModal.querySelector('.image-old').setAttribute('src', image1Id);
    foundModal.querySelector('.image-new').setAttribute('src', image2Id);
};

GameController.prototype.faceModalToCamera = function( modal, reposition = true ){
    var cameraElement = document.getElementById('ent-scene').camera;

    // create the position of the modal to look at
    var cameraPosition = cameraElement.getWorldPosition(new THREE.Vector3());

    if(reposition){
        // project a ray 10 units out from the camera and position the found modal there
        // var newModalPosition = cameraElement.localToWorld(new THREE.Vector3(0, 0, -5));
        var newModalPosition = cameraElement.localToWorld(new THREE.Vector3(0, (document.querySelector('a-scene').is('vr-mode') ? -1.6 : 0), -5));
        modal.position.x = newModalPosition.x;
        modal.position.y = newModalPosition.y;
        modal.position.z = newModalPosition.z;
    }

    // face it towards the camera
    modal.lookAt( document.querySelector('a-scene').is('vr-mode') ? new THREE.Vector3(0, 1.6, 0) : new THREE.Vector3(0, 1.6, 0) );
};