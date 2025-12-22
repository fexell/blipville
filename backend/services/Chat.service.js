import ChatModel from '../models/Chat.model.js';

export async function saveChat({ userId, username, room, message }) {
  return await ChatModel.create({ userId, username, room, message });
}
