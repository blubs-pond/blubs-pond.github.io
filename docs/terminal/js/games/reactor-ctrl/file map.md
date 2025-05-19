format Oldfile --> newfile
command.js --> cmd.js(for general terminal command except help)
command.js --> reactorCtrlGameLogic.js (for game specific handler function)
command.js --> reactorCtrlCommand.js (for game specific command)

gameLogic.js --> reactorCtrlGameLogic.js (for all game logic and maybe game specific handler function)

gameSetting.js can be discarded as I have revamped the entire file

gameState.js --> reactorCtrlGameState.js

main.js --> reactorCtrlMain.js

ui.js --> ui.js