// DEBUGGING GUIDE FOR MESSAGES PAGE
//
// Open browser console and check for these logs:
//
// 1. When you select a user:
//    - "[fetchMessages] Fetching for user: [name] [id]"
//    - "[fetchMessages] Query: ?receiverId=[id]"
//    - "[fetchMessages] Messages count: [number]"
//
// 2. When you send a message:
//    - "[sendMessage] Sending to: [name] [id]"
//    - "[sendMessage] Message saved: [message object]"
//    - "[sendMessage] Emitting to socket"
//
// 3. When you receive a message:
//    - "[Socket] Received message: [message object]"
//    - "[Socket] Adding message to state" OR "[Socket] Message not for this conversation"
//
// Common issues:
// - If messages disappear: Check if fetchMessages is being called too often
// - If messages don't arrive: Check socket connection and room joining
// - If wrong messages appear: Check receiver ID matching logic
