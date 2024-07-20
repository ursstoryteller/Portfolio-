const folderName = new URLSearchParams(window.location.search).get("id");
console.log(" 🚀 ~ folderName:", folderName);

function addNewItem(targetElementId) {
  // Create a new element for the item
  const ele = document.querySelectorAll("temp");
  console.log(" 🚀 ~ addNewItem ~ ele:", ele);
  for (let i = 1; i < 7; i++) {
    const newItem = document.createElement("div");
    newItem.classList.add("item"); // Add the class "item"
    // newItem.style.backgroundImage = `url(./image/${folderName}/${i}.png)`;
    // newItem.style.filter = "blur(5px)";

    // Create a new image element
    const newImage = document.createElement("img");
    newImage.src = `./image/${folderName}/${i}.png`; // Set the image source
    newImage.alt = ""; // Set the alt text (optional)

    // Add the image to the new item
    newItem.appendChild(newImage);

    // Get the target element where you want to add the new item
    const targetElement = document.getElementById(targetElementId);

    // Check if the target element exists
    if (targetElement) {
      // Append the new item to the target element
      targetElement.appendChild(newItem);
    } else {
      console.error("Target element with ID", targetElementId, "not found.");
    }
  }
}

// Replace "yourTargetElementId" with the actual ID of the element where you want to add the item
addNewItem("listId");
addNewItem("thumbnailId");

let nextBtn = document.querySelector(".next");
let prevBtn = document.querySelector(".prev");

let slider = document.querySelector(".slider");
let sliderList = slider.querySelector(".slider .list");
let thumbnail = document.querySelector(".slider .thumbnail");
let thumbnailItems = thumbnail.querySelectorAll(".item");

thumbnail.appendChild(thumbnailItems[0]);

// Function for next button
nextBtn.onclick = function () {
  moveSlider("next");
};

// Function for prev button
prevBtn.onclick = function () {
  moveSlider("prev");
};

function moveSlider(direction) {
  let sliderItems = sliderList.querySelectorAll(".item");
  let thumbnailItems = document.querySelectorAll(".thumbnail .item");

  if (direction === "next") {
    sliderList.appendChild(sliderItems[0]);
    thumbnail.appendChild(thumbnailItems[0]);
    slider.classList.add("next");
  } else {
    sliderList.prepend(sliderItems[sliderItems.length - 1]);
    thumbnail.prepend(thumbnailItems[thumbnailItems.length - 1]);
    slider.classList.add("prev");
  }

  slider.addEventListener(
    "animationend",
    function () {
      if (direction === "next") {
        slider.classList.remove("next");
      } else {
        slider.classList.remove("prev");
      }
    },
    { once: true }
  ); // Remove the event listener after it's triggered once
}
