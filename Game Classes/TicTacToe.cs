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
        private void CheckWinners() { }
        private void CheckCatsGame() { }
        private void UpdateScore() { }
        private void CheckWinner() { }
        private void GetPlayersName() { }
        private void UpdateScreenValues() { }
        private void CheckButtonState() { }

    }

    public class GameStateConstants
    {
        public static string NotReady = "Not Ready";
        public static string Running = "Running";
        public static string GameOver = "Game Over";
    }

    public class PlayerSymbols
    {
        public static string X = "X";
        public static string O = "O";
    }
}

