const { Server } = require('socket.io');

let io;

// Store active polls and connected users (in production, you'd use Redis)
let activePoll = null;
let connectedUsers = new Map();
let pollResults = new Map();
let pollHistory = [];

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    
    io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: false
      }
    });
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user joining
      socket.on('join', (data) => {
        const { name, role } = data;
        connectedUsers.set(socket.id, { 
          name, 
          role, 
          answered: false,
          joinedAt: new Date()
        });
        
        // Send current poll state
        socket.emit('pollUpdate', {
          poll: activePoll,
          results: Object.fromEntries(pollResults),
          users: Array.from(connectedUsers.values()).map(u => ({ name: u.name, role: u.role }))
        });

        // Broadcast updated user list
        io.emit('userUpdate', {
          users: Array.from(connectedUsers.values()).map(u => ({ name: u.name, role: u.role }))
        });
        
        console.log(`${role} joined:`, name);
      });

      // Handle poll creation (only teachers)
      socket.on('createPoll', (pollData) => {
        const user = connectedUsers.get(socket.id);
        if (user && user.role === 'teacher') {
          activePoll = {
            id: Date.now(),
            question: pollData.question,
            options: pollData.options,
            duration: pollData.duration,
            createdAt: new Date(),
            createdBy: user.name
          };
          
          // Reset poll results and user answered status
          pollResults.clear();
          connectedUsers.forEach(user => {
            user.answered = false;
          });
          
          // Broadcast new poll to all users
          io.emit('pollCreated', activePoll);
          console.log('Poll created:', activePoll.question);
          
          // Set timer to end poll
          if (pollData.duration > 0) {
            setTimeout(() => {
              endPoll();
            }, pollData.duration * 1000);
          }
        }
      });

      // Handle poll answers (only students who haven't answered)
      socket.on('submitAnswer', (data) => {
        const user = connectedUsers.get(socket.id);
        if (user && user.role === 'student' && !user.answered && activePoll) {
          const { optionIndex } = data;
          
          // Mark user as answered
          user.answered = true;
          
          // Store the answer
          if (!pollResults.has(optionIndex)) {
            pollResults.set(optionIndex, 0);
          }
          pollResults.set(optionIndex, pollResults.get(optionIndex) + 1);
          
          // Send updated results to everyone
          io.emit('pollResults', {
            results: Object.fromEntries(pollResults),
            totalVotes: Array.from(pollResults.values()).reduce((a, b) => a + b, 0)
          });
          
          console.log(`Answer submitted by ${user.name}: Option ${optionIndex}`);
          
          // Check if all students have answered
          const students = Array.from(connectedUsers.values()).filter(u => u.role === 'student');
          const answeredStudents = students.filter(u => u.answered);
          
          if (students.length > 0 && answeredStudents.length === students.length) {
            // All students answered, end poll automatically
            setTimeout(() => endPoll(), 1000);
          }
        }
      });

      // Handle ending poll manually (only teachers)
      socket.on('endPoll', () => {
        const user = connectedUsers.get(socket.id);
        if (user && user.role === 'teacher') {
          endPoll();
        }
      });

      // Handle chat messages
      socket.on('chatMessage', (data) => {
        const user = connectedUsers.get(socket.id);
        if (user) {
          const message = {
            id: Date.now(),
            user: user.name,
            role: user.role,
            message: data.message,
            timestamp: new Date()
          };
          
          io.emit('chatMessage', message);
          console.log(`Chat from ${user.name}: ${data.message}`);
        }
      });

      // Handle student removal (only teachers)
      socket.on('removeStudent', (studentName) => {
        const user = connectedUsers.get(socket.id);
        if (user && user.role === 'teacher') {
          // Find and disconnect the student
          for (let [socketId, userData] of connectedUsers) {
            if (userData.name === studentName && userData.role === 'student') {
              connectedUsers.delete(socketId);
              io.to(socketId).emit('removed', { message: 'You have been removed from the session by the teacher' });
              io.sockets.sockets.get(socketId)?.disconnect(true);
              break;
            }
          }
          
          // Broadcast updated user list
          io.emit('userUpdate', {
            users: Array.from(connectedUsers.values()).map(u => ({ name: u.name, role: u.role }))
          });
          
          console.log(`Student removed: ${studentName}`);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
          console.log(`User disconnected: ${user.name} (${user.role})`);
        }
        connectedUsers.delete(socket.id);
        
        // Broadcast updated user list
        io.emit('userUpdate', {
          users: Array.from(connectedUsers.values()).map(u => ({ name: u.name, role: u.role }))
        });
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}

// Function to end the current poll
function endPoll() {
  if (activePoll && io) {
    // Save to history
    pollHistory.push({
      ...activePoll,
      results: Object.fromEntries(pollResults),
      endedAt: new Date(),
      totalVotes: Array.from(pollResults.values()).reduce((a, b) => a + b, 0)
    });

    // Broadcast poll ended
    io.emit('pollEnded', {
      poll: activePoll,
      results: Object.fromEntries(pollResults)
    });

    console.log('Poll ended:', activePoll.question);
    activePoll = null;
  }
}