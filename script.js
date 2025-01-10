// Constants for Google API
const CONFIG = {
    API_KEY: "AIzaSyAhVwHSDKNFqhLcERQPWXXQrWTezS9mmmI",
    SPREADSHEET_ID: "1Ta9OsOKkrydSdtnSN-HUjEcUMevgboc1mlzmlDZX1_U",
    CLIENT_ID: "653073386096-flq5n7ukan8cs2rtla2cgg9cm3aphl22.apps.googleusercontent.com",
    SHEET_NAME: "JANUARY"
};

const CATEGORIES = ["XO", "YA", "WOMEN", "MEN", "SEASONED"];

// State management
const state = {
    databases: {
        tab1: [], tab2: [], tab3: [], tab4: [], tab5: []
    },
    editState: {
        tab: null,
        id: null
    },
    arrayDetails: null,
    isAuthenticated: false
};

function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    const userObject = parseJwt(response.credential);
    state.userData = userObject;
    state.isAuthenticated = true;
    console.log("User Info:", userObject);
    getData("tab1");
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

async function getData(targetTab) {
    try {
        if (!state.arrayDetails) {
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAME}?key=${CONFIG.API_KEY}`
            );
            const data = await response.json();
            state.arrayDetails = data.values;
        }
        populateTable(parseInt(targetTab.replace("tab", "")) - 1, targetTab);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function populateTable(index, targetTab) {
    const result = findIndicesByText(state.arrayDetails, CATEGORIES);
    const start = result[index] + 1;
    const end = index === 4 ? state.arrayDetails.length - 1 : result[index + 1] - 1;

    const tableBody = document.querySelector(`#dataTable${targetTab.replace("tab", "")} tbody`);
    tableBody.innerHTML = "";

    const tabData = [];

    for (let i = start; i <= end; i++) {
        const row = state.arrayDetails[i];
        if (!row[3]?.trim()) break;

        const rowData = {
            id: i,
            name: row[3],
            interested: row[9],
            discipler: row[10],
            texted: row[11],
            update: row[12] ?? "",
            followedUp: row[13] ?? "",
            started: row[14] ?? ""
        };

        appendTableRow(tableBody, rowData);
        tabData.push(rowData);
    }

    state.databases[targetTab] = tabData;
}

function appendTableRow(tableBody, data) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td data-label="Name">${data.name}</td>
        <td data-label="Interested to Join">${data.interested}</td>
        <td data-label="Discipler">${data.discipler}</td>
        <td data-label="Texted">${data.texted}</td>
        <td data-label="Update">${data.update}</td>
        <td data-label="Followed Up">${data.followedUp}</td>
        <td data-label="Started One2One">${data.started}</td>
        <td data-label="Actions">
            <button class="btn edit" data-id="${data.id}">Edit</button>
        </td>
    `;
    tableBody.appendChild(row);
}

async function updateRow(id, values) {
    if (!state.isAuthenticated) {
        console.error("Authentication required");
        return;
    }

    const range = `${CONFIG.SHEET_NAME}!D${id + 1}:O${id + 1}`;
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${range}?valueInputOption=RAW`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${state.userData.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [values]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update row');
        }

        console.log("Row updated successfully");
    } catch (error) {
        console.error("Error updating row:", error);
    }
}

function handleEditClick(tab, id) {
    const item = state.databases[tab].find(data => data.id === id);
    if (!item) return;

    state.editState = { tab, id };

    // Populate modal fields
    ["name", "interested", "discipler", "texted", "update", "followedUp", "started"].forEach(field => {
        document.getElementById(`modal${field.charAt(0).toUpperCase() + field.slice(1)}`).value = item[field] || "";
    });

    const editModal = new bootstrap.Modal(document.getElementById("editModal"));
    editModal.show();
}

function findIndicesByText(array, searchTexts) {
    return array.reduce((indices, row, index) => {
        if (row.some(cell => searchTexts.includes(cell))) {
            indices.push(index);
        }
        return indices;
    }, []);
}

function handleTabClick(event) {
    const targetTab = event.target.dataset.tab;
    if (!targetTab) return;

    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("active", "tab1-active", "tab2-active", "tab3-active", "tab4-active", "tab5-active");
    });

    event.target.classList.add("active", `${targetTab}-active`);

    document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.remove("active");
    });
    document.getElementById(targetTab).classList.add("active");

    getData(targetTab);
}

function init() {
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", handleTabClick);
    });

    document.getElementById("saveModal").addEventListener("click", async () => {
        try {
            const { tab, id } = state.editState;
            const item = state.databases[tab].find(data => data.id === id);
            if (!item) return;

            ["name", "interested", "discipler", "texted", "update", "followedUp", "started"].forEach(field => {
                item[field] = document.getElementById(`modal${field.charAt(0).toUpperCase() + field.slice(1)}`).value;
            });

            await updateRow(id, [
                item.name, 'G', 'G', 'G', 'G', 'G', item.interested, item.discipler, item.texted,
                item.update, item.followedUp, item.started
            ]);

            populateTable(parseInt(tab.replace("tab", "")) - 1, tab);
            bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
        } catch (error) {
            console.error("Error saving changes:", error);
            alert("Failed to save changes. Please try again.");
        }
    });

    Object.keys(state.databases).forEach(tab => {
        const table = document.querySelector(`#dataTable${tab.replace("tab", "")}`);
        table.addEventListener("click", event => {
            if (event.target.classList.contains("edit")) {
                handleEditClick(tab, parseInt(event.target.dataset.id, 10));
            }
        });
    });
}

// Start the application
document.addEventListener('DOMContentLoaded', init);