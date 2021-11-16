// Global variables
var namearray = "";
var foundname = "";
let signedin = true;

// Format check on qr input
function useRegex(input) {
    let regex = /^\d\d\d\d\d[a-zA-Z][a-zA-Z]$/;
    return regex.test(input);
}

// Read cookie from cookie name - returns cookie data
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Loads array from cookie
function loadarray() {
    if (getCookie("names") == "") {
        namearray = [
            ["Name", "Time"]
        ];

    } else {
        namearray = getCookie("names");
        namearray = JSON.parse(namearray);
    }
}

// I have no idea it just works???????!!!111???!1
function makeApiCall(qr, club) {
    var params = {
        // The ID of the spreadsheet to update.
        spreadsheetId: '1SK2oTjri2krTIZ6XglLbBrv4PqZM-OiGf3f_WovTEZ4',

        // The A1 notation of a range to search for a logical table of data.
        // Values will be appended after the last row of the table.
        range: club.concat('!A3:B3'),

        // How the input data should be interpreted.
        valueInputOption: 'USER_ENTERED',

        // How the input data should be inserted.
        insertDataOption: 'INSERT_ROWS',
    };
    var d = new Date();
    var n = d.toLocaleString('en-GB', { timeZone: 'UTC' });
    var signedin = false;
    var valueRangeBody = {

        "range": club + "!A3:B3",
        "majorDimension": "ROWS",
        "values": [
            [qr, n]
        ]
    };

    var request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
    request.then(function(response) {}, function(reason) {
        alert('error: ' + reason.result.error.message);
    });
}

// sign into google maybe?
function initClient() {
    var API_KEY = 'AIzaSyAm02zc16ma4fmsHi-a34Kcze0C9rc19wk';

    var CLIENT_ID = '36530272431-up5uj8q5psvs60fafqaah8cbhdoj99dm.apps.googleusercontent.com';

    var SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

    gapi.client.init({
        'apiKey': API_KEY,
        'clientId': CLIENT_ID,
        'scope': SCOPE,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function() {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

//?
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// are you signed in? thats a rhetorical question by the way
function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        document.getElementById("signin-button").style.display = "none";
        document.getElementById("clubLabel").style.display = "initial";
        document.getElementById("clubPicked").style.display = "initial";
        document.getElementById("cookiesconsent").style.display = "none";
        signedin = true;
    } else {
        document.getElementById("signedIn").innerHTML = "Signed out";
        document.getElementById("clubLabel").style.display = "none";
        document.getElementById("clubPicked").style.display = "none";
        document.getElementById("signout-button").style.display = "none";
        signedin = false;
    }
}

// signs you in probably
function handleSignInClick(event) {
    gapi.auth2.getAuthInstance().signIn();
    document.getElementById("signout-button").style.display = "initial";

}

// makes cookie mmmmmmmmmm
// also google gonna break cookies in 2023 good luck fixing this LLLLL
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// signs u out
function handleSignOutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
    document.getElementById("signin-button").style.display = "initial";
}

// function that adds data to spreadsheet 
// if u figure out what event is pls tell me
function addData(event) {
    var duplicate = false;
    var qr = foundname;

    namearray.forEach(function(namedate, index) {
        if (namedate.indexOf(qr) > -1) {
            duplicate = true;
        }
    });



    var qr = foundname;
    if (signedin == false) {
        alert("Not signed in")
    } else if (qr == "") {
        alert("No name found")
    } else if (document.getElementById("clubPicked").value == "none") {
        alert("No club selected")
    } else if (duplicate) {
        alert("QR already scanned today")
    } else if (useRegex(qr) == false) {
        alert("Invalid QR")
    } else {

        var clubHTML = document.getElementById("clubPicked");
        var club = clubHTML.value;
        makeApiCall(qr, club);
        var sound = new Howl({
            src: ["correct.wav"]
        }).play();
        namearray.push([qr, new Date().toLocaleTimeString()])
        updateTable(namearray)
        setCookie("names", JSON.stringify(namearray), 0.5)
    }

}

// instascan example code but i put it in a function 
function qrscanner() {
    var out = "";
    var scanner = new Instascan.Scanner({
        video: document.getElementById('preview'),
        scanPeriod: 5,
        mirror: false
    });
    scanner.addListener('scan', function(content) {
        // content = the found qr code
        out = content;
        foundname = out;
        addData();
    });
    Instascan.Camera.getCameras().then(function(cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
            if (cameras[0] != "") {
                scanner.start(cameras[0]);
            } else {
                alert('No Front camera found!');
            }

        } else {
            console.error('No cameras found.');
            alert('No cameras found.');
        }
    });
}

// make table thing from list
function updateTable(namearray) {
    document.getElementById("table").innerHTML = "";

    function makeTableHTML(myArray) {
        var result = "<table>";
        for (var i = 0; i < myArray.length; i++) {
            result += "<tr>";
            for (var j = 0; j < myArray[i].length; j++) {
                result += "<td>" + myArray[i][j] + "</td>";
            }
            result += "</tr>";
        }
        result += "</table>";

        return result;
    }

    tablediv = document.getElementById("table")
    var tablecontents = makeTableHTML(namearray);
    tablediv.insertAdjacentHTML('afterbegin', tablecontents);
}

// i forgor 💀
function clubspickermaker(data) {
    var sel = document.getElementById("clubPicked");
    for (var i = 0; i < clubs.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = clubs[i];
        opt.value = clubs[i];
        if (clubs[i] != ""){
        sel.appendChild(opt);
        }
    }
};

// runs program probably
qrscanner();
loadarray();
updateTable(namearray);
var clubs = "";
fetch('/clubs.txt')
    .then(response => response.text())
    .then((data) => {
        clubs = data.split("\n");
    })
    .then((data) => {
        clubspickermaker(clubs)
    })























































// bottom text
