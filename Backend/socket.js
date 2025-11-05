const userModel = require("./src/models/user.model");

exports.socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("identify", async ({ userId }) => {
      try {
        const user = await userModel.findByIdAndUpdate(
          userId,
          { socketId: socket.id, isOnline: true },
          { new: true }
        );
        console.log(
          `User ${user.fullName} identified with socket ID: ${socket.id}`
        );
        // acknowledge client that identification succeeded
        try {
          socket.emit("identified", { userId: userId, socketId: socket.id });
        } catch (ackErr) {
          console.warn("Failed to emit identified ack:", ackErr);
        }
      } catch (error) {
        console.error("Error in identify event:", error);
      }
    });
    socket.on("disconnect", async () => {
      try {
        const user = await userModel.findOneAndUpdate(
          { socketId: socket.id },
          { socketId: null, isOnline: false },
          { new: true }
        );
        if (user) {
          console.log(
            `User ${user.fullName} disconnected and socket ID cleared.`
          );
        } else {
          console.log(
            `Socket ID ${socket.id} disconnected but no associated user found.`
          );
        }
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
    });
  });
};
