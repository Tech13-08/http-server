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
          if (pathData[0].length > 0) {
            switch (pathData[0]) {
              case "echo":
                let content = pathData[1];
                socket.write(
                  "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:" +
                    content.length +
                    "\r\n\r\n" +
                    content
                );
                break;
              default:
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            }
          } else {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");
          }
          break;
      }
    }
  });
});

server.listen(4221, "localhost");
