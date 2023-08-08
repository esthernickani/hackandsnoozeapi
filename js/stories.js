"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let myCreatedStories = [];
/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
let currentStoryindex = 0;
function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  
  return $(`
      <li id="${story.storyId}" class="individual-story">
        <i class="${starType(story)} favorite"></i>
        <div class="storyinfo">
          <div class="titleandurl">
            <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
            </a>
            <small class="story-hostname">(${hostName})</small>
          </div>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}

function generateStoryMarkupForPersonalStories(story) {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <button class="delete-button">
        <i class="fas fa-trash-alt"></i>
        </button>
        <span class="star">
        <i class="${starType(story)}"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
      `);
}

const starType = (currentStory) => {
  const favoriteIdArr = currentUser.favorites.map(story => story.storyId)
  if(currentUser.favorites.length !== 0 && favoriteIdArr.includes(currentStory.storyId)) {
    return "fas fa-star"
  } else {
    return "far fa-star"
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**When the user submits */

async function createStory(e) {
  e.preventDefault();

  if (currentUser) {

    let author = $( "#author" ).val()
    let title = $( "#title" ).val()
    let url = $( "#url" ).val()

    const newStory = await storyList.addStory(currentUser, { author, title, url });
    generateStoryMarkup(newStory);

    $("form").addClass("hidden");
    $allStoriesList.prepend(newStory);


    $( "#author" ).val('') 
    $( "#title" ).val('') 
    $( "#url" ).val('') 

    $("form").removeClass("hidden");
  }

}

async function removeStory(e) {
  if (currentUser) {
    console.log(e.target.className)
    if (e.target.classList.contains("fa-trash-alt")) {
      let deletedStoryId = $(e.target).parent().parent().attr('id');

      console.log(deletedStoryId, currentUser.loginToken)
      
      await storyList.deleteStory(deletedStoryId, currentUser);

      $allStoriesList.empty();
      showMystories();
    }
}
}

$allStoriesList.on("click", removeStory)
$("form").on( "submit", createStory);


/**Handling favorites */
async function handlingFavorites(e) {
  if (currentUser) {
      if ( e.target.classList.contains("far")) {
        console.log('click')
        console.log(e.target.className)
        
        let favoritedStoryId = $(e.target).parent().attr('id');
        let token = currentUser.loginToken;
        const response = await axios.post(
          `https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${favoritedStoryId}`,
          {token})
          $(e.target).removeClass("far").addClass("fas");
          const story = storyList.stories.find(story => story.storyId === favoritedStoryId);
          currentUser.addFavorite(story)
          
    } else if (e.target.classList.contains("fas")) {
        let unfavoritedStoryId = $(e.target).parent().attr('id');
        let token = currentUser.loginToken
        const response = await axios ({
          url: `${BASE_URL}/users/${currentUser.username}/favorites/${unfavoritedStoryId}`, 
          method: "DELETE",
          data: {token}
        });
        //console.log(response)
        currentUser.removeFavorite(unfavoritedStoryId);
        $(e.target).removeClass("fas").addClass("far");
  }}

 //console.log(favoriteStoryArr)
  
}
  
function showFavorites() {
  $('.submit-story').hide();
  $loginForm.hide();
  $signupForm.hide();
  $allStoriesList.empty();

  console.log(storyList)

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

      if (currentUser) {
        const myStories = storyList.stories.filter(story => story.username === currentUser.username)
          if(myStories.length !== 0) {
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
  }


  
  
$("#nav-favorites").on("click", showFavorites)
$("#nav-mystories").on("click", showMystories)
$allStoriesList.on("click", handlingFavorites)

/**Adding to my stories */