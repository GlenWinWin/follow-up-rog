const databases = {
    tab1: [
        {
            discipler: "",
            followedUp: "",
            id: 1736397338163,
            interested: "",
            name: "Imee Warde",
            started: "",
            texted: "",
            update: "",
        },
        {
            discipler: "",
            followedUp: "",
            id: 1736397338164,
            interested: "",
            name: "Carissa Traigo",
            started: "",
            texted: "",
            update: "",
        },
        {
            discipler: "",
            followedUp: "",
            id: 1736397338165,
            interested: "",
            name: "Catherine Quimpo",
            started: "",
            texted: "",
            update: "",
        },
        {
            discipler: "",
            followedUp: "",
            id: 1736397338166,
            interested: "",
            name: "Irene Destura",
            started: "",
            texted: "",
            update: "",
        },
        {
            discipler: "",
            followedUp: "",
            id: 1736397338167,
            interested: "",
            name: "Nerilyn Dela Cruz",
            started: "",
            texted: "",
            update: "",
        },
        {
            discipler: "",
            followedUp: "",
            id: 1736397338168,
            interested: "",
            name: "Meryl Dee",
            started: "",
            texted: "",
            update: "",
        },
    ],
    tab2: [],
    tab3: [],
    tab4: [],
    tab5: [],
};

let editState = {
    tab: null,
    id: null,
};

const saveButton = document.getElementById("saveModal");
console.log(saveButton); // Check if the button exists
if (saveButton) {
    saveButton.addEventListener("click", () => {
        const database = databases[editState.tab];
        const item = database.find((data) => data.id === editState.id);

        if (item) {
            // Update item with modal field values
            item.name = document.getElementById("modalName").value;
            item.interested = document.getElementById("modalInterested").value;
            item.discipler = document.getElementById("modalDiscipler").value;
            item.texted = document.getElementById("modalTexted").value;
            item.update = document.getElementById("modalUpdate").value;
            item.followedUp = document.getElementById("modalFollowedUp").value;
            item.started = document.getElementById("modalStarted").value;

            // Re-render the table
            renderTable(editState.tab);

            // Hide the modal
            const editModal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
            editModal.hide();
        }
    });
} else {
    console.error("Save button not found in the DOM!");
}

// Render table
function renderTable(tab) {
    const tableBody = document.querySelector(`#dataTable${tab.replace("tab", "")} tbody`);
    const database = databases[tab];

    tableBody.innerHTML = ""; // Clear table
    database.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="Name">${item.name}</td>
            <td data-label="Interested to Join">${item.interested}</td>
            <td data-label="Discipler">${item.discipler}</td>
            <td data-label="Texted">${item.texted}</td>
            <td data-label="Update">${item.update}</td>
            <td data-label="Followed Up">${item.followedUp}</td>
            <td data-label="Started One2One">${item.started}</td>
            <td data-label="Actions">
                <button class="btn edit" data-id="${item.id}">Edit</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}



// Edit functionality
function editData(tab, id) {
    const database = databases[tab];
    const item = database.find((data) => data.id === id);

    if (item) {
        // Populate modal fields
        document.getElementById("modalName").value = item.name || "";
        document.getElementById("modalInterested").value = item.interested || "";
        document.getElementById("modalDiscipler").value = item.discipler || "";
        document.getElementById("modalTexted").value = item.texted || "";
        document.getElementById("modalUpdate").value = item.update || "";
        document.getElementById("modalFollowedUp").value = item.followedUp || "";
        document.getElementById("modalStarted").value = item.started || "";

        // Save the tab and id for later
        editState = { tab, id };

        // Show the modal
        const editModal = new bootstrap.Modal(document.getElementById("editModal"));
        editModal.show();
    }
}


// Save updates
function saveData(tab) {
    const database = databases[tab];
    const form = document.getElementById(`dataForm${tab.replace("tab", "")}`);

    const item = database.find((data) => data.id === editState.id);
    if (item) {
        item.name = form.querySelector(`#name${tab.replace("tab", "")}`).value;
        item.interested = form.querySelector(`#interested${tab.replace("tab", "")}`).value;
        item.discipler = form.querySelector(`#discipler${tab.replace("tab", "")}`).value;
        item.texted = form.querySelector(`#texted${tab.replace("tab", "")}`).value;
        item.update = form.querySelector(`#update${tab.replace("tab", "")}`).value; // Handle textarea
        item.followedUp = form.querySelector(`#followedUp${tab.replace("tab", "")}`).value;
        item.started = form.querySelector(`#started${tab.replace("tab", "")}`).value;

        renderTable(tab); // Re-render the table with updated data
        form.reset(); // Reset form fields
        form.classList.add("hidden"); // Hide the form
        editState = { tab: null, id: null }; // Reset edit state
    }
}


// Tab switching logic
// Tab switching logic
document.querySelectorAll(".tab-button").forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
        const targetTab = tabButton.dataset.tab;

        // Remove active classes from all tab buttons
        document.querySelectorAll(".tab-button").forEach((btn) => {
            btn.classList.remove("active", "tab1-active", "tab2-active", "tab3-active", "tab4-active", "tab5-active");
        });

        // Add the active class for the selected tab
        tabButton.classList.add("active");
        if (targetTab === "tab1") tabButton.classList.add("tab1-active");
        if (targetTab === "tab2") tabButton.classList.add("tab2-active");
        if (targetTab === "tab3") tabButton.classList.add("tab3-active");
        if (targetTab === "tab4") tabButton.classList.add("tab4-active");
        if (targetTab === "tab5") tabButton.classList.add("tab5-active");

        // Show active tab content
        document.querySelectorAll(".tab-content").forEach((tabContent) => {
            tabContent.classList.remove("active");
        });
        document.getElementById(targetTab).classList.add("active");

        // Render table for the selected tab
        renderTable(targetTab);
    });
});

// Attach edit handlers to all tables
Object.keys(databases).forEach((tab) => {
    const table = document.querySelector(`#dataTable${tab.replace("tab", "")}`);
    table.addEventListener("click", (event) => {
        if (event.target.classList.contains("edit")) {
            const id = parseInt(event.target.dataset.id, 10);
            editData(tab, id);
        }
    });

    const form = document.getElementById(`dataForm${tab.replace("tab", "")}`);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        saveData(tab);
    });

    renderTable(tab); // Initial render
});
