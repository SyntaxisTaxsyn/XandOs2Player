using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace XandOs2Player.Game_Classes
{
    public class TicTacToe
    {
        public string sGameState = "";
        public string sCurrentPlayer = "";
        public string sLastWinner = "";
        public int iPlayer1Score = 0;
        public int iPlayer2Score = 0;
        public bool bNamesSet = false;
        public string sP1Name = "";
        public string sP2Name = "";
        public string[] GridState = new string[9] { " ", " ", " ", " ", " ", " ", " ", " ", " " };
        public TicTacToe()
        {
            sGameState = GameStateConstants.NotReady;
            sCurrentPlayer = PlayerSymbols.X;
            iPlayer1Score = 0;
            iPlayer2Score = 0;
            bNamesSet = false;
            ClearArray();

        }

        private void ClearArray()
        {
            int i;
            for (i = 0;i <= 8;i++)
            {
                GridState[i] = " ";
            }
        }

        public void SwitchPlayer() { 
            if (sCurrentPlayer == PlayerSymbols.X)
            {
                sCurrentPlayer = PlayerSymbols.O;
            } else 
            {
                sCurrentPlayer = PlayerSymbols.X;
            }
        }
        public void NewGame() {
            sGameState = GameStateConstants.Running;

            // Decide next player
            switch (sLastWinner)
            {
                case "":
                    SwitchPlayer(); // default/ no winners yet
                    break;
                case "X":
                    sCurrentPlayer = PlayerSymbols.O; // X won last
                    break;
                case "O":
                    sCurrentPlayer = PlayerSymbols.X; // O won last
                    break;
                case "C":
                    SwitchPlayer(); // Cats game last
                    break;
                default:
                    SwitchPlayer(); // Default case to catch all
                    break;
            }

            ClearArray();
            UpdateScreenValues();
            
        }
        public void CheckWinners() {
            bool bWinCheck = false;
            string sPlayerToUpdate = "";

            if (CheckWinner(PlayerSymbols.X) == true)
            {
                SendAlertToPlayers(GetPlayersName(PlayerSymbols.X) + " wins");
                sPlayerToUpdate = PlayerSymbols.X;
                bWinCheck = true; 
            }

            if (CheckWinner(PlayerSymbols.O) == true)
            {
                SendAlertToPlayers(GetPlayersName(PlayerSymbols.O) + " wins");
                sPlayerToUpdate = PlayerSymbols.O;
                bWinCheck = true;
            }

            if (bWinCheck == true)
            {
                UpdateScore(sPlayerToUpdate);
                NewGame();
            } else
            {
                if (CheckCatsGame()) { NewGame(); }
            }
        }
        public bool CheckCatsGame() {

            int setcount = 0;

            for (int i = 0; i <= 8; i++)
            {
                if (GridState[i] == PlayerSymbols.X ||
                    GridState[i] == PlayerSymbols.O)
                {
                    setcount++;
                }
            }

            if (setcount == 9)
            {
                SendAlertToPlayers("Cats game - nobody wins ha ha!");
                return true;
            } else
            {
                return false;
            }

        }
        public void UpdateScore(string sPlayer) {
            if (sPlayer == PlayerSymbols.X) { iPlayer1Score++; }
            if (sPlayer == PlayerSymbols.O) { iPlayer2Score++; }
        }
        public bool CheckWinner(string sPlayer) {

            bool bCheck = false;

            // Check for single row win cases
            if (GridState[0] == sPlayer &&
                GridState[1] == sPlayer &&
                GridState[2] == sPlayer
                ) { bCheck = true; }

            if (GridState[3] == sPlayer &&
                GridState[4] == sPlayer &&
                GridState[5] == sPlayer
                ) { bCheck = true; }

            if (GridState[6] == sPlayer &&
                GridState[7] == sPlayer &&
                GridState[8] == sPlayer
                ) { bCheck = true; }

            // Check for single column win cases
            if (GridState[0] == sPlayer &&
                GridState[3] == sPlayer &&
                GridState[6] == sPlayer
                ) { bCheck = true; }

            if (GridState[1] == sPlayer &&
                GridState[4] == sPlayer &&
                GridState[7] == sPlayer
                ) { bCheck = true; }

            if (GridState[2] == sPlayer &&
                GridState[5] == sPlayer &&
                GridState[8] == sPlayer
                ) { bCheck = true; }

            // Check for cross grid win cases
            if (GridState[0] == sPlayer &&
                GridState[4] == sPlayer &&
                GridState[8] == sPlayer
                ) { bCheck = true; }

            if (GridState[2] == sPlayer &&
                GridState[4] == sPlayer &&
                GridState[6] == sPlayer
                ) { bCheck = true; }

            return bCheck;

        }
        public string GetPlayersName(string sPlayer) {
            switch (sPlayer)
            {
                case PlayerSymbols.X:
                    return sP1Name;
                case PlayerSymbols.O:
                    return sP2Name;
                default:
                    return "";
            }
        }
        public void UpdateScreenValues() { }
        private void CheckButtonState() { }

        private void SendAlertToPlayers(string AlertMsg) { }

    }

    public class GameStateConstants
    {
        public static string NotReady = "Not Ready";
        public static string Running = "Running";
        public static string GameOver = "Game Over";
    }

    public class PlayerSymbols
    {
        public const string X = "X";
        public const string O = "O";
    }
}

