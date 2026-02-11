// Single source of truth for online presence
// Map of userId -> Set<socketId>
const onlineUsers = new Map();

const addUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

const removeSocket = (socketId) => {
  for (const [userId, socketSet] of onlineUsers.entries()) {
    if (socketSet.has(socketId)) {
      socketSet.delete(socketId);
      if (socketSet.size === 0) {
        onlineUsers.delete(userId);
        return userId; // caller uses this to broadcast user_offline
      }
      return null; // user still has other sockets open
    }
  }
  return null;
};

const getSocketIds = (userId) => onlineUsers.get(userId) || new Set();

const getAllUserIds = () => Array.from(onlineUsers.keys());

module.exports = {
  onlineUsers,
  addUser,
  removeSocket,
  getSocketIds,
  getAllUserIds,
};
