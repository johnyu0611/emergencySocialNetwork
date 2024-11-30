import { LocationSharingSessionSchema } from "@/database/schema/LocationSharingSession.mjs";
import { AbstractModel } from "@/model/Abstract.mjs";

export class LocationSharingSessionDataAccess extends AbstractModel {
  static #initializationSymbol = "%";
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== LocationSharingSessionDataAccess.#initializationSymbol) {
      throw new Error("Cannot initialize a singleton class via constructor");
    }
    super({ collectionName, schema });
    LocationSharingSessionDataAccess.#instance = this;
    return LocationSharingSessionDataAccess.#instance;
  }

  static getInstance() {
    if (!LocationSharingSessionDataAccess.#instance) {
      new LocationSharingSessionDataAccess(
        "location-sharing-session",
        LocationSharingSessionSchema,
        LocationSharingSessionDataAccess.#initializationSymbol
      );
    }
    return LocationSharingSessionDataAccess.#instance;
  }
  async create({ sessionId }) {
    return this.model.create({ id: sessionId });
  }

  async delete({ sessionId }) {
    return this.model.deleteOne({ id: sessionId });
  }

  async isValidSession({ sessionId }) {
    const session = await this.model.findOne({ id: sessionId }, { _id: 1 });
    return Boolean(session); // Returns true if session exists, false otherwise
  }

  async getUsers({ sessionId }) {
    const session = await this.model.findOne({ id: sessionId }, { users: 1 });
    return session?.users || [];
  }

  async addUser({ sessionId, user }) {
    return this.model.updateOne(
      { id: sessionId },
      { $addToSet: { users: user } }
    );
  }

  async getUser({ sessionId, userId }) {
    const session = await this.model.findOne(
      { "id": sessionId, "users.userId": userId },
      { "users.$": 1 }
    );
    return session?.users[0] || null;
  }

  async deleteUser({ sessionId, userId }) {
    return this.model.updateOne(
      { id: sessionId },
      { $pull: { users: { userId } } }
    );
  }

  async getRole({ sessionId, userId }) {
    const user = await this.getUser({ sessionId, userId });
    return user?.role;
  }

  async setRole({ sessionId, userId, role }) {
    return this.model.updateOne(
      { "id": sessionId, "users.userId": userId },
      { $set: { "users.$.role": role } }
    );
  }

  async getLocation({ sessionId, userId }) {
    const user = await this.getUser({ sessionId, userId });
    return user?.location;
  }

  async setLocation({ sessionId, userId, location }) {
    return this.model.updateOne(
      { "id": sessionId, "users.userId": userId },
      { $set: { "users.$.location": location } }
    );
  }

  async getLastSeen({ sessionId, userId }) {
    const user = await this.getUser({ sessionId, userId });
    return user?.lastSeen;
  }

  async setLastSeen({ sessionId, userId, lastSeen }) {
    return this.model.updateOne(
      { "id": sessionId, "users.userId": userId },
      { $set: { "users.$.lastSeen": lastSeen } }
    );
  }

  async getResourceRequest({ sessionId, userId }) {
    const user = await this.getUser({ sessionId, userId });
    return user?.resourceRequest || [];
  }

  async setResourceRequest({ sessionId, userId, resourceRequest }) {
    return this.model.updateOne(
      { "id": sessionId, "users.userId": userId },
      { $set: { "users.$.resourceRequest": resourceRequest } }
    );
  }

  async getResourceResponse({ sessionId, userId }) {
    const user = await this.getUser({ sessionId, userId });
    return user?.resourceResponse || [];
  }

  async setResourceResponse({ sessionId, userId, resourceResponse }) {
    return this.model.updateOne(
      { "id": sessionId, "users.userId": userId },
      { $set: { "users.$.resourceResponse": resourceResponse } }
    );
  }
}
