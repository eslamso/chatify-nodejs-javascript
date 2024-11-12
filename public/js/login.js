//const http = require("http");
const logInForm = document.querySelector(".login-form");
const loginButton = document.querySelector(".btn");
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
console.log(loginButton);
loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  axios
    .post("http://localhost:3000/api/v1/auth/login", {
      email: email,
      password: password,
    })
    .then(function (response) {
      //localStorage.setItem("Token", response.data.token);
      localStorage.setItem(
        "currentUserName",
        response.data.user.firstName + response.data.user.lastName
      );
      localStorage.setItem("currentUserId", response.data.user._id);

      //console.log(response.data);
      //console.log(this);
      //window.location.href = "groupPosts.html";
      window.location.href = "./../chat.html";
    })

    .catch(function (error) {
      alert(error.response.data.message);
      console.log(error.response.data.message);
    });
});
