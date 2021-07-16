module.exports = function (io) { 
    
    io.on('connection', function(socket) {
        socket.on('create', function (room) {
            socket.join(room);
          });
        // console.log("Aa gya e")
        // socket.emit('announcements', { message: 'A new user has joined!' });
        // socket.on('itemUpdates', function(data,sock) {
        //     console.log(data)
        //     socket.emit('update', { message: 'Update Item on all devices!' });
        // });
        // socket.on("disconnect", () => {
        //   console.log("Chor Gya");
        // });
    });
    
    
 }                                                                               
