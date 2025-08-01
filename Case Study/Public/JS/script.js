document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const reservationForm = document.getElementById('reservation-form');
    const searchForm = document.getElementById('search-form');
    const labSelect = document.getElementById('lab-select');
    const profilePicture = document.getElementById('profile-picture');
    const userName = document.getElementById('user-name');
    const userDescription = document.getElementById('user-description');
    const userReservations = document.getElementById('user-reservations');
    const availabilityDiv = document.getElementById('availability');
    const searchResults = document.getElementById('search-results');
    const editProfileButton = document.getElementById('edit-profile');
    const editProfileSection = document.getElementById('edit-profile-section');
    const cancelEditButton = document.getElementById('cancel-edit');

    // newly added elements by nathan
    const seatSelect = document.getElementById('seat');
    const labFormSelect = document.getElementById('lab');
    const deleteAccountButton = document.getElementById('delete-account');

  
    //newly added elements by brian
    const selectTimeSlotSelect = document.getElementById("lab-timeslot-select");
    const checkAvailabilityBtn = document.getElementById("check-available-slots-btn");
    const checkAvailableSection = document.getElementById("check-avalable-section");
    const row1 = document.getElementById('lab-availability-dv1');
    const row2 = document.getElementById('lab-availability-dv2');
    const row3 = document.getElementById('lab-availability-dv3');


    // newly added elements by kain
    const logoutButton = document.getElementById('logout-button');

    // 09/07/24
    const dropdownContent = document.getElementById("myDropdown");
    const modal = document.getElementById('user-info-modal');
    const modalClose = document.querySelector('.modal .close');
    const modalProfilePicture = document.getElementById('modal-profile-picture');
    const modalUserName = document.getElementById('modal-user-name');
    const modalUserDescription = document.getElementById('modal-user-description');
    const modalUserReservations = document.getElementById('modal-user-reservations');
    const submitEditButton = document.getElementById('submit-edit');

    const technicianDropdownContent = document.getElementById('mytechnicianDropdown');
    const technicianRemoveReservation = document.getElementById('myremovereservationDropdown');
    
    // Initial Data
    const initialUsers = [
        { id: 1, email: 'student1@dlsu.edu', password: 'password1', role: 'student', profile: { picture: 'images/default-profile.png', description: 'Student 1' }, reservations: [] },
        { id: 2, email: 'student2@dlsu.edu', password: 'password2', role: 'student', profile: { picture: 'images/default-profile2.jpeg', description: 'Student 2' }, reservations: [] },
        { id: 3, email: 'technician1@dlsu.edu', password: 'password3', role: 'technician', profile: { picture: 'images/default-profile.png', description: 'Technician 1' }, reservations: [] },
        { id: 4, email: 'student3@dlsu.edu', password: 'password4', role: 'student', profile: { picture: 'images/default-profile2.jpeg', description: 'Student 3' }, reservations: [] },
        { id: 5, email: 'technician2@dlsu.edu', password: 'password5', role: 'technician', profile: { picture: 'images/default-profile.png', description: 'Technician 2' }, reservations: [] }
    ];

    const initialReservations = [
        { id: 1, userId: 1, labId: 1, date: '2024-06-11', time: '09:00', anonymous: false, seatNumber: 1 },
        { id: 2, userId: 2, labId: 2, date: '2024-06-11', time: '10:30', anonymous: true, seatNumber: 2 },
        { id: 3, userId: 1, labId: 1, date: '2024-06-11', time: '09:00', anonymous: false, seatNumber: 4 }
    ];

    const labs = [
        // add an array reservations attribute -- automatically populate object + array
        { id: 1, name: 'Lab 1', seats: 10, reservations: {} },
        { id: 2, name: 'Lab 2', seats: 8, reservations: {} },
        { id: 3, name: 'Lab 3', seats: 12, reservations: {} }
    ];

    const timeslots = [
        '09:00', '10:30', '12:00', '1:30', '3:00', '4:30'
    ]

    //reservations can only be made one week in advance
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]


    //populate weekly schedule for labs
    function populateLabSchedule() {
        labs.forEach((lab) => {
            days.forEach((day) => {
                lab.reservations[day] = []
                timeslots.forEach((time) => {
                    lab.reservations[day][time] = new Array(lab.seats)
                })
            })
            console.log(lab)
        })
    }

    //--------------------------EDIT STARTED HERE-------------------------
    //populate users for profile (newly added 09/07/24)

    //Populate users for searching users
    function populateUserDropdown() {
        if (dropdownContent) {
            dropdownContent.innerHTML = '';
            users.forEach(user => {
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = user.email;
                a.addEventListener('click', function () {
                    showModal(user);
                });
                dropdownContent.appendChild(a);
            });
        }
    }

    //Populate user dropdown to make reservation (technician side)
    function populateTechnicianDropdown() {
        if (technicianDropdownContent) {
            technicianDropdownContent.innerHTML = '';
            const students = users.filter(user => user.role === 'student');
            students.forEach(student => {
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = student.email;
                a.addEventListener('click', () => makeReservation(student.email)); // Pass student email to makeReservation
                technicianDropdownContent.appendChild(a);
            });
        }
    }

    function populateTechnicianDropdownRemove() {
        if (technicianRemoveReservation) {
            technicianRemoveReservation.innerHTML = '';
            const students = users.filter(user => user.role === 'student');
            students.forEach(student => {
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = student.email;
                a.addEventListener('click', () => removeReservationTech(student.email)); // Pass student email to makeReservation
                technicianRemoveReservation.appendChild(a);
            });
        }
    }

    //Prompts to make reservations for the user
    function makeReservation(studentEmail) {
        const student = users.find(user => user.email === studentEmail);
    
        if (student) {
            const labId = prompt('Enter Lab ID:');
            const date = prompt('Enter Date (YYYY-MM-DD):');
            const time = prompt('Enter Time (HH:MM):');
            const seatNumber = parseInt(prompt('Enter Seat Number:'));
    
            if (labId && date && time && seatNumber) {
                const reservation = {
                    id: Date.now(),
                    userId: student.id,
                    labId: parseInt(labId),
                    date,
                    time,
                    anonymous: false, // Technicians cannot make anonymous reservations for students
                    seatNumber
                };
    
                reservations.push(reservation);
                saveData(); // Assuming you have a saveData() function to save reservations
                alert('Reservation made successfully for ' + student.email);
                // Optionally, redirect to profile page or update reservations list dynamically
            } else {
                alert('All fields are required to make a reservation.');
            }
        } else {
            alert('Selected student not found.');
        }
    }

    //Remove reservation for user
    function removeReservationTech(studentEmail) {
        const student = users.find(user => user.email === studentEmail);
    
        if (student) {
            const labId = prompt('Enter Lab ID:');
            const date = prompt('Enter Date (YYYY-MM-DD):');
    
            if (labId && date) {
                const reservationIndex = reservations.findIndex(reservation => 
                    reservation.userId === student.id && 
                    reservation.labId === parseInt(labId) && 
                    reservation.date === date
                );
    
                if (reservationIndex !== -1) {
                    reservations.splice(reservationIndex, 1);
                    saveData(); // Assuming you have a saveData() function to save reservations
                    alert('Reservation removed successfully for ' + student.email);
                    // Optionally, update the UI to reflect the removed reservation
                } else {
                    alert('No matching reservation found for the provided details.');
                }
            } else {
                alert('Lab ID and Date are required to remove a reservation.');
            }
        } else {
            alert('Selected student not found.');
        }
    }
    
    //Handles the displaying of the technician side
    function displayTechnicianElements() {
        if (currentUser && currentUser.role !== 'technician') {
            const technicianDropdown = document.getElementById('mytechnicianDropdown'); 
            const technicianContents = document.getElementById('technician-dropDown-Button'); 
            const technicianSection = document.getElementById('technician-section');

            const technicianDropdownRemove = document.getElementById('myremovereservationDropdown'); 
            const technicianContentsRemove = document.getElementById('remove-reservation-dropDown-Button'); 
            const technicianSectionRemove = document.getElementById('remove-reservation-section');
            if (technicianDropdown) {
                technicianDropdown.style.display = 'none'; // Hide technician dropdown for non-technicians
                technicianContents.style.display = 'none'; // Hide technician dropdown for non-technicians
                technicianSection.style.display = 'none'; // Hide technician section for non-technicians

                technicianDropdownRemove.style.display = 'none'; // Hide technician dropdown for non-technicians
                technicianContentsRemove.style.display = 'none'; // Hide technician dropdown for non-technicians
                technicianSectionRemove.style.display = 'none'; // Hide technician section for non-technicians
            }
        }
    }

    //-----------------------------ENDED HERE---------------------------
    
    //assign all reserved slots of timeslot of day
    function setReserved() {
        initialReservations.forEach((reservation) => {
            var setDate = new Date(reservation.date)
            var dayy = setDate.getDay()
            labs[reservation.labId - 1].reservations[days[dayy - 1]][reservation.time][reservation.seatNumber - 1] = true
        })
    }

    //check available slots
    function checkAvailableSlots(day, time) {
        var setDate = new Date(day)
        var dayy = setDate.getDay()
        labs.forEach((lab) => {
            var labNum = lab.id
            for (let i = 0; i < lab.seats; i++) {
                var div = document.getElementById(`lab-availability-dv${labNum}`)
                if (lab.reservations[days[dayy - 1]][time][i] != true) {
                    let available = document.createElement('p');
                    available.value = i;
                    available.innerHTML = `seat ${i + 1}`;
                    console.log(lab.id, `seat ${i + 1}`)
                    switch (lab.id) {
                        case 1:
                            row1.append(available);
                            break;
                        case 2:
                            row2.append(available);
                            break;
                        case 3:
                            row3.append(available);
                            break;
                    }
                }
            }

        })
    }

    //populate select for time in view reservation slots
    function populateSelectLabSchedule() {
        timeslots.map((time) => {
            let option = document.createElement("option");
            option.value = time; // the index
            option.innerHTML = time;
            selectTimeSlotSelect.append(option);
        });
    }

    //populate the header element of the divs for viewing of slots
    //temporary fix 
    function populateAvailabilityDivs() {
        if (!row1.querySelector('h4')) {
            var head1 = document.createElement('h4');
            head1.innerHTML = "Lab 1";
            row1.append(head1);
        }
        if (!row2.querySelector('h4')) {
            var head2 = document.createElement('h4');
            head2.innerHTML = "Lab 2";
            row2.append(head2);
        }
        if (!row3.querySelector('h4')) {
            var head3 = document.createElement('h4');
            head3.innerHTML = "Lab 3";
            row3.append(head3);
        }
    }

    //funtionality of check availability button
    if (checkAvailabilityBtn) {
        checkAvailabilityBtn.addEventListener("click", function () {
            var time = document.getElementById("lab-timeslot-select")
            var date = document.getElementById("lab-date-select")
            row1.innerHTML = '';
            row2.innerHTML = '';
            row3.innerHTML = '';
            populateAvailabilityDivs();
            checkAvailableSlots(date.value, time.value)
        })
    }

    // Load Data from Local Storage or Initialize
    let users = JSON.parse(localStorage.getItem('users')) || initialUsers;
    let reservations = JSON.parse(localStorage.getItem('reservations')) || initialReservations;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Save Data to Local Storage
    function saveData() {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('reservations', JSON.stringify(reservations));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Logout Function
    function logout() {
        // Clear session-related data
        localStorage.removeItem('currentUser');
        currentUser = null;
        // Redirect to the login page
        window.location.href = 'login.html';
    }

    // Load Labs into Select Element
    function loadLabs() {
        [labSelect, labFormSelect].forEach(selectElement => {
            if (selectElement) {
                selectElement.innerHTML = '';
                labs.forEach(lab => {
                    const option = document.createElement('option');
                    option.value = lab.id;
                    option.textContent = lab.name;
                    selectElement.appendChild(option); 
                    // Was populatedropdown here
                    loadSeats(lab.id);// this is what was

                });
            }
        });
    }

    //-----------------------------EDIT STARTED HERE------------------------
    // Populate user dropdown with emails (09/07/2024)
    populateUserDropdown();

    // Call the function to populate the technician dropdown with student emails
    populateTechnicianDropdown();
    // Call the function to populate the remove dropdown
    populateTechnicianDropdownRemove();
    // Shows the Technician side only
    displayTechnicianElements();

    // Event listener for dropdown button of make reservation
    const techDropdown = document.getElementById('technician-dropDown-Button');
    if (techDropdown) {
        techDropdown.addEventListener('click', function() {
            document.getElementById('mytechnicianDropdown').classList.toggle('show');
        });
    }

    // Event listener for dropdown button of remove reservation
    const techDropdownRemove = document.getElementById('remove-reservation-dropDown-Button');
    if (techDropdownRemove) {
        techDropdownRemove.addEventListener('click', function() {
            document.getElementById('myremovereservationDropdown').classList.toggle('show');
        });
    }

    // Event listener for dropdown button
    const dropDownButton = document.getElementById('dropDown-Button');
    if (dropDownButton) {
        dropDownButton.addEventListener('click', function() {
            document.getElementById('myDropdown').classList.toggle('show');
        });
    }

    // Close the dropdown when clicking outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }

    //--------------------------------EDIT ENDED HERE--------------------------
    loadLabs();
    
    if (labSelect) {
        displayAvailability(parseInt(labSelect.value));
    }

    // Load Seats into Seat Select Element
    function loadSeats(labId) {
        if (seatSelect) {
            seatSelect.innerHTML = '';
            const lab = labs.find(l => l.id == labId);
            for (let i = 1; i <= lab.seats; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Seat ${i}`;
                seatSelect.appendChild(option);
            }
        }
    }

    // Function to delete the user's account
    function deleteUserAccount() {
        // Remove the user from the list of users
        users = users.filter(user => user.id !== currentUser.id);

        // Cancel any reservations associated with the user
        reservations = reservations.filter(reservation => reservation.userId !== currentUser.id);

        // Update local storage
        saveData();

        alert('Your account has been successfully deleted.');
        window.location.href = 'index.html'; // Redirect to the homepage
    }

    // Display Availability for Selected Lab
    function displayAvailability(labId) {
        if (availabilityDiv) {
            availabilityDiv.innerHTML = '';
            const lab = labs.find(l => l.id == labId);
            const labReservations = reservations.filter(r => r.labId == labId);
            for (let i = 1; i <= lab.seats; i++) {
                const seatReservations = labReservations.filter(r => r.seatNumber == i);
                const seatDiv = document.createElement('div');
                seatDiv.textContent = `Seat ${i}: ${seatReservations.length ? 'Reserved' : 'Available'}`;
                availabilityDiv.appendChild(seatDiv);
            }
        }
    }

    // Event Listeners
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            logout();
        });
    }

    function loadUserReservations() {
        if (userReservations) {
            userReservations.innerHTML = '';
            const userReservationsList = reservations.filter(r => r.userId === currentUser.id);
            userReservationsList.forEach(reservation => {
                const li = document.createElement('li');
                const labName = labs.find(l => l.id == reservation.labId).name;
                li.innerHTML = `Lab: ${labName}, Seat: ${reservation.seatNumber}, Date: ${reservation.date}, Time: ${reservation.time} <button id="remove-${reservation.id}">Remove reservation</button>`;
                userReservations.appendChild(li);

                const removeButton = document.getElementById(`remove-${reservation.id}`);
                removeButton.addEventListener('click', function () {
                    removeReservation(reservation.id);
                });
            });
        }
    }


    // Function to remove reservation within 10 minutes of the reservation time
    function removeReservation(reservationId) {
        const reservation = reservations.find(r => r.id === reservationId);
        if (!reservation) return;

        const reservationTime = new Date(`${reservation.date}T${reservation.time}:00`);
        const currentTime = new Date();

        const timeDifference = (reservationTime - currentTime) / (1000 * 60); // Difference in minutes

        if (timeDifference <= 10 && timeDifference >= 0) {
            reservations = reservations.filter(r => r.id !== reservationId);
            saveData();
            loadUserReservations();
            alert('Reservation successfully removed.');
        } else {
            alert('Reservations can only be removed within 10 minutes of the reservation time.');
        }
    }

    // Show the edit profile form when "Edit Profile" button is clicked
    if (editProfileButton) {
        editProfileButton.addEventListener('click', function () {
            editProfileSection.style.display = 'block';
        });
    }

    // new new kian - added a new feature to the edit profile
    // Function to reset the profile edit form and hide the section
    function resetProfileEditForm() {
        document.getElementById('new-profile-picture').value = '';
        document.getElementById('new-user-name').value = '';
        document.getElementById('new-user-description').value = '';
        editProfileSection.style.display = 'none';
    }

    // Attach the reset function to both cancel and submit buttons
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', resetProfileEditForm);
    }

    // Handle form submission (for saving changes)
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const newProfilePictureInput = document.getElementById('new-profile-picture');
            const newUserNameInput = document.getElementById('new-user-name');
            const newUserDescriptionInput = document.getElementById('new-user-description');

            // Update profile picture if a new one is provided
            if (newProfilePictureInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    currentUser.profile.picture = event.target.result;
                    document.getElementById('profile-picture').src = event.target.result;
                    saveData();
                };
                reader.readAsDataURL(newProfilePictureInput.files[0]);
            }

            // Update username if a new one is provided
            if (newUserNameInput.value.trim() !== '') {
                currentUser.email = newUserNameInput.value.trim();
                document.getElementById('user-name').textContent = currentUser.email;
            }

            // Update description if a new one is provided
            if (newUserDescriptionInput.value.trim() !== '') {
                currentUser.profile.description = newUserDescriptionInput.value.trim();
                document.getElementById('user-description').textContent = currentUser.profile.description;
            }

            saveData();
            editProfileSection.style.display = 'none';  // Hide the form after saving

            //new new kian, fixed ui stuff so that when the user finishes editting it automatically clears the inputs
            // Attach the reset function to both cancel and submit buttons
            if (cancelEditButton) {
                document.getElementById('new-profile-picture').value = '';
                document.getElementById('new-user-name').value = '';
                document.getElementById('new-user-description').value = '';
                editProfileSection.style.display = 'none';
            }
        });
    }

    // Event Listeners for other forms
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const remember = loginForm.remember.checked;

            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                currentUser = user;
                if (remember) {
                    currentUser.remember = true;
                    currentUser.rememberUntil = new Date(new Date().getTime() + 3 * 7 * 24 * 60 * 60 * 1000);
                }
                saveData();
                window.location.href = 'lab_availability.html';
            } else {
                alert('Invalid credentials');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const role = registerForm.role.value;

            if (users.find(u => u.email === email)) {
                alert('User already exists');
            } else {
                const newUser = { id: Date.now(), email, password, role, profile: { picture: 'images/default-profile.png', description: 'New user' }, reservations: [] };
                users.push(newUser);
                saveData();
                alert('Registration successful');
                window.location.href = 'login.html';
            }
        });
    }

    if (reservationForm) {
        reservationForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const labId = reservationForm.lab.value;
            const date = reservationForm.date.value;
            const time = reservationForm.time.value;
            const anonymous = reservationForm.anonymous.checked;
            const seatNumber = parseInt(document.getElementById('seat').value);

            const reservation = {
                id: Date.now(),
                userId: currentUser.id,
                labId: parseInt(labId),
                date,
                time,
                anonymous,
                seatNumber: seatNumber // new new kian, fixed the seats
            };

            reservations.push(reservation);
            saveData();
            alert('Reservation successful');
            window.location.href = 'profile.html';
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const search = searchForm.search.value.toLowerCase();
            const results = users.filter(u => u.email.toLowerCase().includes(search));
            searchResults.innerHTML = '';
            results.forEach(user => {
                const li = document.createElement('li');
                li.textContent = user.email;
                searchResults.appendChild(li);
            });
        });
    }

    if (currentUser) {
        if (profilePicture) profilePicture.src = currentUser.profile.picture;
        if (userName) userName.textContent = currentUser.email;
        if (userDescription) userDescription.textContent = currentUser.profile.description;

        if (userReservations) {
            userReservations.innerHTML = '';
            const userReservationsList = reservations.filter(r => r.userId === currentUser.id);
            userReservationsList.forEach(reservation => {
                const li = document.createElement('li');
                li.textContent = `Lab: ${labs.find(l => l.id == reservation.labId).name}, Seat: ${reservation.seatNumber}, Date: ${reservation.date}, Time: ${reservation.time}`;
                userReservations.appendChild(li);
            });
        }
    }

    if (labSelect) {
        labSelect.addEventListener('change', function () {
            const selectedLabId = parseInt(labSelect.value);
            displayAvailability(selectedLabId);
            loadSeats(selectedLabId); // Load seats for the selected lab
        });
    }

    // Event listener for the delete account button
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', function () {
            // Show confirmation prompt
            const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');

            // If user confirms deletion, call deleteUserAccount function
            if (confirmDelete) {
                deleteUserAccount();
            }
        });
    }

    // Initial Data Load
    loadLabs();
    populateLabSchedule();
    setReserved();
    populateSelectLabSchedule();

    if (labSelect) {
        displayAvailability(parseInt(labSelect.value));
    }

    if (currentUser) {
        loadUserReservations();
    }

    // Save initial data if it doesn't exist
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('reservations')) {
        localStorage.setItem('reservations', JSON.stringify(initialReservations));
    }

    // Event listener for lab selection change, you can call populateDropdown here or as needed
    if (labSelect) {
        labSelect.addEventListener('change', function () {
            const selectedLabId = parseInt(labSelect.value);
            displayAvailability(selectedLabId);
            loadSeats(selectedLabId); // Load seats for the selected lab
        });
    }

    //----------------------------EDIT STARTED HERE--------------------------------------
    //Information generator for the modal on profile (09/07/2024)
    function populateUserInfo() {
        if (currentUser) {
            profilePicture.src = currentUser.profile.picture;
            userName.textContent = currentUser.email;
            userDescription.textContent = currentUser.profile.description;

            // Display User's Reservations
            userReservations.innerHTML = '';
            const userReservationsList = reservations.filter(r => r.userId === currentUser.id);
            userReservationsList.forEach(reservation => {
                const li = document.createElement('li');
                li.textContent = `Lab: ${labs.find(l => l.id == reservation.labId).name}, Seat: ${reservation.seatNumber}, Date: ${reservation.date}, Time: ${reservation.time}`;
                userReservations.appendChild(li);
            });
        }
    }

    // Function to show modal with user information
    function showModal(user) {
        // Populate modal with user data
        const modalProfilePicture = document.getElementById('modal-profile-picture');
        const modalUserName = document.getElementById('modal-user-name');
        const modalUserDescription = document.getElementById('modal-user-description');
        const modalUserReservations = document.getElementById('modal-user-reservations');

        modalProfilePicture.src = user.profile.picture;
        modalUserName.textContent = user.email;
        modalUserDescription.textContent = user.profile.description;

        // Populate reservations
        modalUserReservations.innerHTML = ''; // Clear existing reservations
        const userReservationsList = reservations.filter(r => r.userId === user.id);
        userReservationsList.forEach(reservation => {
            const li = document.createElement('li');
            li.textContent = `Lab: ${labs.find(l => l.id == reservation.labId).name}, Seat: ${reservation.seatNumber}, Date: ${reservation.date}, Time: ${reservation.time}`;
            modalUserReservations.appendChild(li);
        });

        // Show the modal
        const modal = document.getElementById('user-info-modal');
        modal.style.display = 'block';

        // Close the modal when the close button is clicked
        const closeButton = document.querySelector('.modal-content .close');
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        // Close the modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Event listener to close the modal
    modalClose.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Close the modal when clicking outside of it
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Show modal only when user selects a user from the dropdown
    function showModalOnSelect() {
        const dropdownContent = document.getElementById('myDropdown');
        dropdownContent.addEventListener('click', function(event) {
            const selectedUser = event.target.textContent;
            const user = users.find(u => u.email === selectedUser);
            if (user) {
                showModal(user);
            }
        });
    }

    populateUserInfo();
    showModalOnSelect();
    //------------------------------EDIT ENDED HERE-------------------------------
});