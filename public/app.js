 // Called by Networked-Aframe when connected to server
function onConnect () {
  
  console.log("onConnect", new Date());
  
  const socket = NAF.connection.adapter.socket
  
  NAF.login = (name,pw)=>{
    socket.emit('login' , {name:name , pw:pw})
  }
  
  NAF.addUser = ( data , cb  )=>{
    socket.emit('add-user' , {key: data.key ,name:data.name , pw:data.pw} , cb )
  }
  
  //NAF.login('admin','password')

  socket.on('login-results' , results=>{
    
    console.log('success: ' , results.success)
    console.log('name: ' , results.name)
    
  })
  
}

