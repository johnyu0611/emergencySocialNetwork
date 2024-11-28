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

  async getUser({ sessionId, username }) {
    const session = await this.model.findOne(
      { "id": sessionId, "users.username": username },
      { "users.$": 1 }
    );
    return session?.users[0] || null;
  }

  async deleteUser({ sessionId, username }) {
    return this.model.updateOne(
      { id: sessionId },
      { $pull: { users: { username } } }
    );
  }

  async getRole({ sessionId, username }) {
    const user = await this.getUser({ sessionId, username });
    return user?.role;
  }

  async setRole({ sessionId, username, role }) {
    return this.model.updateOne(
      { "id": sessionId, "users.username": username },
      { $set: { "users.$.role": role } }
    );
  }

  async getLocation({ sessionId, username }) {
    const user = await this.getUser({ sessionId, username });
    return user?.location;
  }

  async setLocation({ sessionId, username, location }) {
    return this.model.updateOne(
      { "id": sessionId, "users.username": username },
      { $set: { "users.$.location": location } }
    );
  }

  async getLastSeen({ sessionId, username }) {
    const user = await this.getUser({ sessionId, username });
    return user?.lastSeen;
  }

  async setLastSeen({ sessionId, username, lastSeen }) {
    return this.model.updateOne(
      { "id": sessionId, "users.username": username },
      { $set: { "users.$.lastSeen": lastSeen } }
    );
  }

  async getResourceRequest({ sessionId, username }) {
    const user = await this.getUser({ sessionId, username });
    return user?.resourceRequest || [];
  }

  async setResourceRequest({ sessionId, username, resourceRequest }) {
    return this.model.updateOne(
      { "id": sessionId, "users.username": username },
      { $set: { "users.$.resourceRequest": resourceRequest } }
    );
  }

  async getResourceResponse({ sessionId, username }) {
    const user = await this.getUser({ sessionId, username });
    return user?.resourceResponse || [];
  }

  async setResourceResponse({ sessionId, username, resourceResponse }) {
    return this.model.updateOne(
      { "id": sessionId, "users.username": username },
      { $set: { "users.$.resourceResponse": resourceResponse } }
    );
  }
}
