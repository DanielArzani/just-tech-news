async function logout() {
  const response = await fetch("/api/users/logout", {
    method: "post",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    // Removes the current page from the session history and navigates to the given URL
    // Currently this isn't needed for it to work but if we have more than one page then having them re-direct to the homepage is probably want we want
    document.location.replace("/");
  } else {
    alert(response.statusText);
  }
}

document.querySelector("#logout").addEventListener("click", logout);
