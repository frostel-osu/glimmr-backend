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
                <td>${connection.is_deleted}</td>
            </tr>
        `).join("");
    }
};

// Read likes
const loadLikesTable = async () => {
    const likes = await fetchLikes();
    const tableBody = document.querySelector("#likes-table tbody")

    if (tableBody) {
        tableBody.innerHTML = likes.map(like => `
            <tr>
                <td>${like.name_user}</td>
                <td>${like.name_connection}</td>
                <td>${like.date}</td>
            </tr>
        `).join("");
    }
};


// Populate user dropdown for connections, likes
const populateUserDropDown = async () => {
    try {
        const users = await fetchUsers();
        const connections = await fetchConnections();

        const user = document.querySelector("#idUser"); // for create like
        const user1 = document.querySelector("#idUser1"); // for create connection
        const user2 = document.querySelector("#idUser2"); // for create connection
        const connection = document.querySelector("#idConnection"); // for create like

        // Populate user dropdown for likes/create.html
        if (user) {
            user.innerHTML = ""; 
            users.forEach(u => {
                const option = document.createElement("option");
                option.value = u.id_user;
                option.textContent = u.name;
                user.appendChild(option);
            });
            user.addEventListener("change", () => {
                updateConnectionsDropdown(user.value, connections);
            });

            updateConnectionsDropdown(user.value, connections);
        }

        // Populate user1 and user2 dropdowns for connections/create.html
        if (user1 && user2) {
            user1.innerHTML = "";
            user2.innerHTML = "";

            users.forEach(u => {
                const option1 = document.createElement("option");
                option1.value = u.id_user;
                option1.textContent = u.name;

                const option2 = document.createElement("option");

                user1.appendChild(option1);
                user2.appendChild(option2);
            });

            // Remove selected user1 from user2 dropdown
            user1.addEventListener("change", () => {
                const selectedUserId = user1.value;
                user2.innerHTML = "";

                users
                    .filter(u => u.id_user !== parseInt(selectedUserId)) // remove selected user
                    .forEach(u => {
                        const option = document.createElement("option");
                        option.value = u.id_user;
                        option.textContent = u.name;
                        user2.appendChild(option);
                    });
            });
        }

        // Populate connections dropdown for likes
        if (connection) {
            connection.innerHTML = "";
            connections.forEach(c => {
                const option = document.createElement("option");
                option.value = c.id_connection;
                option.textContent = `${c.name_connection}`;
                connection.appendChild(option);
            });
        }

    } catch (error) {
        console.error("Error loading dropdowns:", error);
    }
};


const updateConnectionsDropdown = (selectedUserId, connections) => {
    const submitButton = document.querySelector(".submit-button");
    const connection = document.querySelector("#idConnection");

    if (connection) {
        connection.innerHTML = "";

        const filteredConnections = connections.filter(c => 
            c.id_user_1 == selectedUserId || c.id_user_2 == selectedUserId
        );

        filteredConnections.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id_connection;
            option.textContent = `${c.name_connection}`;
            connection.appendChild(option);
            submitButton.disabled = false;
        });

        if (filteredConnections.length === 0) {
            const option = document.createElement("option");
            option.textContent = "This user does not have any connections.";
            option.disabled = true;
            option.selected = true;
            connection.appendChild(option);
            submitButton.disabled = true;
        }
    }
};

// Handle creating user
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#create-user");
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
                alert("Connection created successfully.")
                window.location.href = "read.html";
            } else {
                alert("Failed to create connection. Please try again.")
                console.error("Error creating user:", await response.json());
            }
        });
    }
});


// Handle creating connection
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#create-connection");
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const user1 = document.querySelector("#idUser1").value;
            const user2 = document.querySelector("#idUser2").value;

            const response = await fetch("/connections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_user_1: user1,
                    id_user_2: user2
                }),
            });

            if (response.ok) {
                alert("Connection created successfully.")
                window.location.href = "read.html";
            } else {
                alert("Failed to create connection. Please check if the connection satisfies the noted conditions and try again.")
                console.error("Error creating connection:", await response.json());
            }
        });
    }
});

// Handle creating like
document.addEventListener("DOMContentLoaded", () => {
    const likeForm = document.querySelector("#create-like");

    if (likeForm) {
        likeForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const user = document.querySelector("#idUser").value;
            const connection = document.querySelector("#idConnection").value;

            const response = await fetch("/likes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_user: user,
                    id_connection: connection
                }),
            });

            if (response.ok) {
                alert("Like created successfully.")
                window.location.href = "read.html";
            } else {
                alert("Failed to create like. Please check if the noted conditions are satisfied and try again.")
                console.error("Error creating like:", await response.json());
            }
        });
    }
});

// Handle creating message
document.addEventListener("DOMContentLoaded", () => {
    const messageForm = document.querySelector("#create-message");

    if (messageForm) {
        messageForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const user = document.querySelector("#idUser").value;
            const connection = document.querySelector("#idConnection").value;
            const text = document.querySelector("#text").value;

            const response = await fetch("/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_user: user,
                    id_connection: connection,
                    text: text
                }),
            });

            if (response.ok) {
                alert("Message created successfully.")
                window.location.href = "read.html";
            } else {
                alert("Failed to create message. Please check if the noted conditions are satisfied and try again.")
                console.error("Error creating message:", await response.json());
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

    if (document.querySelector("#idUser") || 
        document.querySelector("#idUser1") && document.querySelector("#idUser2") || 
        document.querySelector("#idConnection")) {
        populateUserDropDown();
    }
});