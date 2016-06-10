export function startDeployment(socket, clone_data) {
  return new Promise(function(resolve, reject) {
    socket.emit('startDeployment', clone_data.toString());
    resolve('okay');
  });
}
