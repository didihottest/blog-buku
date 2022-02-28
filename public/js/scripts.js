/*!
* Start Bootstrap - Blog Home v5.0.7 (https://startbootstrap.com/template/blog-home)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-blog-home/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

// function front end untuk hapus pencarian
const clearInput = () => {
  const input = document.querySelectorAll("input");
  for (const item of input) {
    if (item.name !== "page") {
      item.value = null
    }
  }
}
