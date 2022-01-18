async function upvoteClickHandler(e) {
  e.preventDefault();

  // Take a URL string like http://localhost:3001/post/1, split it into an array based on the / character, and then grab the last item in the array.
  // This will return the post_id
  const id = window.location.toString().split("/")[
    // Will return the element in the last index position of the array
    window.location.toString().split("/").length - 1
  ];

  const response = await fetch("/api/posts/upvote", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_id: id,
    }),
  });

  if (response.ok) {
    document.location.reload();
  } else {
    alert(response.statusText);
  }
}

const upvoteBtn = document
  .querySelector(".upvote-btn")
  .addEventListener("click", upvoteClickHandler);
