const app = require("./app");
const port = process.env.PORT || 3000;

const initSocketServer = require("./sockets/socket.server");
const httpServer = require("http").createServer(app);

initSocketServer(httpServer); 

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});