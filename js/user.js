"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $loginForm.hide();
  $signupForm.hide();

}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}

/**Handling favorites */
async function handlingFavorites(e) {
  if (currentUser) {
      if ( e.target.id === "favorite-checkbox" && $(e.target).is(":checked")) {
        let favoritedStoryId = $(e.target).parent().attr('id');
        let token = currentUser.loginToken;
        let response = await axios.post(
          `https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${favoritedStoryId}`,
          {token})
    } else if (e.target.id === "favorite-checkbox" && (!$(e.target).is(":checked"))) {
        let unfavoritedStoryId = $(e.target).parent().attr('id');
        let token = currentUser.loginToken
        let response = await axios.delete(
          `https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${unfavoritedStoryId}`,
        {token})
  }}

 //console.log(favoriteStoryArr)
  
}
  
function showFavorites() {
  $('.submit-story').hide();
  $loginForm.hide();
  $signupForm.hide();
  $allStoriesList.empty();

  console.log(currentUser.favorites)

  if (currentUser.favorites.length !== 0) {
    for (let favoriteStory of currentUser.favorites) {
        const $story = generateStoryMarkup(favoriteStory);
        $allStoriesList.append($story);
      }
    } else {
      $("#all-stories-list").html("<p>No favorties added!</p>")
}
  }


  function showMystories() {
    $('.submit-story').hide();
    $loginForm.hide();
    $signupForm.hide();
    $allStoriesList.empty();

    console.log(storyList.stories)

    if (currentUser) {
      const myStories = storyList.stories.filter(story => story.username === currentUser.username)
      console.log(myStories)
        for (let myStory of myStories) {
          console.log(myStory)
          const $story = generateStoryMarkupForPersonalStories(myStory);
          $allStoriesList.append($story);
        }
      }
    else {
      $("#all-stories-list").html("<p>No stories created!</p>")
    }
  }

  function addPersonalStoryToLocalStorage(storyId) {
    let createdStory = JSON.parse(localStorage.getItem("createdstory")) || [];
    if (!createdStory.includes(storyId)) {
      //console.log(storyId)
      createdStory.push(storyId);
      //console.log(favorites);
      localStorage.setItem("createdstory", JSON.stringify(createdStory));
    } else {
      return;
    }
    
  }

  async function removeStory(e) {
    if (currentUser) {
      console.log(e.target.className)
      if (e.target.classList.contains("fa-trash-alt")) {
        let deletedStoryId = $(e.target).parent().parent().attr('id');
        let token = currentUser.loginToken;
        const response = await axios.delete(`https://hack-or-snooze-v3.herokuapp.com/stories/${deletedStoryId}`, {token})

        $allStoriesList.empty();
        showMystories();
      }
  }
}
  
$("#nav-favorites").on("click", showFavorites)
$("#nav-mystories").on("click", showMystories)
$allStoriesList.on("click", handlingFavorites)
$allStoriesList.on("click", removeStory)

