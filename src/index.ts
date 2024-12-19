<<<<<<< HEAD
import { WebSocket, WebSocketServer } from "ws";

const ws = new WebSocketServer({ port: 8080 });
=======
import mongoose from "mongoose";
import { WebSocket, WebSocketServer } from "ws";
import { SiteModel } from "./Schemas/SiteSchema";
require("dotenv").config();
const port = 8080;

const ws = new WebSocketServer({ port });
>>>>>>> 81bf4d1f0d1ae5f265cb5f974e3c18fba6a5e80e

class site {
  public id: string;
  public name: string;
<<<<<<< HEAD
  public admin: WebSocket | null;
  public clients: Set<WebSocket>;

  constructor(id: string, name: string, admin: WebSocket) {
=======
  public url: string;
  public admin: WebSocket | null;
  public clients: Set<WebSocket>;

  constructor(id: string, name: string, admin: WebSocket | null) {
>>>>>>> 81bf4d1f0d1ae5f265cb5f974e3c18fba6a5e80e
    this.id = id;
    this.name = name;
    this.clients = new Set();
    this.admin = admin;
<<<<<<< HEAD
=======
    this.url = "";
>>>>>>> 81bf4d1f0d1ae5f265cb5f974e3c18fba6a5e80e
  }

  public registerAdmin(admin: WebSocket) {
    this.admin = admin;
  }

  public addClient(client: WebSocket) {
    this.clients.add(client);
    this.notifyclients();
  }

  public removeClient(client: WebSocket) {
    this.clients.delete(client);
    this.notifyclients();
  }

  public returnClients() {
    return this.clients.size;
  }

  private notifyclients() {
    const totalUsers = this.clients.size;
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "get-sites", totalUsers }));
      }
    });

    if (this.admin && this.admin.readyState === WebSocket.OPEN) {
      this.admin.send(
        JSON.stringify({ type: "get-sites", totalUsers: this.clients.size })
      );
    }
  }
}

class WebSocketServerManager {
  public sites: Map<string, site>;

  constructor() {
    this.sites = new Map();
  }

<<<<<<< HEAD
  public registerSite(id: string, name: string, socket: WebSocket) {
    if (!this.sites.has(id)) {
      this.sites.set(id, new site(id, name, socket));
=======
  public async loadSites() {
    const admins = await SiteModel.find({});
    admins.forEach((admin) => {
      this.sites.set(admin.id, new site(admin.id, admin.name, null));
    });
  }

  public registerSite(id: string, name: string, socket: WebSocket) {
    if (!this.sites.has(id)) {
      this.sites.set(id, new site(id, name, socket));
      SiteModel.create({ id, name });
>>>>>>> 81bf4d1f0d1ae5f265cb5f974e3c18fba6a5e80e
      return;
    }
  }

  public addClient(socket: WebSocket, id: string) {
    const site = this.sites.get(id);
    if (site) {
      site.addClient(socket);
      return;
    }
  }

  public removeSite(socket: WebSocket, id: string) {
    const siteExists = this.sites.get(id);
    if (siteExists) {
      siteExists.removeClient(socket);
      return;
    }
  }

  public returnSitesLength(id: string) {
    return this.sites.get(id)?.returnClients() ?? 0;
  }
}

const manager = new WebSocketServerManager();
<<<<<<< HEAD
=======
manager.loadSites();

>>>>>>> 81bf4d1f0d1ae5f265cb5f974e3c18fba6a5e80e
ws.on("connection", (socket, req) => {
  const queryString = new URLSearchParams(
    new URL(req.url ?? "", "ws://localhost").search
  );
  const id = queryString.get("id");
  let message = "";

  if (!id || id.trim() === "") {
    socket.send(JSON.stringify({ message: "Invalid id provided" }));
    socket.close();
    return;
  } else {
    console.log(`New client connected with id: ${id}`);
    manager.addClient(socket, id);
    broadcastClientUpdate(socket, id);
    socket.send(JSON.stringify({ message: "Connected to server" }));
  }
  socket.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
      broadcastClientUpdate(socket, id);
    } catch (error) {
      console.log(error);
      socket.send(JSON.stringify({ messsage: "Error parsing message" }));
      return;
    }

    switch (message.type) {
      case "register-admin":
        console.log("Admin registering site");
        manager.registerSite(id, message?.name, socket);
        socket.send(JSON.stringify({ message: "Admin site registered" }));
        break;
      case "get-sites":
        console.log("get-users called");
        const sites = manager.returnSitesLength(id);
        socket.send(JSON.stringify({ sites, type: "users" }));
        break;
      default:
        socket.send(JSON.stringify({ message: "Invalid message type" }));
        break;
    }
  });

  socket.on("close", () => {
    manager.removeSite(socket, id);
    console.log("Client disconnected");
  });
});

function broadcastClientUpdate(socket: WebSocket, id: string) {
  const clients = manager.returnSitesLength(id);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "get-sites", totalUsers: clients }));
  }
}
<<<<<<< HEAD
=======

async function StartServer() {
  await mongoose.connect(process.env.MONGO_URI ?? "");
  console.log("Mongodb connected and Server started on " + port);
}

StartServer();
>>>>>>> 81bf4d1f0d1ae5f265cb5f974e3c18fba6a5e80e
