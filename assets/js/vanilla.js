/**
 * Created by wembleyleach on 3/4/17.
 */
"use strict";

var post = function (spec) {
    var self = {};

    var imgTest = /.*\.jpg$/;
    self.thumbnail = (imgTest.test(spec.thumbnail) && spec.thumbnail) || "http://placehold.it/80";
    self.title = spec.title || "placehold.it really works!";
    self.author = spec.author || "John Smith";
    self.url = spec.url || "#";

    self.toString = function () {
        return "Thumbnail: ".concat(self.thumbnail, "Title: ", self.title, "Author: ", self.author, "URL: ", self.url);
    };

    return self;
};

var vanilla = (function (post) {

    var settings;
    var self = {
        settings: function () {
            return {
                root: "https://www.reddit.com/r/",
                currentSubreddit: "Apple",
                container: document.querySelector(".post-container"),
                navItems: document.querySelectorAll(".nav__item"),
                loadMore: document.querySelector("#load-more"),
                isLoadingMore: false,
                subredditTitle: document.querySelector(".subreddit-title")
            };
        },

        appendToContainer: function (child) {
            settings.container.appendChild(child);
        },

        bindUiEvents: function () {
            Array.prototype.forEach.call(settings.navItems, function (element) {
                element.querySelector("a").addEventListener("click", self.handleNavItemClick);
            });

            settings.loadMore.addEventListener("click", self.handleLoadMoreClick);
        },

        handleNavItemClick: function (event) {
            self.isLoadingMore = false;
            settings.container.innerHTML = "";
            settings.currentSubreddit = event.target.textContent;
            var url = settings.root.concat(settings.currentSubreddit, ".json");
            self.loadSubreddit(url, self.success, self.error);
        },

        handleLoadMoreClick: function () {
            settings.isLoadingMore = true;
            var url = settings.root.concat(settings.currentSubreddit,
                ".json?limit=26&after=",
                settings.loadMore.getAttribute("data-after"));
            self.loadSubreddit(url, self.success, self.error);
        },

        init: function () {
            settings = self.settings();
            self.bindUiEvents();
            var url = settings.root.concat(settings.currentSubreddit, ".json");
            self.loadSubreddit(url, self.success, self.error);
        },

        success: function (resp) {
            var hr;
            var postElement;
            var p;
            var child;
            var index;
            var response = JSON.parse(resp).data;
            var length = response.children.length;

            if (!settings.isLoadingMore) {
                settings.container.innerHTML = "";
            }

            for (index = 0; index < length; index += 1) {
                child = response.children[index].data;
                p = post({
                    thumbnail: child.thumbnail,
                    title: child.title,
                    author: child.author,
                    url: child.url
                });

                postElement = self.makePostElement(p);
                self.appendToContainer(postElement);
                hr = document.createElement("hr");
                self.appendToContainer(hr);
            }

            settings.loadMore.setAttribute("data-after", response.after);
            settings.subredditTitle.innerHTML = "";
            var subredditTitle = document.createTextNode("r/" + settings.currentSubreddit);
            settings.subredditTitle.appendChild(subredditTitle);

        },

        makePostElement: function (post) {
            var postDiv = document.createElement("div");
            postDiv.className = "post";

            var postThumbnail = document.createElement("img");
            postThumbnail.setAttribute("src", post.thumbnail);
            postThumbnail.setAttribute("alt", "placeholder");
            postThumbnail.className = "post__thumbnail";
            postDiv.appendChild(postThumbnail);

            var postTitle = document.createElement("h3");
            postTitle.className = "post__title";

            var postUrl = document.createElement("a");
            postUrl.setAttribute("href", post.url);
            postUrl.setAttribute("target", "_blank");
            var postTitleText = document.createTextNode(post.title);
            postUrl.appendChild(postTitleText);

            postTitle.appendChild(postUrl);
            postDiv.appendChild(postTitle);

            var postAuthor = document.createElement("p");
            postAuthor.className = "post__author";
            var postAuthorText = document.createTextNode("By: " + post.author);
            postAuthor.appendChild(postAuthorText);
            postDiv.appendChild(postAuthor);

            return postDiv;
        },

        error: function () {
            throw {
                name: "ConnectionError",
                message: "Failed to connect to API endpoint"
            };
        },

        loadSubreddit: function (url, onload, onerror) {
            var request = new XMLHttpRequest();
            request.open("GET", url);

            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    onload(request.responseText);
                } else {
                    // We reached our target server, but it returned an error
                    throw {
                        name: "LoadSubredditError",
                        message: "Failed to retrieve currentSubreddit"
                    };
                }
            };

            request.onerror = onerror;

            request.send();
        }
    };

    return self;

}(post));

