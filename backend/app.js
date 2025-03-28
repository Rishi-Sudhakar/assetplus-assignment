const express = require('express')
var mongoose = require('mongoose');
const app = express()
const port = 8000
const cors = require('cors')
const path = require('path')

// MongoDB connection with improved options
mongoose.connect("mongodb://127.0.0.1:27017/assignment", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Handle MongoDB connection errors
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(require("./routes"));

app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})

process.on('SIGINT', async function () {
    await mongoose.disconnect();
    process.exit(0)
});