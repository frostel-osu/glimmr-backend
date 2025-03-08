"use strict";

// Fetch all users
const fetchUsers = async () => {
    const response = await fetch("/users");
    return await response.json();
};

// Fetch all messages
const fetchMessages = async () => {
    const response = await fetch("/messages");
    return await response.json();
};

// Fetch all likes
const fetchLikes = async () => {
    const response = await fetch("/likes");
    return await response.json();
}

// Fetch all connections
const fetchConnections = async () => {
    const response = await fetch("/connections");
    return await response.json();
}

// Read users
const loadUsersTable = async () => {
    const users = await fetchUsers();
    const tableBody = document.querySelector("#users-table tbody")

    if (tableBody) {
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td><a href="update.html?id=${user.id_user}">Edit</a></td>
                <td><a href="delete.html?id=${user.id_user}">Delete</a></td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.date}</td>
            </tr>
        `).join("");
    }
};

// Read messages
const loadMessagesTable = async () => {
    const messages = await fetchMessages();
    const tableBody = document.querySelector("#messages-table tbody")

    if (tableBody) {
        tableBody.innerHTML = messages.map(message => `
            <tr>
                <td>${message.name_user}</td>
                <td>${message.name_connection}</td>
                <td>${message.date}</td>
                <td>${message.text}</td>
            </tr>
        `).join("");
    }
};

// Read connections
const loadConnectionsTable = async () => {
    const connections = await fetchConnections();
    const tableBody = document.querySelector("#connections-table tbody")

    if (tableBody) {
        tableBody.innerHTML = connections.map(connection => `
            <tr>
                <td><a href="update.html?id=${connection.id_user}">Edit</a></td>
                <td><a href="delete.html?id=${connection.id_user}">Delete</a></td>
                <td>${connection.name_user_1}</td>
                <td>${connection.name_user_2}</td>
                <td>${connection.date}</td>
            </tr>
        `).join("");
    }
};


// Handle creating entity (general event handler for all entities' submit button)
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".create-form");
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const userData = Object.fromEntries(formData.entries());

            const response = await fetch("/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                window.location.href = "read.html";
            } else {
                console.error("Error creating user:", await response.json());
            }
        });
    }
});

// Load content
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#messages-table")) {
        loadMessagesTable();
    };
    
    if (document.querySelector("#users-table")) {
        loadUsersTable();
    };

    if (document.querySelector("#connections-table")) {
        loadConnectionsTable();
    };

    if (document.querySelector("#likes-table")) {
        loadLikesTable();
    };
});