import { findBlockWithLine } from "../helpers";
import { InputData } from "../types";
import { GameDescription } from "../constants";
export function parserSockets(inputData: InputData) {
    const sockets = findBlockWithLine(inputData, GameDescription.sockets);
    const socketsLine = sockets?.lines.find(line => line.text.includes(GameDescription.sockets))!;
    
    if (socketsLine) {
        socketsLine.parsed = true;
        return socketsLine.text.split(':')[1].trim().split(' ').map(socket => socket.trim());
    }

    return null;
}
