module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('donation', (data) => {
            io.emit('donationUpdate', data); // Broadcast donation updates to all clients
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });
};