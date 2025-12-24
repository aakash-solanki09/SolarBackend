const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Chat = require('./models/Chat');
const User = require('./models/User');
const Notification = require('./models/Notification');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Frontend URL
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/site-settings', require('./routes/siteSettingsRoutes'));

// Socket.io
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on('sendMessage', async (data) => {
        const { sender, receiver, text } = data;

        try {
            console.log('Server received message:', data);

            // Prepare chat data
            const chatData = {
                sender,
                text,
                receiverRole: 'user' // default
            };

            if (receiver === 'admin') {
                chatData.receiverRole = 'admin';
                chatData.receiver = null;
            } else {
                chatData.receiver = receiver;
            }

            console.log('Attempting to save:', chatData);

            // Save to DB
            const newChat = new Chat(chatData);
            await newChat.save();
            console.log('Message saved successfully');

            const messageData = {
                ...newChat.toObject(),
            };

            // Emit to specific rooms (Sender and Receiver)
            // Ensure IDs are strings
            if (sender) io.to(String(sender)).emit('message', messageData);
            
            if (receiver && receiver !== 'admin') {
                io.to(String(receiver)).emit('message', messageData);
            }

            if (receiver === 'admin') {
                console.log("Emitting to admin room");
                io.to('admin').emit('message', messageData);

                 // Create Notification for Admin
                 try {
                    // Check if sender is a valid ID (it should be for users)
                    if (sender && sender !== 'admin') {
                        const senderUser = await User.findById(sender);
                        if (senderUser) {
                           await Notification.create({
                               type: 'MESSAGE',
                               message: `New message from ${senderUser.name}`,
                               user: sender,
                               isRead: false
                           });
                        }
                    }
               } catch (err) {
                   console.error("Error creating chat notification:", err);
               }
            }

        } catch (error) {
            console.error("Socket error saving message:", error);
            socket.emit('error', { message: 'Message failed to save', error: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;


// Force restart for site settings routes
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
