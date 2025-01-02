import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import user from "./models/user";

const wss = new WebSocketServer({ port: 8080 });

class site {
  public count: number = 0;
  public socket: WebSocket;
  public id: string;

  constructor(socket: WebSocket, id: string) {
    this.count = 0;
    this.socket = socket;
    this.id = id;
  }

  increaseCount() {
    return this.count++;
  }

  getCount() {
    return this.count;
  }

  decreaseCount() {
    return this.count--;
  }
}

class WebSocketServerManager {
  public sites: site[];

  constructor() {
    this.sites = [];
  }

  add(socket: WebSocket, id: string) {
    const newSite = new site(socket, id);
    this.sites.push(newSite);
  }

  remove(socket: WebSocket) {
    this.sites = this.sites.filter((site) => site.socket !== socket);
  }

  addIncreaseCount(socket: WebSocket, id: string) {
    const site = this.sites.find((site) => site.id === id);
    console.log(site);
    if (site) {
      console.log("increasing count");
      site.increaseCount();
    }
  }
  descreaseCount(socket: WebSocket, id: string) {
    const site = this.sites.find((site) => site.id === id);
    console.log(site);
    if (site) {
      console.log("decreasing count");
      site.decreaseCount();
    }
  }

  getCount(socket: WebSocket) {
    return this.sites.length;
    // const site = this.sites.find((site) => site.socket === socket);
    // if (site) {
    //   return site.getCount();
    // } else {
    //   return 0;
    // }
  }
}

const manager = new WebSocketServerManager();

async function createUser(siteName: string, id: string) {
  const newUser = new user({
    siteName,
    id,
  });

  await newUser.save();

  console.log("User created");

  return;
}

wss.on("connection", (ws) => {
  const interval = setInterval(() => {
    const count = manager.getCount(ws);
    ws.send(
      JSON.stringify({
        message: `Count received `,
        totalUsers: `${count}`,
        type: "users",
      })
    );
  }, 2000);

  ws.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (error) {
      console.log("Invalid data format");
      ws.send("Invalid data format");
      return;
    }

    switch (message.type) {
      case "register":
        (async () => {
          const id = uuidv4();
          manager.add(ws, id);
          await createUser("SiteName" + id, id);
          ws.send(JSON.stringify({ message: "Someone registered" }));
        })();
        break;
      case "increase-user":
        if (message.id) {
          manager.addIncreaseCount(ws, message.id);
          ws.send(JSON.stringify({ message: "User increased" }));
        } else {
          ws.send(JSON.stringify({ message: "Invalid id" }));
        }
        break;
      case "decrease-user":
        if (message.id) {
          manager.addIncreaseCount(ws, message.id);
          ws.send(JSON.stringify({ message: "User increased" }));
        } else {
          ws.send(JSON.stringify({ message: "Invalid id" }));
        }
        break;
      default:
        ws.send(JSON.stringify({ message: "Invalid message type" }));
    }
  });

  ws.on("close", (socket: WebSocket) => {
    manager.remove(socket);
    clearInterval(interval);
    ws.send("closed");
  });
});

async function connectDB() {
  await mongoose.connect("mongodb://localhost:27017/test");
  console.log("Connected to db");
}

connectDB();
