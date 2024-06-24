const net = require("net");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on("data", (data) => {
    // Parse the request to find the path
    let dataString = data.toString();
    console.log(dataString);

    const pathStartIndex = dataString.indexOf("/");
    if (pathStartIndex !== -1) {
      const request = dataString.substring(pathStartIndex + 1).split("\r\n");
      const path = request[0].split(" ")[0]; // Extract the first line after '/'
      const pathData = path.split("/");
      console.log(request);
      console.log(pathData);

      switch (dataString.substring(0, pathStartIndex - 1)) {
        case "GET":
          socket.write("HTTP/1.1 200 OK\r\n\r\n");
          break;
      }
    }
  });
});

server.listen(4221, "localhost");
