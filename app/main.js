const net = require("net");
const fs = require("fs");
const dirIndex = process.argv.indexOf("--directory");
let dirValue;

if (dirIndex > -1) {
  // Retrieve the value after --custom
  dirValue = process.argv[dirIndex + 1];
}

const directory = dirValue || "";

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
          const compressionIndex = request.findIndex((element) =>
            element.startsWith("Accept-Encoding")
          );
          const compression =
            compressionIndex > -1 ? request[compressionIndex] : "";
          if (pathData[0].length > 0) {
            switch (pathData[0]) {
              case "echo":
                let content = pathData[1];
                socket.write(
                  "HTTP/1.1 200 OK\r\n" +
                    (compression.length > 0
                      ? "Content-Encoding: " + compression
                      : "") +
                    "\r\nContent-Type: text/plain\r\nContent-Length:" +
                    content.length +
                    "\r\n\r\n" +
                    content
                );
                break;
              case "user-agent":
                let userAgent =
                  request[
                    request.findIndex((element) =>
                      element.includes("User-Agent")
                    )
                  ].split(": ")[1];
                socket.write(
                  "HTTP/1.1 200 OK\r\n" +
                    (compression.length > 0
                      ? "Content-Encoding: " + compression
                      : "") +
                    "\r\nContent-Type: text/plain\r\nContent-Length:" +
                    userAgent.length +
                    "\r\n\r\n" +
                    userAgent
                );
                break;
              case "files":
                if (fs.existsSync(directory + pathData[1])) {
                  const fileContent = fs.readFileSync(
                    directory + pathData[1],
                    "utf-8"
                  );
                  console.log(fileContent);
                  socket.write(
                    "HTTP/1.1 200 OK\r\n" +
                      (compression.length > 0
                        ? "Content-Encoding: " + compression
                        : "") +
                      "\r\nContent-Type: application/octet-stream\r\nContent-Length:" +
                      fileContent.length +
                      "\r\n\r\n" +
                      fileContent
                  );
                } else {
                  socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                }
                break;
              default:
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            }
          } else {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");
          }
          break;

        case "POST":
          if (pathData[0].length > 0) {
            switch (pathData[0]) {
              case "files":
                if (!fs.existsSync(directory + pathData[1])) {
                  const fileContent = request[request.length - 1];
                  fs.writeFileSync(directory + pathData[1], fileContent);
                  socket.write("HTTP/1.1 201 Created\r\n\r\n");
                } else {
                  socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                }
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
