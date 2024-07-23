const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hostelDB')
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Student Schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    room: {
        type: Number,
        required: true
    },
    hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel'
    }
});

const Student = mongoose.model('Student', studentSchema);

// Hostel Schema
const hostelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
});

const Hostel = mongoose.model('Hostel', hostelSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all hostels
app.get('/hostels', async (req, res) => {
    try {
        const hostels = await Hostel.find().populate('students');
        res.json(hostels);
    } catch (err) {
        console.error('Error fetching hostels:', err.message);
        res.status(500).json({ error: 'Failed to fetch hostels' });
    }
});

// Add a new hostel
app.post('/hostels', async (req, res) => {
    const { name, location, capacity } = req.body;
    try {
        const newHostel = new Hostel({ name, location, capacity });
        await newHostel.save();
        res.status(201).json(newHostel);
    } catch (err) {
        console.error('Error creating hostel:', err.message);
        res.status(500).json({ error: 'Failed to create hostel' });
    }
});

// Delete a hostel
app.delete('/hostels/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedHostel = await Hostel.findByIdAndDelete(id);
        if (!deletedHostel) {
            return res.status(404).json({ error: 'Hostel not found' });
        }
        res.json({ message: 'Hostel deleted successfully' });
    } catch (err) {
        console.error('Error deleting hostel:', err.message);
        res.status(500).json({ error: 'Failed to delete hostel' });
    }
});

// Add a new student to a hostel
app.post('/hostels/:id/students', async (req, res) => {
    const { id } = req.params;
    const { name, room } = req.body;
    try {
        const hostel = await Hostel.findById(id);
        if (!hostel) {
            return res.status(404).json({ error: 'Hostel not found' });
        }
        const newStudent = new Student({ name, room, hostel: hostel._id });
        await newStudent.save();
        hostel.students.push(newStudent);
        await hostel.save();
        res.status(201).json(newStudent);
    } catch (err) {
        console.error('Error adding student:', err.message);
        res.status(500).json({ error: 'Failed to add student' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
