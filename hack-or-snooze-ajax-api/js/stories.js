"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

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

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showFav = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//Make delete button
function getDeleteButton(){
  return `
  <span class="trash-can">
    <i class="fas fa-trash-alt"></i>
    </span>`;
}

// Mark favorite stories
function markFavorite(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
  <span class="star">
    <i class="${starType} fa-star"></i>
  </span>`;
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

//delete a story
async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$myStories.on("click", ".trash-can", deleteStory)

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  const title = $("#create-title").val();
  const author = $("#create-author").val();
  const url = $("#create-url").val();
  const username = currentUser.username
  const storyData = {title, author, url, username};

  const story = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

//users own stories

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $myStories.empty();

  if (currentUser.myStories.length === 0) {
    $myStories.append("No stories have been added yet")
  } else {
    for (let story of currentUser.myStories) {
      let $story = generateStoryMarkup(story, true);
      $myStories.append($story)
    }
  }

  $myStories.show();
}

//display favorite list 

function displayFavorites(){
  console.debug("displayFavorites");

  $favoriteStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoriteStories.append("No favorites added")
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStories.append($story)
    }
  }

  $favoriteStories.show();
}

//favorite / unfavorite a story

async function toggleFavorite(evt){
  console.debug("toggleFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($tgt.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far")
  } else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far")
  }
}

$storiesList.on("click", ".star", toggleFavorite);