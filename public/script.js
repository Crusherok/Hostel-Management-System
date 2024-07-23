const hostelForm = document.getElementById('hostelForm');
const hostelNameInput = document.getElementById('hostelName');
const hostelLocationInput = document.getElementById('hostelLocation');
const hostelCapacityInput = document.getElementById('hostelCapacity');
const studentNameInput = document.getElementById('studentName');
const studentRoomInput = document.getElementById('studentRoom');
const hostelList = document.getElementById('hostelList');

// Function to fetch hostels from backend and display them
async function fetchHostels() {
    try {
        const response = await fetch('/hostels');
        if (!response.ok) {
            throw new Error('Failed to fetch hostels');
        }
        const hostels = await response.json();
        hostelList.innerHTML = '';
        hostels.forEach(hostel => {
            const li = document.createElement('li');
            li.textContent = `${hostel.name} - Location: ${hostel.location}, Capacity: ${hostel.capacity}`;
            li.dataset.hostelId = hostel._id; // Store hostel ID as data attribute
            
            const addStudentForm = document.createElement('form');
            addStudentForm.innerHTML = `
                <input type="text" placeholder="Enter student name..." id="studentName_${hostel._id}">
                <input type="number" placeholder="Enter room number..." id="studentRoom_${hostel._id}">
                <button type="button" onclick="addStudent('${hostel._id}')">Add Student</button>
            `;
            li.appendChild(addStudentForm);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete Hostel';
            deleteButton.addEventListener('click', async () => {
                try {
                    const response = await fetch(`/hostels/${hostel._id}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) {
                        throw new Error('Failed to delete hostel');
                    }
                    li.remove();
                } catch (err) {
                    console.error('Error deleting hostel:', err.message);
                }
            });
            li.appendChild(deleteButton);
            hostelList.appendChild(li);
        });
    } catch (err) {
        console.error('Error fetching hostels:', err.message);
    }
}

// Initial fetch when page loads
fetchHostels().catch(err => console.error(err));

// Add event listener for form submission to add hostel
hostelForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = hostelNameInput.value.trim();
    const location = hostelLocationInput.value.trim();
    const capacity = parseInt(hostelCapacityInput.value, 10);

    if (name === '' || location === '' || isNaN(capacity)) return;

    try {
        const response = await fetch('/hostels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, location, capacity })
        });
        if (!response.ok) {
            throw new Error('Failed to add hostel');
        }
        const newHostel = await response.json();
        const li = document.createElement('li');
        li.textContent = `${newHostel.name} - Location: ${newHostel.location}, Capacity: ${newHostel.capacity}`;
        li.dataset.hostelId = newHostel._id; // Store hostel ID as data attribute
        
        const addStudentForm = document.createElement('form');
        addStudentForm.innerHTML = `
            <input type="text" placeholder="Enter student name..." id="studentName_${newHostel._id}">
            <input type="number" placeholder="Enter room number..." id="studentRoom_${newHostel._id}">
            <button type="button" onclick="addStudent('${newHostel._id}')">Add Student</button>
        `;
        li.appendChild(addStudentForm);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Hostel';
        deleteButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`/hostels/${newHostel._id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    throw new Error('Failed to delete hostel');
                }
                li.remove();
            } catch (err) {
                console.error('Error deleting hostel:', err.message);
            }
        });
        li.appendChild(deleteButton);
        hostelList.appendChild(li);
        hostelNameInput.value = '';
        hostelLocationInput.value = '';
        hostelCapacityInput.value = '';
    } catch (err) {
        console.error('Error adding hostel:', err.message);
    }
});

// Function to add a student to a hostel
async function addStudent(hostelId) {
    const studentName = document.getElementById(`studentName_${hostelId}`).value.trim();
    const studentRoom = document.getElementById(`studentRoom_${hostelId}`).value.trim();

    if (studentName === '' || isNaN(studentRoom)) return;

    try {
        const response = await fetch(`/hostels/${hostelId}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: studentName, room: studentRoom })
        });
        if (!response.ok) {
            throw new Error('Failed to add student');
        }
        const newStudent = await response.json();
        alert(`Student ${newStudent.name} added to room ${newStudent.room} in hostel ${newStudent.hostel}`);
        document.getElementById(`studentName_${hostelId}`).value = '';
        document.getElementById(`studentRoom_${hostelId}`).value = '';
    } catch (err) {
        console.error('Error adding student:', err.message);
    }
}
