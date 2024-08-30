document.addEventListener('DOMContentLoaded', () => {
    const userTable = document.querySelector('#userTable tbody');
    const userFormModal = document.getElementById('userFormModal');
    const userForm = document.getElementById('userForm');
    const formTitle = document.getElementById('formTitle');
    const addUserBtn = document.getElementById('addUserBtn');
    const closeModalBtn = document.querySelector('.close');
    
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const closeDeleteModalBtn = document.getElementById('closeDeleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    let isEditMode = false;
    let editUserId = null;
    let deleteUserId = null;

    // Pagination variables
    let currentPage = 1;
    const rowsPerPage = 10;
    let totalUsers = 0;

    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <span class="close-btn">&times;</span>
        `;
        
        // Append toast to container
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove(); // Remove toast from DOM
            }, 500);
        }, 3000);
        
        // Close button event
        toast.querySelector('.close-btn').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        });
    }
    const loader = document.getElementById('loader');

    const showLoader = () => {
        loader.style.display = 'flex';
    };

    const hideLoader = () => {
        loader.style.display = 'none';
    };

    // Fetch and display users
    const fetchUsers = async () => {
        showLoader(); // Show loader before fetching
        try {
            const response = await fetch(`https://assignment-first-round.onrender.com/users?page=${currentPage}&limit=${rowsPerPage}`);
            const data = await response.json();
            console.log("Fetched Data:", data);

            if (Array.isArray(data.users)) {
                totalUsers = data.totalUsers;
                displayUsers(data.users);
                setupPagination();
            } else {
                console.error("Error: Expected an array but got", typeof data.users);
                showToast('Failed to fetch users. Please try again.', 'error');
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            showToast('Failed to fetch users. Please try again.', 'error');
        } finally {
            hideLoader(); // Hide loader after fetching
        }
    };

    const displayUsers = (users) => {
        console.log("Displaying users for page:", currentPage);

        userTable.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user._id}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.department}</td>
                <td class="actions">
                    <button class="edit-btn" onclick="editUser('${user._id}')">Edit</button>
                    <button class="delete-btn" onclick="confirmDeleteUser('${user._id}')">Delete</button>
                </td>
            `;
            userTable.appendChild(row);
        });
    };

    const setupPagination = () => {
        const totalPages = Math.ceil(totalUsers / rowsPerPage);
        console.log("Total Pages:", totalPages);

        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = 'pagination-btn';
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', () => {
                console.log("Page Button Clicked:", i);
                currentPage = i;
                fetchUsers();
            });
            paginationContainer.appendChild(pageBtn);
        }

        updatePaginationButtons(totalPages);
    };

    const updatePaginationButtons = (totalPages) => {
        console.log("Updating pagination buttons, Total Pages:", totalPages);

        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    };

    // Show add user form
    addUserBtn.addEventListener('click', () => {
        isEditMode = false;
        formTitle.textContent = 'Add User';
        userForm.reset();
        userFormModal.style.display = 'block';
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        userFormModal.style.display = 'none';
    });

    // Close delete confirmation modal
    closeDeleteModalBtn.addEventListener('click', () => {
        deleteConfirmationModal.style.display = 'none';
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmationModal.style.display = 'none';
    });

    // Save user
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            department: document.getElementById('department').value,
        };

        try {
            if (isEditMode) {
                // Edit user
                await fetch(`https://assignment-first-round.onrender.com/users/${editUserId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                });
                showToast('User updated successfully!', 'success');
            } else {
                // Add user
                await fetch('https://assignment-first-round.onrender.com/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                });
                showToast('User added successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            showToast('Failed to save user. Please try again.', 'error');
        }

        userFormModal.style.display = 'none';
        fetchUsers();
    });

    // Edit user
    window.editUser = async (id) => {
        try {
            const response = await fetch(`https://assignment-first-round.onrender.com/users/${id}`);
            const user = await response.json();

            isEditMode = true;
            editUserId = id;
            formTitle.textContent = 'Edit User';
            document.getElementById('firstName').value = user.firstName;
            document.getElementById('lastName').value = user.lastName;
            document.getElementById('email').value = user.email;
            document.getElementById('department').value = user.department;

            userFormModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching user details:', error);
            showToast('Failed to fetch user details. Please try again.', 'error');
        }
    };

    // Confirm delete user
    window.confirmDeleteUser = (id) => {
        deleteUserId = id;
        deleteConfirmationModal.style.display = 'block';
    };

    // Delete user
    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            if (deleteUserId) {
                await fetch(`https://assignment-first-round.onrender.com/users/${deleteUserId}`, {
                    method: 'DELETE',
                });
                showToast('User deleted successfully!', 'success');
                deleteConfirmationModal.style.display = 'none';
                fetchUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast('Failed to delete user. Please try again.', 'error');
        }
    });

    // Initial load
    fetchUsers();

    // Pagination buttons
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchUsers();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < Math.ceil(totalUsers / rowsPerPage)) {
            currentPage++;
            fetchUsers();
        }
    });
});
