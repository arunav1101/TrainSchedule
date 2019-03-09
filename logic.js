// Initialize Firebase
var config = {
  apiKey: "AIzaSyCkfEPM3JtvhZLK7IBaj1W9LD2sqYeA7z0",
  authDomain: "trainschedule-9decc.firebaseapp.com",
  databaseURL: "https://trainschedule-9decc.firebaseio.com",
  projectId: "trainschedule-9decc",
  storageBucket: "trainschedule-9decc.appspot.com",
  messagingSenderId: "300525556900"
};
firebase.initializeApp(config);

var database = firebase.database();

var trainName = "";
var destination = "";
var firstTrainTime = "";
var frequency = "";
var totalMonths = "";
var tBill = "";
var newEmpId = 0;
var nextArrival = "";
var tMinutesTillTrain = "";
// https://geo.ipify.org/api/v1?apiKey=at_Pb7FV6dZK5vdPrhUA6qpjN2JnRoj7&ipAddress=207.98.72.251
async function getSystemDetails() {
  let promise = getUserIp().then(res2 => {
    let sysDetails = $.getJSON(`https://geo.ipify.org/api/v1?apiKey=at_Pb7FV6dZK5vdPrhUA6qpjN2JnRoj7&ipAddress=${res2.ip}`,
      function(data) {
        return data;
      }
    );
    return sysDetails;
  });
  return await promise;
}

async function getUserIp() {
  let promise = $.getJSON("https://api.ipify.org?format=json", function(res) {
    return res;
  });
  console.log("getUserIp", promise);
  return await promise;
}

function nextTime(firstTime) {
  var firstTimeConverted = moment(firstTime, "HH:mm");
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  var tRemainder = diffTime % frequency;
  tMinutesTillTrain = frequency - tRemainder;
  var nextTrain = moment().add(tMinutesTillTrain, "minutes");
  nextArrival = moment(nextTrain).format("hh:mm");
  return;
}

function updateTime() {
  database.ref().on("value", function(snapshot) {
    snapshot.forEach(function(child) {
      frequency = child.val().frequency;
      nextTime(child.val().firstTrainTime);
      $(`#${child.val().name.replace(/\s/g, "")}`).empty();
      $(`#${child.val().name.replace(/\s/g, "")}`).append(`<td>${child.val().name}</td>
                     <td>${child.val().destination}</td>
                     <td>${child.val().frequency}</td>
                     <td id="nextArrival">${nextArrival}</td>
                     <td id="minsAway">${tMinutesTillTrain}</td>
                     <td><button type="button" class="btn btn-dark table-hover" id=delete>Delete</button></td>`);
    });
  });
}

setInterval(function() {
  updateTime();
}, 1000 * 10);

updateTime();

$(document.body).on("click", "#delete", function(event) {
  event.preventDefault();
  let delValue = $(this).parents()[1].id;
  database.ref().on("value", function(snapshot) {
    snapshot.forEach(function(child) {
      let dbValue = child.val().name.replace(/\s/g, "");
      if (dbValue === delValue) {
        database
          .ref()
          .child(child.key)
          .remove();
        location.reload();
      }
    });
  });
});

$("#addButton").on("click", function(event) {
    let validateYear = false;
  event.preventDefault();
  validateYear = $('#trainName').val().match(/^$/g);
  if (validateYear) alert("trainName is mandate");

  trainName = $("#trainName").val().trim();
  
  validateYear = $('#destination').val().match(/^$/g);
  if (validateYear) alert("destination is mandate");
  destination = $("#destination").val().trim();

  validateYear = $('#firstTrainTime').val().match(/^$/g);
  if (validateYear) alert("firstTrainTime is mandate");
  firstTrainTime = $("#firstTrainTime").val().trim();

  validateYear = $('#frequency').val().match(/^$/g);
  if (validateYear) alert("frequency is mandate");
  frequency = $("#frequency").val().trim();

  nextTime(firstTrainTime);
  getSystemDetails().then(data => {
    console.log("during getUserIp in firebase ", data);
    database.ref().push({
      name: trainName,
      destination: destination,
      firstTrainTime: firstTrainTime,
      frequency: frequency,
      nextArrival: nextArrival,
      minsAway: tMinutesTillTrain,
      systemDetails: data
    });
  });
});

database.ref().on("child_added", function(snapshot) {
  $("#tableData").append(`<tr id=${snapshot.val().name.replace(/\s/g, "")}>
                    <td>${snapshot.val().name}</td>
                    <td>${snapshot.val().destination}</td>
                    <td>${snapshot.val().frequency}</td>
                    </tr>
                    `);
});
