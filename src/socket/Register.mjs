import { registerChatroomChannel } from "@/socket/Chatroom.mjs";
import { registerSystemChannel } from "@/socket/System.mjs";

export function registerChannel({ io, jwt }) {
  return {
    chatroom: registerChatroomChannel(io, jwt),
    system: registerSystemChannel(io, jwt)
  };
}
