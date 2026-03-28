import { Server } from 'socket.io';

let io;
const userSockets = new Map(); // Maps userId to socketId

export function initWebSocket(server) {
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a user opens the tracking page, they join a room for their order
    socket.on('join_order_room', ({ orderId, userId }) => {
      console.log(`Socket ${socket.id} (User ${userId}) is joining room for Order ${orderId}`);
      socket.join(orderId);
      if (userId) {
        userSockets.set(String(userId), socket.id);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Clean up map on disconnect
      for (const [userId, sId] of userSockets.entries()) {
        if (sId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });
}

export function getIo() {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
}

export function isUserOnline(userId) {
  return userSockets.has(String(userId));
}