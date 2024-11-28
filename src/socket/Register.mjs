import { registerChatroomChannel } from "@/socket/Chatroom.mjs";
import { registerSystemChannel } from "@/socket/System.mjs";
import { registerLocationSharingChannel } from "@/socket/LocationSharing.mjs";

export function registerChannel({ io, jwt }) {
  return {
    chatroom: registerChatroomChannel(io, jwt),
    system: registerSystemChannel(io, jwt),
    locationSharing: registerLocationSharingChannel(io, jwt)
  };
}
