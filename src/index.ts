import { WebSocket, WebSocketServer } from "ws";

const ws = new WebSocketServer({ port: 8080 });

class site {
  public id: string;
  public name: string;
  public admin: WebSocket | null;
  public clients: Set<WebSocket>;

  constructor(id: string, name: string, admin: WebSocket) {
    this.id = id;
    this.name = name;
    this.clients = new Set();
    this.admin = admin;
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

  public registerSite(id: string, name: string, socket: WebSocket) {
    if (!this.sites.has(id)) {
      this.sites.set(id, new site(id, name, socket));
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
