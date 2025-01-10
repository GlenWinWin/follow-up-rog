const databases = {
    tab1: [],
    tab2: [],
    tab3: [],
    tab4: [],
    tab5: [],
};

let editState = {
    tab: null,
    id: null,
};

let arrayDetails;

const API_KEY = "AIzaSyAhVwHSDKNFqhLcERQPWXXQrWTezS9mmmI";
const SPREADSHEET_ID = "1Ta9OsOKkrydSdtnSN-HUjEcUMevgboc1mlzmlDZX1_U";

getData("tab1");

const saveButton = document.getElementById("saveModal");
if (saveButton) {
    saveButton.addEventListener("click", async () => {
        const database = databases[editState.tab];
        const item = database.find((data) => data.id === editState.id);

        if (item) {
            // Update local data
            item.name = document.getElementById("modalName").value;
            item.interested = document.getElementById("modalInterested").value;
            item.discipler = document.getElementById("modalDiscipler").value;
            item.texted = document.getElementById("modalTexted").value;
            item.update = document.getElementById("modalUpdate").value;
            item.followedUp = document.getElementById("modalFollowedUp").value;
            item.started = document.getElementById("modalStarted").value;

            // Update Google Sheets
            const sheetRange = `JANUARY!D${editState.id + 1}:O${editState.id + 1}`; // Update the row range dynamically
            const updatedValues = [
                item.name,
                item.interested,
                item.discipler,
                item.texted,
                item.update,
                item.followedUp,
                item.started,
            ];

            // await updateRow(SPREADSHEET_ID, sheetRange, updatedValues, API_KEY);

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

// Function to update a row in Google Sheets
async function updateRow(sheetId, range, values, apiKey) {
    const URL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    const requestBody = {
        range: range, // Example: "Sheet1!A2:G2"
        values: [values], // Replace with your updated row values
    };

    try {
        const response = await fetch(URL, {
            method: "PUT", // Use PUT for updating rows
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Row updated successfully:", data);
        } else {
            console.error("Failed to update row:", await response.text());
        }
    } catch (error) {
        console.error("Error updating row:", error);
    }
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
        getData(targetTab);

        // renderTable(targetTab);
    });
});

// Fetch and populate data
function getData(targetTab) {
    let RANGE = "JANUARY";
    let index = parseInt(String(targetTab).replace("tab", "")) - 1;

    let URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    if (arrayDetails !== undefined) {
        populateTable(index, targetTab);
    } else {
        fetch(URL)
            .then((res) => res.json())
            .then((data) => {
                arrayDetails = data.values;
                populateTable(index, targetTab);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }
}

function populateTable(index, targetTab) {
    console.log(index, targetTab);
    const searchTexts = ["XO", "YA", "WOMEN", "MEN", "SEASONED"];
    const result = findIndicesByText(arrayDetails, searchTexts);

    const start = result[index] + 1;
    const end = index == 4 ? arrayDetails.length - 1 : result[index + 1] - 1;

    const tableBody = document.querySelector(`#dataTable${targetTab.replace("tab", "")} tbody`);
    tableBody.innerHTML = ""; // Clear table
    let tabData = [];
    for (var i = start; i <= end; i++) {
        if (String(arrayDetails[i][3]).trim() !== "") {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td data-label="Name">${arrayDetails[i][3]}</td>
            <td data-label="Interested to Join">${arrayDetails[i][9]}</td>
            <td data-label="Discipler">${arrayDetails[i][10]}</td>
            <td data-label="Texted">${arrayDetails[i][11]}</td>
            <td data-label="Update">${arrayDetails[i][12] ?? ""}</td>
            <td data-label="Followed Up">${arrayDetails[i][13] ?? ""}</td>
            <td data-label="Started One2One">${arrayDetails[i][14] ?? ""}</td>
            <td data-label="Actions">
                <button class="btn edit" data-id="${i}">Edit</button>
            </td>
        `;
            tableBody.appendChild(row);

            tabData.push({
                "id": i,
                "name": arrayDetails[i][3],
                "interested": arrayDetails[i][9],
                "discipler": arrayDetails[i][10],
                "texted": arrayDetails[i][11],
                "update": arrayDetails[i][12],
                "followedUp": arrayDetails[i][13],
                "started": arrayDetails[i][14]
            })
        } else {
            break;
        }
    }

    databases[targetTab] = tabData;
}

function findIndicesByText(jsonArray, searchTexts) {
    const indices = [];
    jsonArray.forEach((row, index) => {
        if (row.some((cell) => searchTexts.includes(cell))) {
            indices.push(index);
        }
    });
    return indices;
}

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
