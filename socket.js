const socketIo = require('socket.io');
const db = require('./db');

let io;

// Store active users in memory
// Map structure: { userId: socketId }
const activeUsers = new Map();

function init(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Handle user joining
        socket.on('join-user', (userId) => {
            activeUsers.set(userId, socket.id);
            console.log(`User ${userId} joined with socket ${socket.id}`);
            // Broadcast active users list if needed
            io.emit('active-users', Array.from(activeUsers.keys()));
        });

        // Handle sending messages
        socket.on('send-message', async (data) => {
            const { sender_id, receiver_id, message } = data;
            
            try {
                // Save message to MySQL
                const query = 'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)';
                await db.query(query, [sender_id, receiver_id, message]);
                
                const messagePayload = {
                    sender_id,
                    receiver_id,
                    message,
                    created_at: new Date()
                };

                // Emit receive-message to receiver if online
                const receiverSocketId = activeUsers.get(receiver_id);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive-message', messagePayload);
                }

                // Emit back to sender (optional, to verify it went through)
                socket.emit('receive-message', messagePayload);
            } catch (error) {
                console.error('Error handling send-message:', error);
                socket.emit('error', 'Failed to send message');
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            // Remove from active map
            for (let [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    activeUsers.delete(userId);
                    io.emit('active-users', Array.from(activeUsers.keys()));
                    break;
                }
            }
        });
    });
}

function getIo() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = {
    init,
    getIo
};
