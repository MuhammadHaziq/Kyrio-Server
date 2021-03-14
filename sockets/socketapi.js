const io = require( "socket.io" )();
const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on( "newUser", function( socket ) {
    console.log( "A user connected" );
});
// end of socket.io logic

module.exports = socketapi;