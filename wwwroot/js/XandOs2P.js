var PReg = false;
var Ready = false;
var TurnActive = false;
var bNamesSet = false;
var sGameState = "nothing"
var sCurrentPlayer = "nothing";
var sP1Name = "waiting for player";
var sP2Name = "waiting for player";
var iPlayer1Score = 0;
var iPlayer2Score = 0;
var iPlayerScore = 0;
GridState = new Array(" ", " ", " ", " ", " ", " ", " ", " ", " ");

(function () {
    let webSocket
    var getWebSocketMessages = function (onMessageReceived) {
        let url = `ws://${location.host}/api/stream`;
        console.log('url is: ' + url);

        webSocket = new WebSocket(url);

        webSocket.onmessage = onMessageReceived;
        window.oWSocket = webSocket; // make this web socket a global instance for later access
    };

    let ulElement = document.getElementById('chatMessages');

    getWebSocketMessages(function (message) {
        var UserID = RetrieveUserID(message.data);
        var UserNo = RetrieveConnectionNumber(message.data);
        if (PReg == false) {
            RegisterUser(UserID, UserNo);
        } else {
            CheckMessageType(message.data);
        }
        
        ulElement.innerHTML = ulElement.innerHTML += `<li>${message.data}</li>` // left for now to echo messages sent until the UI is worked out
        console.log(message);
    });

    document.getElementById("sendmessage").addEventListener("click", function () {
        let textElement = document.getElementById("messageTextInput");
        let text = textElement.value;
        console.log('Sending text: ' + text);
        webSocket.send(text);
        textElement.value = '';
    });
}());

function CheckMessageType(sMessageWUID) {
    if (GetMessageType(sMessageWUID) == MessageConstants.ALERT) {
        var tarr = sMessageWUID.split(":");
        alert(tarr[(tarr.length - 1)]);
        
    }
    if (GetMessageType(sMessageWUID) == MessageConstants.CONNECT) {
        var tarr = sMessageWUID.split(":");
        

    }
    if (GetMessageType(sMessageWUID) == MessageConstants.GAMEOVER) {
        var tarr = sMessageWUID.split(":");
        alert("Cats game detected, game over! Please start a new game");

    }
    if (GetMessageType(sMessageWUID) == MessageConstants.WINNER) {
        var tarr = sMessageWUID.split(":");
        var tarr2 = tarr[2].split("{")
        var msg = tarr2[0];
        ProcessWinner(tarr2[1]);
        alert("Game over - " + msg);
        RequestNewGame();
        

    }
    if (GetMessageType(sMessageWUID) == MessageConstants.UPDATE) {
        var tarr = sMessageWUID.split(":");
        ProcessUpdateMessage(tarr[2]);


    }
    if (GetMessageType(sMessageWUID) == MessageConstants.NEWGAME) {
        var tarr = sMessageWUID.split(":");
        // Start a new game on the client (both are running the same code so the starting state will be the same)
        NewGame();


    }
    if (GetMessageType(sMessageWUID) == MessageConstants.SENDINFO) {
        // retrieve the message payload and process it
        var tarr = sMessageWUID.split(":");
        var PlayerID = 0;
        var PlayerName = "";
        var tarr1 = "";
        var tarr1 = tarr[1];

        // get the player name and number from the message payload
        tarr = tarr[2].split("{");
        tarr = tarr[1].split("}");
        tarr = tarr[0].split("-")
        PlayerID = parseInt(tarr[1], 10);
        PlayerName = tarr[0];

        // check if the recieved player info is different from your own and update accordingly
        if (PlayerID != window.User.number) {
            if (window.User.number == 1) {
                sP2Name = PlayerName;
            }
            if (window.User.number == 2) {
                sP1Name = PlayerName;
            } 
        }

        UpdateScreenValues();
        
    }
    if (GetMessageType(sMessageWUID) == MessageConstants.REQUESTINFO) {
        // retrieve the message payload and process it
        var tarr = sMessageWUID.split(":");
        SendMessage(MessageConstants.SENDINFO,GetPlayerInfo())
    }

    if (GetMessageType(sMessageWUID) == MessageConstants.RESTARTGAME) {
        var tarr = sMessageWUID.split(":");
        ResetGame();
    }

}

function ResetGame() {
    iPlayer1Score = 0;
    iPlayer2Score = 0;
    NewGame();

}

function RequestResetGame() {
    // Reset game values and start again
    SendMessage(MessageConstants.RESTARTGAME, "");
}

function ProcessWinner(iStr) {
    var tar = iStr.split("}");
    tar = tar[0].split("-");
    if (tar[0] == 1) {
        iPlayer1Score = tar[1];
    }
    if(tar[0] == 2) {
        iPlayer2Score = tar[1];
    }
    UpdateScreenValues();
}

function ProcessUpdateMessage(sMessageData) {

    // Get grid data from update message
    var i = 0;
    var tarr;
    tarr = sMessageData.split("{");
    tarr = tarr[1].split("}");
    tarr = tarr[0].split(",");
    for (i = 0; i <= 8; i++) {
        GridState[i] = tarr[i];
    }

    // work out whose turn it is
    if (tarr[9] == 1) {
        if (window.User.number == 1) {
            TurnActive = false;
        } else {
            TurnActive = true;
        }
    }
    if (tarr[9] == 2) {
        if (window.User.number == 1) {
            TurnActive = true;
        } else {
            TurnActive = false;
        }
    }

    UpdateScreenValues();

}

function RegisterUser(UID, No) {

    var pname = prompt("Player " + No + " please enter your name")
    window.User = new Users("", "");
    window.User.assign(pname, UID, No);
    if (window.User.number == 1) {
        sP1Name = window.User.name
    } else {
        sP2Name = window.User.name
    }
    PReg = true;

    if (window.User.number == 2) {
        SendMessage(MessageConstants.ALERT, "Game is ready to play, 2 players registered");
        SendMessage(MessageConstants.REQUESTINFO,"")
    }
}

function GetPlayerInfo() {
    var tstr = ""
    tstr = "{"+ window.User.name
    tstr = tstr + "-" + window.User.number + "}"
    return tstr
}

function GetMessageType(sMessageWUID) {
    var Find = 0;
    Find = sMessageWUID.indexOf("ALERT:")
    if (Find != -1) {
        return MessageConstants.ALERT;
    }
    Find = sMessageWUID.indexOf("CONNECT:")
    if (Find != -1) {
        return MessageConstants.CONNECT;
    }
    Find = sMessageWUID.indexOf("GAMEOVER:")
    if (Find != -1) {
        return MessageConstants.GAMEOVER;
    }
    Find = sMessageWUID.indexOf("WINNER:")
    if (Find != -1) {
        return MessageConstants.WINNER;
    }
    Find = sMessageWUID.indexOf("UPDATE:")
    if (Find != -1) {
        return MessageConstants.UPDATE;
    }
    Find = sMessageWUID.indexOf("NEWGAME:")
    if (Find != -1) {
        return MessageConstants.NEWGAME;
    }
    Find = sMessageWUID.indexOf("SENDINFO:")
    if (Find != -1) {
        return MessageConstants.SENDINFO;
    }
    Find = sMessageWUID.indexOf("REQUESTINFO:")
    if (Find != -1) {
        return MessageConstants.REQUESTINFO;
    }
    Find = sMessageWUID.indexOf("RESTARTGAME:")
    if (Find != -1) {
        return MessageConstants.RESTARTGAME;
    }
}

function RetrieveUserID(sMessageWUID) {
    var tarr = sMessageWUID.split("<b>")
    tarr = tarr[1].split("</b>")
    return tarr[0];
}

function RetrieveConnectionNumber(sMessageWUID) {
    var tarr = sMessageWUID.split("-")
    return tarr[(tarr.length-1)];
}

function SendMessage(type, data) {
    var sSendText = "";
    sSendText = type + ":" + data;
    window.oWSocket.send(sSendText);
}

class Users {
    constructor(Name, UID) {
        this.name = Name;
        this.uid = UID;
        this.number = 0;
        this.score = 0;
    }
    assign(Name, UID, No) {
        this.name = Name;
        this.uid = UID;
        this.number = No;
    }
}

//#region XandOs Logic

// not sure what to do with this function yet, needs reworked quite heavily...
function CheckButtonState(iButtonNumber) {

    // if game has started
    // if its your turn
    // if the grid hasnt been selected
    // send a valid move to the server
    if (sGameState === "Playing") {
        if (TurnActive == true) {
            if (GridState[iButtonNumber] === " ") {
                // Select current player based on player number
                if (window.User.number == 1) {
                    sCurrentPlayer = "X"
                } else {
                    sCurrentPlayer = "O"
                }

                GridState[iButtonNumber] = sCurrentPlayer;
                CheckWinners();
                SendMessage(MessageConstants.UPDATE,GetUpdateValues())
            }
        }
    }
}

function GetUpdateValues() {
    // Collect updated game values for sending to the clients to update both screens
    // Message format is {Grid[0],grid[1],2,3 ... ,PlayerNo}
    var i = 0;
    var tstr = "{";
    for (i = 0; i <= 8; i++) {
        tstr = tstr + GridState[i] + ",";
    }
    tstr = tstr + window.User.number + "}";
    return tstr;
}

function RequestNewGame() {
    SendMessage(MessageConstants.NEWGAME, "");
}

function NewGame() {

    sGameState = "Playing";
    sCurrentPlayer = "X"
    if (window.User.number == 1) {
        TurnActive = true;
    } else {
        TurnActive = false;
    }
    var i
    for (i = 0; i <= 8; i++) {
        GridState[i] = " ";
    }
    
    UpdateScreenValues();
}


function CheckWinners() {
    var bWinCheck = false;
    var sPlayerToCheck = "";
    if (window.User.number == 1) {
        sPlayerToCheck = "X"
    } else {
        sPlayerToCheck = "O"
    }

    if (CheckWinner(sPlayerToCheck) == true) {
        SendMessage(MessageConstants.WINNER, GetPlayersName() + " wins" + GetScoreUpdate(window.User.number));
        //alert(GetPlayersName("X") + " wins");
        bWinCheck = true;
    }

    if (bWinCheck == true) {
        UpdateScore();
        //NewGame();
    } else {
        CheckCatsGame();
    }
}

function GetScoreUpdate(iUsr) {
    var tstr = "{"
    tstr = tstr + iUsr + "-"
    if (iUsr == 1) {
        iPlayer1Score++;
        tstr = tstr + iPlayer1Score + "}"
    }
    if (iUsr == 2) {
        iPlayer2Score++;
        tstr = tstr + iPlayer2Score + "}"
    }

    return tstr;
}

function CheckCatsGame() {

    var i = 0;
    var setcount = 0;
    for (i = 0; i <= 8; i++) {
        if (GridState[i] === "X" || GridState[i] === "O") {
            setcount = setcount + 1;
        }
    }
    if (setcount == 9) {
        SendMessage(MessageConstants.GAMEOVER, "Cats Game - New game start required");
        //NewGame(); this new game will be handled on the message recieve routine or by player pressing the button during play
    }
}

function UpdateScore() {
    window.User.score = window.User.score + 1;
    iPlayerScore = window.User.score;
}

function CheckWinner(sPlayer) {
    var bCheck = false

    // Check for single row win cases
    if (GridState[0] === sPlayer && GridState[1] === sPlayer && GridState[2] === sPlayer) {
        bCheck = true
    }
    if (GridState[3] === sPlayer && GridState[4] === sPlayer && GridState[5] === sPlayer) {
        bCheck = true
    }
    if (GridState[6] === sPlayer && GridState[7] === sPlayer && GridState[8] === sPlayer) {
        bCheck = true
    }

    // Check for single column win cases
    if (GridState[0] === sPlayer && GridState[3] === sPlayer && GridState[6] === sPlayer) {
        bCheck = true
    }
    if (GridState[1] === sPlayer && GridState[4] === sPlayer && GridState[7] === sPlayer) {
        bCheck = true
    }
    if (GridState[2] === sPlayer && GridState[5] === sPlayer && GridState[8] === sPlayer) {
        bCheck = true
    }

    // Check for cross grid win cases
    if (GridState[0] === sPlayer && GridState[4] === sPlayer && GridState[8] === sPlayer) {
        bCheck = true
    }
    if (GridState[2] === sPlayer && GridState[4] === sPlayer && GridState[6] === sPlayer) {
        bCheck = true
    }

    return bCheck;
}

function GetPlayersName() {
    return window.User.name;
}

function IsItYourTurn() {
    if (TurnActive == false) {
        if (window.User.number == 1) {
            return sP2Name + "'s turn - please wait"
        } else {
            return sP1Name + "'s turn - please wait"
        }
        return 
    } else {
        return "Your turn - " + GetPlayersName();
    }
}

function UpdateScreenValues() {

    SetElmTextbyID(Constants.GameState, "Game State - " + sGameState)
    SetElmTextbyID(Constants.CurrentPlayer, "Current Player - " + IsItYourTurn())
    SetElmTextbyID(Constants.Player1Score, sP1Name + "'s Score - " + iPlayer1Score.toString())
    SetElmTextbyID(Constants.Player2Score, sP2Name + "'s Score - " + iPlayer2Score.toString())

    SetElmValbyID(Constants.btn1, GridState[0])
    SetElmValbyID(Constants.btn2, GridState[1])
    SetElmValbyID(Constants.btn3, GridState[2])
    SetElmValbyID(Constants.btn4, GridState[3])
    SetElmValbyID(Constants.btn5, GridState[4])
    SetElmValbyID(Constants.btn6, GridState[5])
    SetElmValbyID(Constants.btn7, GridState[6])
    SetElmValbyID(Constants.btn8, GridState[7])
    SetElmValbyID(Constants.btn9, GridState[8])

}

function SetElmTextbyID(thisElement, newValue) {
    document.getElementById(thisElement).innerHTML = newValue;
}

function SetElmValbyID(thisElement, newValue) {
    document.getElementById(thisElement).value = newValue;
}

//#endregion


//#region Constants - Static classes for storing fixed values
// these are strings used to define the types of message to be sent to connected clients
// the type will be used to determine what to do with the message information in the getwebsocketmessages function
class MessageConstants{
    static get ALERT() { return "ALERT" }; // displays an alert to the players
    static get CONNECT() { return "CONNECT" }; // intended for use as a connection event, may not be used
    static get GAMEOVER() { return "GAMEOVER" }; // send message to players that game is over and no winner is present
    static get WINNER() { return "WINNER" }; // send message to players that gaameis over and a winner has been decided
    static get UPDATE() { return "UPDATE" }; // send an update to players of the game state
    static get NEWGAME() { return "NEWGAME" }; // request a new game be started
    static get REQUESTINFO() { return "REQUESTINFO" }; // request players to send info to populate each others game data
    static get SENDINFO() { return "SENDINFO" }; // send player information to server to update local browser data
    static get RESTARTGAME() { return "RESTARTGAME" }; // Send message to clients to restart game
}

// These constants are used to access the grid objects on the game screen for updating
// they tie up with the constants defined in the C# class file
class Constants {
    static get GameState() { return "GameState" };
    static get CurrentPlayer() { return "CurrentPlayer" };
    static get Player1Score() { return "Player1Score" };
    static get Player2Score() { return "Player2Score" };
    static get btn1() { return "btn1" };
    static get btn2() { return "btn2" };
    static get btn3() { return "btn3" };
    static get btn4() { return "btn4" };
    static get btn5() { return "btn5" };
    static get btn6() { return "btn6" };
    static get btn7() { return "btn7" };
    static get btn8() { return "btn8" };
    static get btn9() { return "btn9" };
}
//#endregion
