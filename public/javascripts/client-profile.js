$(document).ready(() => {

  /***************************************
   * Init
   ****************************************/

  isLoggedIn();

  //TODO: make global scope var for http://" + window.location.host + "/profile/"

  /***************************************
   * CRUD frontend interactions
   ****************************************/

  $("form").on('submit', (e) => {
    e.preventDefault();

    let username = $("#username").val();
    let employeeID = $("#employee-id").val();
    let password = $("#password").val();

    let userCredentials = {username: username, employee_id: employeeID, password: password};

    if (event.submitter.id === "signup-button")
      initSignup(userCredentials);
    else if (event.submitter.id === "login-button")
      initLogin(userCredentials);
  });

  $("#logout-button").on("click", () => {
    initLogOut();
  });

  $("#reset-password").on("click", () => {
    initPasswordReset();
  });

  $("#change-employee-id").on("click", () => {
    let employeeID = parseInt($("#employee-id-input").val());
    let email = $("#email-field").find("span").text();
    setEmployeeID({id: employeeID, email: email});
  });

  $("#refresh-list").on("click", function () {
    let empID = $("#employee-id-field").find("span").text()

    if (empID === "unset"){
      handleModal("There is no Employee ID linked to this user. Please set your Employee ID before loading sales");
    } else {
      getAllSalesForEmployee({id: empID});
    }
  });

  function handleModal(message) {
    let modal = $("#response-modal");
    modal.find(".modal-body").text(message);
    modal.modal('toggle'); // object.Modal is Bootstrap js namespace for accessing modal functions
  }

  function populateTable(response) {
    let tableBody = $("table").find("tbody");

    // Empty previous data
    tableBody.html("");

    // Populate data
    for (let i = 0; i < response.length; i++) {
      let row = `<tr><td>${response[i].carmodel_id}</td><td>${response[i].sale_id}</td><tr>`;
      tableBody.append(row);
    }

  }

  /***************************************
   * HTTP requests and related functions
   ****************************************/

  function isLoggedIn() {
    $.ajax({
      url: "http://" + window.location.host + "/profile/", // In prod env, change url
      method: 'GET',
      contentType:"application/json",
      success: (response) => handleAuthState(response),
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseText != null){
          handleModal(JSON.parse(jqXHR.responseText));
        } else {
          handleModal("Unexpected error. Try again");
        }
      }});
  }

  function initSignup(userCredentials){
    $.ajax({
      url: "http://" + window.location.host + "/profile/signup", // In prod env, change url
      method: 'POST',
      data: JSON.stringify(userCredentials),
      contentType: "application/json",
      dataType: "json",
      success: (user) => onLoggedIn(user), //TODO: change to response.user
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseText != null){
          handleModal(JSON.parse(jqXHR.responseText));
        } else {
          handleModal("Unexpected error. Try again");
        }
      }});
  }

  // THIS WILL LOG IN USER BUT FAILS TO CALL ONLOGGEDIN PROPERLY
  // TODO: fix
  function initLogin(userCredentials){
    $.ajax({
      url: "http://" + window.location.host + "/profile/login", // In prod env, change url
      method: 'POST',
      data: JSON.stringify(userCredentials),
      contentType:"application/json",
      success: (user) => onLoggedIn(user),
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseText != null){
          handleModal(JSON.parse(jqXHR.responseText));
        } else {
          handleModal("Unexpected error. Try again");
        }
      }});
  }

  function initLogOut() {
    $.ajax({
      url: "http://" + window.location.host + "/profile/logout", // In prod env, change url
      method: 'POST',
      contentType: "application/json",
      success: (response) => onLoggedOut(response),
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseText != null){
          handleModal(JSON.parse(jqXHR.responseText));
        } else {
          handleModal("Unexpected error. Try again");
        }
      }});
  }

  function initPasswordReset() {
    $.ajax({
      url: "http://" + window.location.host + "/profile/reset-password", // In prod env, change url
      method: 'GET',
      success: handleModal("Mail has been sent."), //TODO: display modal with "successfull" if response === "OK"
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseText != null){
         // handleModal(JSON.parse(jqXHR.responseText));
        } else {
          handleModal("Unexpected error. Try again");
        }
      }
    });
  }

  function setEmployeeID(empInfo){
    $.ajax({
      url: "http://" + window.location.host + "/profile/set-employee-id", // In prod env, change url
      method: 'POST',
      data: JSON.stringify(empInfo),
      dataType: "json",
      contentType: "application/json",
      success: (userInfo) => isLoggedIn(userInfo),
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseText != null) {
          handleModal(JSON.parse(jqXHR.responseText));
        } else {
          handleModal("Unexpected error. Try again");
        }
      }
    });

  }

  function getAllSalesForEmployee(employeeID) {
    $.ajax({
      url:  `http://${window.location.host}/profile/sales-for-employee`,
      method: 'POST',
      data: JSON.stringify(employeeID),
      dataType: "json",
      contentType: "application/json",
      success: (response) => populateTable(response),
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseText != null) {
          //handleModal(JSON.parse(jqXHR.responseText));
          console.log(jqXHR.responseText);
        } else {
          handleModal("Unexpected error. Try again");
        }
      }
    });

  }

  function handleAuthState(response) {
    if (response.result){
      onLoggedIn(response.user);
    } else if (!response.result){
      onLoggedOut();
    }
  }

  function onLoggedIn(user) {

    $("#authed-container").removeClass("d-none");
    $("#not-authed-container").addClass("d-none");

    // If user.id !null (if user hasnt linked empid to their profile yet)
    if (user.id){
      $("#email-field").find("span").text(user.email);
      $("#employee-id-field").find("span").text(user.id);
      $("#name-field").find("span").text(user.name);

      $("#set-employee-id").addClass("d-none");

      getAllSalesForEmployee(user.id);

    } else {
      $("#email-field").find("span").text(user.email);
      $("#employee-id-field").find("span").text("unset");
      $("#name-field").find("span").text("unset");

      $("#set-employee-id").removeClass("d-none");
    }

  }

  function onLoggedOut() {
    $("#authed-container").addClass("d-none");
    $("#not-authed-container").removeClass("d-none");
  }


});
