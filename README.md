# Live Polling System

A real-time interactive polling system built with React and Node.js, featuring separate interfaces for teachers and students.

## Features

### Teacher Features

- ✅ Create new polls with custom questions and options (2-6 options)
- ✅ View live polling results with real-time updates
- ✅ Can only ask new questions when no active poll exists or all students have answered
- ✅ Configurable poll time limit (10-300 seconds)
- ✅ Remove students from the session
- ✅ View past poll results (stored in memory)
- ✅ Real-time chat with students

### Student Features

- ✅ Enter unique name on first visit (unique per browser tab)
- ✅ Submit answers once a question is asked
- ✅ View live polling results after submission
- ✅ Maximum 60 seconds (configurable) to answer questions
- ✅ Real-time chat with teacher and other students

### Technical Features

- ✅ Real-time communication using Socket.io
- ✅ Redux state management
- ✅ TypeScript for type safety
- ✅ Responsive design
- ✅ Professional UI following modern design principles
- ✅ Error handling and loading states
- ✅ Connection status management

## Technology Stack

- **Frontend**: React 18 with TypeScript, Redux Toolkit, Socket.io Client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB (for potential data persistence)
- **Styling**: CSS3 with modern design patterns

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (optional, for data persistence)

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### Environment Variables

**Backend (.env)**:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/polling-system
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

**Frontend (.env)**:

```
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Usage

1. **Start the Application**:

   - Run both backend and frontend servers
   - Open `http://localhost:3000` in your browser

2. **Teacher Workflow**:

   - Click "Teacher" on the landing page
   - Enter your name
   - Create polls with questions and multiple choice options
   - Monitor student responses in real-time
   - View live results and manage connected students

3. **Student Workflow**:
   - Click "Student" on the landing page
   - Enter your unique name
   - Wait for teacher to create a poll
   - Select your answer and submit within the time limit
   - View results after submission

## Deployment

### Backend Deployment (Railway/Heroku)

1. **Railway**:

   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway add
   railway deploy
   ```

2. **Heroku**:
   ```bash
   heroku create your-app-name-backend
   heroku config:set MONGODB_URI=your-mongodb-connection-string
   heroku config:set JWT_SECRET=your-secret-key
   git push heroku main
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Vercel**:

   ```bash
   npm install -g vercel
   vercel --prod
   ```

   Set environment variable: `REACT_APP_BACKEND_URL=https://your-backend-url.com`

2. **Netlify**:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variable: `REACT_APP_BACKEND_URL=https://your-backend-url.com`

### MongoDB Setup (Production)

- Use MongoDB Atlas for cloud database
- Update `MONGODB_URI` in your backend environment variables

## API Endpoints

### HTTP Endpoints

- `GET /api/health` - Health check
- `GET /api/active-poll` - Get current active poll
- `GET /api/poll-history` - Get poll history

### Socket Events

**Client → Server:**

- `join` - Join session with name and role
- `create-poll` - Create new poll (teacher only)
- `submit-answer` - Submit poll answer (student only)
- `send-message` - Send chat message
- `remove-student` - Remove student (teacher only)

**Server → Client:**

- `poll-state` - Current poll state
- `new-poll` - New poll created
- `poll-results-updated` - Live results update
- `poll-ended` - Poll has ended
- `users-updated` - Connected users update
- `new-message` - New chat message
- `error` - Error message

## Project Structure

```
polling-system/
├── backend/
│   ├── models/
│   │   ├── Poll.js
│   │   └── Student.js
│   ├── package.json
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── PollCreation.tsx
│   │   │   ├── ActivePoll.tsx
│   │   │   ├── PollResults.tsx
│   │   │   ├── StudentsPanel.tsx
│   │   │   ├── Chat.tsx
│   │   │   └── PollHistory.tsx
│   │   ├── store/
│   │   │   └── store.ts
│   │   ├── services/
│   │   │   └── socketService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── App.css
│   ├── package.json
│   └── .env
└── README.md
```

## Design Features

- **Modern UI**: Clean, professional interface with gradient backgrounds
- **Real-time Updates**: Instant synchronization across all connected clients
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Visual Feedback**: Loading states, error handling, and success messages
- **Accessibility**: Proper color contrast and keyboard navigation
- **User Experience**: Intuitive workflows for both teachers and students

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Poll scheduling and advanced settings
- [ ] Analytics and detailed reporting
- [ ] Export results to CSV/PDF
- [ ] Multiple choice question types
- [ ] File attachment support in chat
- [ ] Poll templates and question banks
- [ ] Student attendance tracking

## License

MIT License - feel free to use this project for educational or commercial purposes.

## Support

For issues or questions, please open an issue in the GitHub repository.
