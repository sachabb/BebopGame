//Global variables
$(document).ready(function() {

//audio clips
var audio = new Audio('assets/audio/17 the real folk blues.mp3');
var tank = new Audio('assets/audio/01 - tank! (tv stretch).mp3');
//Array of Playable Characters
var characters = {
    Ed : {
        name: 'Ed',
        health: 120,
        attack: 8,
        imageUrl: "assets/images/ed.png"
    }, 
    Spike : {
        name: 'Spike',
        health: 100,
        attack: 14,
        imageUrl: "assets/images/spike.png"
    }, 
    Faye : {
        name: 'Faye',
        health: 150,
        attack: 8,
        imageUrl: "assets/images/faye.png"
    }, 
    Jet : {
        name: 'Jet',
        health: 180,
        attack: 7,
        imageUrl: "assets/images/jet.png"
    }
};

var selectedCharacter;
var defender;
var combatants = [];
var turnCounter = 1;
var killCount = 0;


var renderOne = function(character, renderArea, makeChar) {
    //character: obj, renderArea: class/id, makeChar: string
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text(character.health);
    charDiv.append(charName);
    charDiv.append(charHealth);
    charDiv.append(charImage);
    $(renderArea).append(charDiv);
    
    // conditional render
    if (makeChar === "enemy") {
      $(charDiv).addClass("enemy");
    } 
    else if (makeChar === "defender") {
      defender = character;
      $(charDiv).addClass('target-enemy');
    }
  };

  // Create function to render game message to DOM
  var renderMessage = function(message) {
    var gameMessageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMessageSet.append(newMessage);

    if (message == 'clearMessage') {
      gameMessageSet.text('');
    }
  };

  var renderCharacters = function(charObj, areaRender) {
    //render all characters
    if (areaRender === '#characters-section') {
      $(areaRender).empty();
      for (var key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, '');
        }
      }
    }
    //render player character
    if (areaRender === '#selected-character') {
      $('#selected-character').prepend("Your Character");       
      renderOne(charObj, areaRender, '');
      $('#attack-button').css('visibility', 'visible');
    }
    //render combatants
    if (areaRender === '#available-to-attack-section') {
        $('#available-to-attack-section').prepend("Choose Your Next Opponent");      
      for (var i = 0; i < charObj.length; i++) {

        renderOne(charObj[i], areaRender, 'enemy');
      }
      //render one enemy to defender area
      $(document).on('click', '.enemy', function() {
        //select an combatant to fight
        name = ($(this).data('name'));
        //if defernder area is empty
        if ($('#defender').children().length === 0) {
          renderCharacters(name, '#defender');
          $(this).hide();
          renderMessage("clearMessage");
        }
      });
    }
    //render defender
    if (areaRender === '#defender') {
      $(areaRender).empty();
      for (var i = 0; i < combatants.length; i++) {
        //add enemy to defender area
        if (combatants[i].name == charObj) {
          $('#defender').append("Your selected opponent")
          renderOne(combatants[i], areaRender, 'defender');
        }
      }
    }
    //re-render defender when attacked
    if (areaRender === 'playerDamage') {
      $('#defender').empty();
      $('#defender').append("Your selected opponent")
      renderOne(charObj, '#defender', 'defender');
    }
    //re-render player character when attacked
    if (areaRender === 'enemyDamage') {
      $('#selected-character').empty();
      renderOne(charObj, '#selected-character', '');
    }
    //render defeated enemy
    if (areaRender === 'enemyDefeated') {
      $('#defender').empty();
      var gameStateMessage = "You have defeated " + charObj.name + ", choose another enemy to fight.";
      renderMessage(gameStateMessage);
    }
  };
  //this is to render all characters for user to choose their computer
  renderCharacters(characters, '#characters-section');
  $(document).on('click', '.character', function() {
    name = $(this).data("name");
    //if no player char has been selected
    if (!selectedCharacter) {
      tank.play();
      selectedCharacter = characters[name];
      for (var key in characters) {
        if (key != name) {
          combatants.push(characters[key]);
        }
      }
      $("#characters-section").hide();
      renderCharacters(selectedCharacter, '#selected-character');
      //this is to render all characters for user to choose fight against
      renderCharacters(combatants, '#available-to-attack-section');
    }
  });

  // ----------------------------------------------------------------
  // Create functions to enable actions between objects.
  $("#attack-button").on("click", function() {
    //if defender area has enemy
    var characterHit = Math.floor(Math.random() * 2);
    var enemyHit = Math.floor(Math.random() * 2);
    if ($('#defender').children().length !== 0) {
      //defender state change
      var attackMessage = "You attacked " + defender.name + " for " + (selectedCharacter.attack * turnCounter * characterHit) + " damage.";
      renderMessage("clearMessage");
      //combat
      defender.health = defender.health - (selectedCharacter.attack * turnCounter * characterHit);

      //win condition
      if (defender.health > 0) {
        //enemy not dead keep playing
        renderCharacters(defender, 'playerDamage');
        //player state change
        var counterAttackMessage = defender.name + " attacked you back for " + defender.attack * enemyHit + " damage.";
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        selectedCharacter.health = selectedCharacter.health - defender.attack * enemyHit;
        renderCharacters(selectedCharacter, 'enemyDamage');
        if (selectedCharacter.health <= 0) {
          renderMessage("clearMessage");
          restartGame("You have been defeated...GAME OVER!!!");
          $("#attack-button").unbind("click");
        }
      } else {
        renderCharacters(defender, 'enemyDefeated');
        killCount++;
        turnCounter = 1;
        if (killCount >= 3) {
          renderMessage("clearMessage");
          restartGame("You Won!!!! SEE YOU SPACE COWBOY...");
          // The following line will play the imperial march:
          setTimeout(function() {
          audio.play();
          }, 2000);

        }
      }
      turnCounter++;
    } else {
      renderMessage("clearMessage");
      renderMessage("No enemy here.");
    }
  });

//Restarts the game - renders a reset button
  var restartGame = function(inputEndGame) {
    //When 'Restart' button is clicked, reload the page.
    var restart = $('<button class="btn">Restart</button>').click(function() {
      location.reload();
    });
    var gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };

});