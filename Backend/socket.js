

exports.socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log(socket.id);
   });
};
