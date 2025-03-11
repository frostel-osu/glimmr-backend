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
                <td><a href="update.html?id=${connection.id_connection}">Edit</a></td>
                <td><a href="delete.html?id=${connection.id_connection}">Delete</a></td>
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


// Populate user dropdown for connections, likes, messages
const populateUserDropDown = async () => {
    try {
        const users = await fetchUsers();
        const connections = await fetchConnections();

        const user = document.querySelector("#idUser"); // for create like
        const user1 = document.querySelector("#idUser1"); // for create/edit connection
        const user2 = document.querySelector("#idUser2"); // for create/edit connection
        const isDeleted = document.querySelector("#isDeleted"); // for edit connection
        const connection = document.querySelector("#idConnection"); // for create like

        // Populate user dropdown for likes and messages
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

        // Populate connections dropdown for likes and messages
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

// Update user2 dropdown menu to exclude user1 after choosing user1
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
    const form = document.querySelector("#create-like");

    if (form) {
        form.addEventListener("submit", async (event) => {
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
    const form = document.querySelector("#create-message");

    if (form) {
        form.addEventListener("submit", async (event) => {
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

// Handle updating user
document.addEventListener("DOMContentLoaded", async () => {
    const updateUserForm = document.querySelector("#update-user");

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");  // get the user ID from the URL

    if (userId) {
        try {
            // fetch user's data
            const response = await fetch(`/users/${userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const user = await response.json();
            // prepopulate form fields with user's info
            document.querySelector("#name").value = user.name;
            document.querySelector("#email").value = user.email;
            document.querySelector("#phone").value = user.phone;

            // handle form submission
            if (updateUserForm) {
                updateUserForm.addEventListener("submit", async (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.target);
                    const updatedUserData = Object.fromEntries(formData.entries());

                    const updateResponse = await fetch(`/users/${userId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedUserData),
                    });

                    if (updateResponse.ok) {
                        alert("User updated successfully.");
                        window.location.href = "read.html";
                    } else {
                        alert("Failed to update user. Please try again.");
                        console.error("Error updating user:", await updateResponse.json());
                    }
                });
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    }
});


// Handle updating connection
document.addEventListener("DOMContentLoaded", async () => {
    const updateConnectionForm = document.querySelector("#update-connection");
    
    const urlParams = new URLSearchParams(window.location.search);
    const connectionId = urlParams.get("id");  // get the user ID from the URL

    if (connectionId) {
        try {
            // fetch connection's data
            const response = await fetch(`/connections/${connectionId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const connection = await response.json();

            // prepopulate dropdown menu
            await populateUserDropDown();

            // prepopulate form fields with connection's info
            const idUser1 = document.querySelector("#idUser1");
            const idUser2 = document.querySelector("#idUser2");
            const isDeleted = document.querySelector("#isDeleted");
            if (isDeleted) {
                isDeleted.checked = connection.is_deleted === 1 || connection.is_deleted === "true";
            }

            if (idUser1 && idUser2) {
                idUser1.value = connection.id_user_1;
                idUser1.dispatchEvent(new Event('change'));

                // wait for the dropdown to update user2
                setTimeout(() => {
                    idUser2.value = connection.id_user_2;
                }, 100);             

                // trigger change event to update user2 dropdown
                idUser1.dispatchEvent(new Event('change'));
            }

            // handle form submission
            if (updateConnectionForm) {
                updateConnectionForm.addEventListener("submit", async (event) => {
                    event.preventDefault();
                    const user1 = document.querySelector("#idUser1").value;
                    const user2 = document.querySelector("#idUser2").value;
                    const isDeleted = document.querySelector("#isDeleted").checked;

                    const updateResponse = await fetch(`/connections/${connectionId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id_user_1: user1,
                            id_user_2: user2,
                            is_deleted: isDeleted
                        }),
                    });

                    if (updateResponse.ok) {
                        alert("Connection updated successfully.");
                        window.location.href = "read.html";
                    } else {
                        alert("Failed to update connection. Please try again.");
                        console.error("Error updating connection:", await updateResponse.json());
                    }
                });
            }
        } catch (error) {
            console.error("Error loading connection data:", error);
        }
    }
});


// Handle deleting user
document.addEventListener("DOMContentLoaded", async () => {
    const deleteUserForm = document.querySelector("#delete-user");
    const deleteName = document.querySelector("#delete-name"); 
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");

    try {
        const response = await fetch(`/users/${userId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }
        const user = await response.json();

        // show user's name for confirmation
        if (deleteName) {
            deleteName.textContent = `Name: ${user.name}`;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }

    // handle delete form submission
    if (deleteUserForm) {
        deleteUserForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                const deleteResponse = await fetch(`/users/${userId}`, { method: "DELETE" });

                if (deleteResponse.ok) {
                    alert("User deleted successfully.");
                    window.location.href = "read.html";
                } else {
                    alert("Failed to delete user. Please try again.");
                    console.error("Error deleting user:", await deleteResponse.json());
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("An error occurred while deleting the user.");
            }
        });
    }
});

// Handle deleting connection
document.addEventListener("DOMContentLoaded", async () => {
    const deleteConnectionForm = document.querySelector("#delete-connection");
    const connectionNames = document.querySelector("#connection-names");
    const urlParams = new URLSearchParams(window.location.search);
    const connectionId = urlParams.get("id");

    try {
        const response = await fetch(`/connections/${connectionId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch connection data");
        }
        const connection = await response.json();

        // show users' name for confirmation
        if (connectionNames) {
            connectionNames.textContent = connection.name_connection
        }
    } catch (error) {
        console.error("Error fetching connection data:", error);
    }

    // handle delete form submission
    if (deleteConnectionForm) {
        deleteConnectionForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                const deleteResponse = await fetch(`/connections/${connectionId}`, { method: "DELETE" });

                if (deleteResponse.ok) {
                    alert("Connection deleted successfully.");
                    window.location.href = "read.html";
                } else {
                    alert("Failed to delete connection. Please try again.");
                    console.error("Error deleting connection:", await deleteResponse.json());
                }
            } catch (error) {
                console.error("Error deleting connection:", error);
                alert("An error occurred while deleting the connection.");
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