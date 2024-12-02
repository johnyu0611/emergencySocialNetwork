import { logger } from "@/log/Logger.mjs";
import { authSocketIO } from "@/middleware/Auth.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import {
  CHANNEL_SYSTEM_EVENT_USER_JOIN,
  CHANNEL_SYSTEM_EVENT_USER_LEAVE
} from "@/util/Constants.mjs";

let offers = [];
let connectedSockets = [];

export function registerSystemChannel(io, jwt, namespace = "/system") {
  const subChannel = io.of(namespace);
  const userDAO = UserDataAccess.getInstance();
  subChannel.use(authSocketIO(jwt));

  async function handleConnect(socket) {
    const loggerContext = "SystemChannelOnConnectHandler";
    const { userId } = socket.handshake.auth;

    try {
      await userDAO.updateById({ userId }, { isOnline: true });
    } catch (error) {
      logger.warn(
        { context: loggerContext },
        "Cannot write online status to database. Please refer to the error below."
      );
      logger.warn({ context: loggerContext }, String(error));
    }
    const user = await userDAO.findById({ userId });
    subChannel.emit(CHANNEL_SYSTEM_EVENT_USER_JOIN, user.username);
    logger.info({ context: loggerContext }, `User ${user.username} connected`);
  }

  async function handleDisconnect(socket) {
    const loggerContext = "SystemChannelOnDisconnectHandler";
    const { userId } = socket.handshake.auth;

    try {
      await userDAO.updateById({ userId }, { isOnline: false });
    } catch (error) {
      logger.warn(
        { context: loggerContext },
        "Cannot write online status to database. Please refer to the error below."
      );
      logger.warn({ context: loggerContext }, String(error));
    }

    const user = await userDAO.findById({ userId });
    subChannel.emit(CHANNEL_SYSTEM_EVENT_USER_LEAVE, user.username);
    logger.info(
      { context: loggerContext },
      `User ${user.username} disconnected`
    );
  }

  subChannel.on("connection", async (socket) => {
    void handleConnect(socket);
    const { userId } = socket.handshake.auth;
    const temp = await userDAO.findById({ userId });
    if (!temp) {
      return;
    }

    const { username } = temp;
    const userName = username;

    connectedSockets.push({
      socketId: socket.id,
      userName
    });

    //a new client has joined. If there are any offers available,
    //emit them out
    if (offers.length) {
      socket.emit("availableOffers", offers);
    }

    socket.on("newOffer", ({ offer, emergencyContact }) => {
      offers.push({
        offererUserName: userName,
        offer,
        offerIceCandidates: [],
        answererUserName: null,
        answer: null,
        answererIceCandidates: []
      });
      // console.log(newOffer.sdp.slice(50))
      //send out to all connected sockets EXCEPT the caller
      socket.broadcast.emit("newOfferAwaiting", {
        offers: offers.slice(-1),
        emergencyContact
      });
    });

    socket.on("newAnswer", (offerObj, ackFunction) => {
      console.log(offerObj);
      //emit this answer (offerObj) back to CLIENT1
      //in order to do that, we need CLIENT1's socketid
      const socketToAnswer = connectedSockets.find(
        (s) => s.userName === offerObj.offererUserName
      );
      if (!socketToAnswer) {
        console.log("No matching socket");
        return;
      }
      //we found the matching socket, so we can emit to it!
      const socketIdToAnswer = socketToAnswer.socketId;
      //we find the offer to update so we can emit it
      const offerToUpdate = offers.find(
        (o) => o.offererUserName === offerObj.offererUserName
      );
      if (!offerToUpdate) {
        console.log("No OfferToUpdate");
        return;
      }
      //send back to the answerer all the iceCandidates we have already collected
      ackFunction(offerToUpdate.offerIceCandidates);
      offerToUpdate.answer = offerObj.answer;
      offerToUpdate.answererUserName = userName;
      //socket has a .to() which allows emiting to a "room"
      //every socket has it's own room
      socket.to(socketIdToAnswer).emit("answerResponse", offerToUpdate);
    });

    socket.on("sendIceCandidateToSignalingServer", (iceCandidateObj) => {
      const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
      // console.log(iceCandidate);
      if (didIOffer) {
        //this ice is coming from the offerer. Send to the answerer
        const offerInOffers = offers.find(
          (o) => o.offererUserName === iceUserName
        );
        if (offerInOffers) {
          offerInOffers.offerIceCandidates.push(iceCandidate);
          // 1. When the answerer answers, all existing ice candidates are sent
          // 2. Any candidates that come in after the offer has been answered, will be passed through
          if (offerInOffers.answererUserName) {
            //pass it through to the other socket
            const socketToSendTo = connectedSockets.find(
              (s) => s.userName === offerInOffers.answererUserName
            );
            if (socketToSendTo) {
              socket
                .to(socketToSendTo.socketId)
                .emit("receivedIceCandidateFromServer", iceCandidate);
            } else {
              console.log("Ice candidate recieved but could not find answere");
            }
          }
        }
      } else {
        //this ice is coming from the answerer. Send to the offerer
        //pass it through to the other socket
        const offerInOffers = offers.find(
          (o) => o.answererUserName === iceUserName
        );
        const socketToSendTo = connectedSockets.find(
          (s) => s.userName === offerInOffers.offererUserName
        );
        if (socketToSendTo) {
          socket
            .to(socketToSendTo.socketId)
            .emit("receivedIceCandidateFromServer", iceCandidate);
        } else {
          console.log("Ice candidate recieved but could not find offerer");
        }
      }
      // console.log(offers)
    });

    socket.on("disconnect", async () => {
      handleDisconnect(socket);
      // Remove the disconnected socket from connectedSockets
      connectedSockets = connectedSockets.filter(
        (s) => s.socketId !== socket.id
      );

      // Remove any offers associated with the disconnected user
      const { userId } = socket.handshake.auth;
      const user = await userDAO.findById({ userId });
      const { username } = user;
      offers = offers.filter(
        (o) => o.offererUserName !== username && o.answererUserName !== username
      );
    });
  });

  return subChannel;
}
