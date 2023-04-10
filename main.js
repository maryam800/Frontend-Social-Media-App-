const baseUrl = "https://tarmeezacademy.com/api/v1";
const postsContainer = document.querySelector(".posts");
const loginBtn = document.getElementById("loginButton");
const registerBtn = document.getElementById("registerButton");
const createPostBtn = document.getElementById("createPostButton");
const logout = document.getElementById("logout");
const login = document.getElementById("login");
const register = document.getElementById("register");
let currentPage = 1;
let lastPage = 1;
//Pagination
window.addEventListener("scroll", function () {
  const endOfPage =
    window.scrollY + window.innerHeight + 1 >=
    document.documentElement.scrollHeight;
  if (endOfPage && currentPage < lastPage) {
    getPosts(false, currentPage);
    currentPage++;
  }
});

drawUI();
getPosts();
function getPosts(reload = true, page = 1) {
  // Show Edit Button User Must Be LogIn user!null and must Edit His Own Post post.author.id == user.id
 togglLoader(true)
  axios.get(`${baseUrl}/posts?limit=2&page=${page}`)
  .then(function (response) {
    togglLoader(false)
    // handle success
    let data = response.data.data;
    //This variable for pagination
    lastPage = response.data.meta.last_page;
    if (reload && postsContainer != null) {
      postsContainer.innerHTML = "";
    }
    for (let post of data) {
      let user=getUser()
      let isMyPostOrNot=user !=null && user.id == post.author.id
      let myEditButton=''
      let myDeleteButton=''
      if(isMyPostOrNot){
        myEditButton=`<span class="btn btn-primary" onclick="drawEditModel('${encodeURIComponent(
          JSON.stringify(post)
        )}')">Edit</span>`
        myDeleteButton=`<span class="btn btn-danger" onclick="drawDeleteModel('${encodeURIComponent(
          JSON.stringify(post)
        )}')">Delete</span>`
      }
      let content = `
        <div class="post" >
          <div class="card shadow">
            <div class="card-header d-flex justify-content-between">
            <span onclick="displayIdForProfile(${post.author.id})" style="cursor:pointer">
              <span>
              <img src="${post.author.profile_image}" class="avatar"
           " />
              <span><b>@${post.author.username}</b></span>
              </span>
              </span>
              <span>
              ${myEditButton}
              ${myDeleteButton}
              </span>
            </div>
            <div class="card-body" onclick="postClicked(${post.id})">
              <img
                src="${post.image}"
                alt=""
              />
              <h6 class="mt-2">${post.created_at}</h6>
              <h5 class="card-title">${post.title || "This is Title"}</h5>
              <p class="card-text">
               ${post.body || "This is Body"}
              </p>
              <hr />
              <div class="d-flex align-items-center content">
                <div class="comments me-3">
                  <i class="fa-solid fa-pen"></i>
                  <span>(${post.comments_count}) Comments</span>
                </div>
                <div class="d-flex tags" id="tags-${post.id}">
                </div>
              </div>
            </div>
          </div>
        </div>
        `;
      if (postsContainer != null) {
        postsContainer.innerHTML += content;
      }
      const currentPostId = `tags-${post.id}`;
      let postTagContainer = document.getElementById(currentPostId);
      if (postTagContainer != null) {
        postTagContainer.innerHTML = "";
      }
      for (let tag of post.tags) {
        let tagsContent = `
            <span class="tag">${tag.name}</span>
            `;
        postTagContainer.innerHTML += tagsContent;
      }
    }
  });
}

// Register Process
registerBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const image = document.getElementById("user-profile-image").files[0];

  const headers = {
    "Content-Type": "multipart/form-data",
  };
  let registerFormData = new FormData();
  registerFormData.append("username", username);
  registerFormData.append("password", password);
  registerFormData.append("name", name);
  registerFormData.append("image", image);
  togglLoader(true)
  axios
    .post(`${baseUrl}/register`, registerFormData, {
      headers: headers,
    })
    .then((response) => {
      let token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      //Close Register Modal
      const registerModal = document.getElementById("registerModal");
      const modal = bootstrap.Modal.getInstance(registerModal);
      modal.hide();
      //Show Alert To user
      showAlert("User Register Successfully", "success");
      drawUI();
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
      console.log(error);
    }).finally(
      togglLoader(false)
    );
});
// Login Process
loginBtn.addEventListener("click", () => {
  const username = document.getElementById("user-name").value;
  const password = document.getElementById("user-password").value;

  const bodyFields = {
    username: username,
    password: password,
  };
  togglLoader(true)
  axios
    .post(`${baseUrl}/login`, bodyFields)
    .then((response) => {
      let token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      //Close Login Modal
      const loginModal = document.getElementById("loginModal");
      const modal = bootstrap.Modal.getInstance(loginModal);
      modal.hide();
      //Show Alert To user
      showAlert("Login In Successfully", "success");
      drawUI();
      getPosts()
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    }).finally(
      togglLoader(false)
    );
});
//Logout Process
logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAlert("Logout Successfully", "danger");
  drawUI();
  getPosts()
});
// Add Post Process

//Alert Function

function showAlert(customMsg, type) {
  const alertPlaceholder = document.getElementById("show-alert");

  const alert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };
  alert(customMsg, type);
  // $("#show-alert").fadeTo(2000, 500).slideUp(500, function(){
  //   $("#show-alert").slideUp(500);
  // });
  // $("#show-alert").delay(3000).slideUp(200, function() {
  //   $(this).alert('close');
  // });
}
//Set Up UI

function drawUI() {
  let token = localStorage.getItem("token");
  const leftSide = document.querySelector(".left");
  const rightSide = document.querySelector(".right");
  const addPostBtn = document.getElementById("add-post");
  const userProfileImage = document.querySelector(".user-profile-img");
  const userProfileName = document.querySelector(".user-profile-name");
  let addCommentBtn = document.getElementById("createComment");
  if (token == null) {
    leftSide.style.setProperty("display", "flex", "important");
    rightSide.style.setProperty("display", "none", "important");
    if (addPostBtn != null) {
      addPostBtn.style.setProperty("display", "none", "important");
    }
  } else {
    //User Logged In
    leftSide.style.setProperty("display", "none", "important");
    rightSide.style.setProperty("display", "flex", "important");
    if (addPostBtn != null) {
      addPostBtn.style.setProperty("display", "flex", "important");
    }
    let userInfo = getUser();
    userProfileName.textContent = userInfo.username;
    userProfileImage.src = userInfo.profile_image;
  }
}
//Get User From Local Storage
function getUser() {
  let user = null;
  let storeUser = localStorage.getItem("user");
  if (storeUser != null) {
    user = JSON.parse(storeUser);
  }
  return user;
}
function createPost(){
  let url=''
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  const image = document.getElementById("post-image").files[0];
  const token = localStorage.getItem("token");
  let postId=document.getElementById('typeOfMehod').value;
  let isCreate=postId == null || postId =='';
  //To Add files We should Use FORM DATA

  let formData = new FormData();
  formData.append("title", title);
  formData.append("body", content);
  formData.append("image", image);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  };
  if(isCreate){
    url=`${baseUrl}/posts`
    axios
    .post(url, formData, {
      headers: headers,
    })
    .then((response) => {
      //Close Add Post Modal
      const addPostModal = document.getElementById("addPostModal");
      const modal = bootstrap.Modal.getInstance(addPostModal);
      modal.hide();
      //Show Alert To user
      showAlert("Post Created Successfully", "success");
      getPosts();
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    });
  }
  else{
    formData.append('_method' ,'PUT')
    url=`${baseUrl}/posts/${postId}`
    axios
    .post(url, formData, {
      headers: headers,
    })
    .then((response) => {
      //Close Add Post Modal
      const addPostModal = document.getElementById("addPostModal");
      const modal = bootstrap.Modal.getInstance(addPostModal);
      modal.hide();
      //Show Alert To user
      showAlert("Post Updated Successfully", "success");
      getPosts();
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    });
  }
}
//send QueryParameterto another Page(postDetails)
function postClicked(postId) {
  window.location = `postDetails.html?postId=${postId}`;
}
function drawEditModel(post) {
  let obj = JSON.parse(decodeURIComponent(post));
  let editModal = new bootstrap.Modal(
    document.getElementById("addPostModal"),
    {}
  );
  editModal.toggle();
  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  document.getElementById("post-title").value = obj.title;
  document.getElementById("post-content").value = obj.body;
  document.getElementById("createPostButton").innerHTML = "Update";
  document.getElementById('typeOfMehod').value=obj.id;
}
function drawCreateModal() {
  let createModal = new bootstrap.Modal(
    document.getElementById("addPostModal"),
    {}
  );
  createModal.toggle();
  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";
  document.getElementById("createPostButton").innerHTML = "Create";
  document.getElementById('typeOfMehod').value="";

}
function drawDeleteModel(post){
  let obj = JSON.parse(decodeURIComponent(post));
  document.getElementById('deleteId').value=obj.id
  console.log(obj.id)
  let deleteModal = new bootstrap.Modal(
    document.getElementById("deletePostModal"),
    {}
  );
  deleteModal.toggle();
}
function deletePost(){
  let postId=document.getElementById('deleteId').value;
let token=localStorage.getItem('token')
let header={
  "authorization" :`Bearer ${token}`
}
  axios
    .delete(`${baseUrl}/posts/${postId}` ,{
      headers:header
    })
    .then((response) => {
      //Close Delete Modal
      const deleteModal = document.getElementById("deletePostModal");
      const modal = bootstrap.Modal.getInstance(deleteModal);
      modal.hide();
      //Show Alert To user
      showAlert("Deleted Post Successfully", "success");
      drawUI();
      getPosts()
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    });
}

function displayIdForProfile(id){
  window.location = `profile.html?postId=${id}`;
}
function profileClicked(){
  let user=getUser()
  if(user !=null){
    window.location = `profile.html?postId=${user.id}`;
  }
  else{
    showAlert("Login To Your Account To Display This Page" ,'danger')
  }

}

//Loader Function
function togglLoader(show=true){
  if(show){
    document.getElementById('loader').style.visibility='visible'
  }
  else{
    document.getElementById('loader').style.visibility='hidden'


  }
}