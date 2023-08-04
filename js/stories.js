"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let favoriteStoryArr = [];
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
  const isChecked = () => addChecked(story)
  return $(`
      <li id="${story.storyId}" class="individual-story">
        <p>${currentStoryindex++}.</p>
        <input type="checkbox" id="favorite-checkbox" ${isChecked()? 'checked' : ''}>
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
  const isChecked = () => addChecked(story);
  return $(`
      <li id="${story.storyId}">
        <button class="delete-button">
        <i class="fas fa-trash-alt"></i>
        </button>
        <input type="checkbox" id="favorite-checkbox" ${isChecked()? 'checked' : ''}>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
      `);
}

const addChecked = (currentStory) => {
 
  if(currentUser.favorites.length !== 0) {
    const favoriteIdArr = currentUser.favorites.map(story => story.storyId)
    console.log(favoriteIdArr.includes(currentStory.storyId))
    return currentUser.favorites.includes(currentStory.storyId)
  } else {
    return false
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

    $allStoriesList.prepend(newStory);

    myCreatedStories.push(newStory.storyId);
    addPersonalStoryToLocalStorage(newStory.storyId)

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



/**Adding to my stories */