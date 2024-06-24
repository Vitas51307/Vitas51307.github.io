const http = require('http');
const WebSocket = require('ws');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let deck = [];

function initializeDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push(`${value}${suit}`);
        }
    }
    shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.action === 'drawCard') {
            if (deck.length > 0) {
                const card = deck.pop();
                broadcast({ card, remainingCards: deck.length });
            } else {
                ws.send(JSON.stringify({ card: null, remainingCards: 0 }));
            }
        } else if (data.action === 'getDeckState') {
            ws.send(JSON.stringify({ remainingCards: deck.length }));
        }
    });

    ws.send(JSON.stringify({ remainingCards: deck.length }));
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

initializeDeck();
server.listen(3000, () => {
    console.log('伺服器啟動於 http://127.0.0.1:9999/');
});