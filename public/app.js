"use strict";

// Define functions globally
const loadView = async (view) => {
    switch (view) {
        case "users":
            await loadUsersView();
            break;
        case "create-user":
            loadCreateUserView();
            break;
    }
};

// Read users
const loadUsersView = async () => {
    const contentDiv = document.getElementById("content");
    const homeContent = document.getElementById("home-content");
    const homeNav = document.getElementById("home-nav");
    const hide = document.getElementById("hide")
    const users = await fetchUsers();

    if (homeContent) homeContent.style.display = "none";
    if (homeNav) homeNav.style.display = "none";
    if (hide) hide.style.display = "none"
    contentDiv.innerHTML = `
        <h2>Users List</h2>
        <button onclick="loadCreateUserView()">Add New User</button>
        <table id="users-table">
            <thead>
                <tr>
                <th></th>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date</th>
            </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td><button onclick="editUser(${user.id_user})">Edit</button></td>
                        <td><button onclick="deleteUser(${user.id_user})">Delete</button></td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone}</td>
                        <td>${user.date}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
};

// Add new user (form)
const loadCreateUserView = () => {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = `
        <h2>Add Glimmr User</h2>
        <form id="create-user-form">
            <legend><strong>Add New User</strong></legend>
            <fieldset class="fields">
                <label>Name</label>
                <input type="text" name="name" max="255" required>
        
                <label>Email</label>
                <input type="email" name="email" required>
        
                <label>Phone Number</label>
                <input type="text" name="phone" max="255" required>

                <button type="submit">Create</button>
                <button type="button" id="cancel-create">Cancel</button>
            </fieldset>
        </form>
    `;

    document.getElementById("create-user-form").addEventListener("submit", handleCreateUser);

    document.getElementById("cancel-create").addEventListener("click", () => {
        loadView("users");
    });
};

// Handle creating user
const handleCreateUser = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
    };

    const response = await fetch("/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    if (response.ok) {
        loadView("users");
    } else {
        console.error("Error creating user:", await response.json());
    }
};

// Handle deleting user
const deleteUser = async (id) => {
    try {
        const response = await fetch(`/users/${id}`);
        const user = await response.json();

        if (response.ok) {
            const deletePageHTML = `
                <form id="delete-user-form">
                    <legend><strong>Delete User</strong></legend>
                    <fieldset class="fields">
                        <p>Are you sure you wish to delete the following user?</p>
                        <input type="hidden" name="personID" id="deletepersonID" value="${user.id_user}">
                        <label> <strong>Name:</strong> </label> ${user.name}
                    </fieldset>
                    <button type="submit">Delete</button>
                    <button type="button" id="cancel-delete">Cancel</button>
                </form>
            `;

            const contentDiv = document.getElementById("content");
            contentDiv.innerHTML = deletePageHTML;

            document.getElementById("delete-user-form").addEventListener("submit", async (event) => {
                event.preventDefault();

                const deleteResponse = await fetch(`/users/${id}`, {
                    method: "DELETE",
                });

                if (deleteResponse.ok) {
                    loadView("users");
                } else {
                    console.error("Error deleting user:", await deleteResponse.json());
                }
            });

            document.getElementById("cancel-delete").addEventListener("click", () => {
                loadView("users");
            });
        } else {
            console.error("Error fetching user details:", user.error);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
};

const editUser = async (id) => {
    try {
        const response = await fetch(`/users/${id}`);
        const user = await response.json();

        if (response.ok) {
            const editPageHTML = `
                <h1>Update User</h1>
                <form id="edit-user-form">
                    <fieldset>
                        <legend>Edit User Details</legend>
                        <input type="hidden" name="id_user" id="updateUserID" value="${user.id_user}">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" value="${user.name}" required>
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" value="${user.email}" required>
                        <label for="phone">Phone:</label>
                        <input type="text" id="phone" name="phone" value="${user.phone}" required>
                    </fieldset>
                    <button type="submit">Save</button>
                    <button type="button" id="cancel-edit">Cancel</button>
                </form>
            `;

            const contentDiv = document.getElementById("content");
            contentDiv.innerHTML = editPageHTML;

            document.getElementById("edit-user-form").addEventListener("submit", async (event) => {
                event.preventDefault();

                const formData = new FormData(event.target);
                const updatedUser = {
                    name: formData.get("name"),
                    email: formData.get("email"),
                    phone: formData.get("phone"),
                };

                const updateResponse = await fetch(`/users/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedUser),
                });

                if (updateResponse.ok) {
                    loadView("users");
                } else {
                    console.error("Error updating user:", await updateResponse.json());
                }
            });

            document.getElementById("cancel-edit").addEventListener("click", () => {
                loadView("users");
            });
        } else {
            console.error("Error fetching user details:", user.error);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
};

// Fetch all users
const fetchUsers = async () => {
    const response = await fetch("/users");
    return await response.json();
};

document.addEventListener('DOMContentLoaded', () => {
    const usersLink = document.querySelector("a[href='#']");
    if (usersLink) {
        usersLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            loadView('users');
        });
    }
});
