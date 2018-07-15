
$(document).ready(function() {


var audio = new Audio('assets/audio/17 the real folk blues.mp3');
var tank = new Audio('assets/audio/01 - tank! (tv stretch).mp3');

var characters = {
    Ed : {
        name: 'Ed',
        health: 100,
        attack: 14,
        imageUrl: "assets/images/ed.png"
    }, 
    Spike : {
        name: 'Spike',
        health: 100,
        attack: 15,
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
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text(character.health);
    charDiv.append(charName);
    charDiv.append(charHealth);
    charDiv.append(charImage);
    $(renderArea).append(charDiv);

    if (makeChar === "enemy") {
      $(charDiv).addClass("enemy");
    } 
    else if (makeChar === "defender") {
      defender = character;
      $(charDiv).addClass('target-enemy');
    }
  };

  var renderMessage = function(message) {
    var gameMessageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMessageSet.append(newMessage);

    if (message == 'clearMessage') {
      gameMessageSet.text('');
    }
  };

  var renderCharacters = function(charObj, areaRender) {
    if (areaRender === '#characters-section') {
      $(areaRender).empty();
      for (var key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, '');
        }
      }
    }

    if (areaRender === '#selected-character') {
      $('#selected-character').prepend("Your Character");       
      renderOne(charObj, areaRender, '');
      $('#attack-button').css('visibility', 'visible');
    }
   
    if (areaRender === '#available-to-attack-section') {
        $('#available-to-attack-section').prepend("Choose Your Next Opponent");      
      for (var i = 0; i < charObj.length; i++) {

        renderOne(charObj[i], areaRender, 'enemy');
      }
   
      $(document).on('click', '.enemy', function() {
        name = ($(this).data('name'));
        if ($('#defender').children().length === 0) {
          renderCharacters(name, '#defender');
          $(this).hide();
          renderMessage("clearMessage");
        }
      });
    }
   
    if (areaRender === '#defender') {
      $(areaRender).empty();
      for (var i = 0; i < combatants.length; i++) {
        if (combatants[i].name == charObj) {
          $('#defender').append("Your selected opponent")
          renderOne(combatants[i], areaRender, 'defender');
        }
      }
    }
    
    if (areaRender === 'playerDamage') {
      $('#defender').empty();
      $('#defender').append("Your selected opponent")
      renderOne(charObj, '#defender', 'defender');
    }
    
    if (areaRender === 'enemyDamage') {
      $('#selected-character').empty();
      renderOne(charObj, '#selected-character', '');
    }
  
    if (areaRender === 'enemyDefeated') {
      $('#defender').empty();
      var gameStateMessage = "You have defeated " + charObj.name + ", choose another enemy to fight.";
      renderMessage(gameStateMessage);
    }
  };
  
  renderCharacters(characters, '#characters-section');
  $(document).on('click', '.character', function() {
    name = $(this).data("name");
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
      renderCharacters(combatants, '#available-to-attack-section');
    }
  });


  $("#attack-button").on("click", function() {
    var characterHit = Math.floor(Math.random() * 2);
    var enemyHit = Math.floor(Math.random() * 2);
    if ($('#defender').children().length !== 0) {
      if (characterHit === 0) {
      var attackMessage = "You missed.";
      renderMessage("clearMessage");
      }
      else {
      var attackMessage = "You attacked " + defender.name + " for " + (selectedCharacter.attack * turnCounter * characterHit) + " damage.";
      renderMessage("clearMessage");
      defender.health = defender.health - (selectedCharacter.attack * turnCounter * characterHit);
      }
      if (defender.health > 0) {
        if(enemyHit === 0) {
          var counterAttackMessage = defender.name + " missed.";
        }
        else {
        renderCharacters(defender, 'playerDamage');
        var counterAttackMessage = defender.name + " attacked you back for " + defender.attack * enemyHit + " damage.";

        selectedCharacter.health = selectedCharacter.health - defender.attack * enemyHit;
        renderCharacters(selectedCharacter, 'enemyDamage');
        }
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);
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
          setTimeout(function() {
          tank.pause();
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


  var restartGame = function(inputEndGame) {
    var restart = $('<button class="btn">Restart</button>').click(function() {
      location.reload();
    });
    var gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };

});