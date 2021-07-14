module.exports = function (io) { 
    
    io.on('connection', function(socket) {
        socket.on('create', function (room) {
          console.log(room)
            socket.join(room);
          });
        socket.on('test', function (room) {
            console.log("test event");
          });
        console.log("Aa gya e")
        // socket.emit('announcements', { message: 'A new user has joined!' });
        // socket.on('itemUpdates', function(data,sock) {
        //     console.log(data)
        //     socket.emit('update', { message: 'Update Item on all devices!' });
        // });
        socket.on("disconnect", () => {
          console.log("Chor Gya"); // undefined
        });
    });
    
    
 }                                                                               
