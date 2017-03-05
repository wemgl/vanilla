/**
 * Created by wembleyleach on 3/4/17.
 */
'use strict';

;var post = function (spec) {
    var self = {};

    var imgTest = /.*\.jpg$/;
    self.thumbnail = imgTest.test(spec.thumbnail) && spec.thumbnail || 'http://placehold.it/80';
    self.title = spec.title || 'placehold.it really works!';
    self.author = spec.author || 'John Smith';
    self.url = spec.url || '#';

    self.toString = function () {
        return 'Thumbnail: ' + self.thumbnail +
            'Title: ' + self.title +
            'Author: ' + self.author +
            'URL: ' + self.url;
    };

    return self;
};

var vanilla = (function (post) {

    var s,
        self = {
            settings: function () {
                return {
                    root: 'https://www.reddit.com/r/',
                    currentSubreddit: 'Apple',
                    container: document.querySelector('.post-container'),
                    navItems: document.querySelectorAll('.nav__item'),
                    loadMore: document.querySelector('#load-more'),
                    isLoadingMore: false,
                    subredditTitle: document.querySelector('.subreddit-title')
                };
            },

            appendToContainer: function (child) {
                s.container.appendChild(child);
            },

            bindUiEvents: function () {
                Array.prototype.forEach.call(s.navItems, function (element) {
                    element.querySelector('a').addEventListener('click', self.handleNavItemClick);
                });

                s.loadMore.addEventListener("click", self.handleLoadMoreClick);
            },

            handleNavItemClick: function (event) {
                self.isLoadingMore = false;
                s.container.innerHTML = '';
                s.currentSubreddit = event.target.textContent;
                var url = s.root + s.currentSubreddit + '.json';
                self.loadSubreddit(url, self.success, self.error);
            },

            handleLoadMoreClick: function () {
                s.isLoadingMore = true;
                var url = s.root + s.currentSubreddit +
                    '.json?limit=26&after=' +
                    s.loadMore.getAttribute("data-after");
                self.loadSubreddit(url, self.success, self.error);
            },

            init: function () {
                s = self.settings();
                self.bindUiEvents();
                var url = s.root + s.currentSubreddit + '.json';
                self.loadSubreddit(url, self.success, self.error);
            },

            success: function (resp) {
                var index,
                    response = JSON.parse(resp).data,
                    length = response.children.length;

                if (!s.isLoadingMore) {
                    s.container.innerHTML = '';
                }

                for (index = 0; index < length; index += 1) {
                    var child = response.children[index].data;
                    var p = post({
                        thumbnail: child.thumbnail,
                        title: child.title,
                        author: child.author,
                        url: child.url
                    });

                    var postElement = self.makePostElement(p);
                    self.appendToContainer(postElement);
                    var hr = document.createElement('hr');
                    self.appendToContainer(hr);
                }

                s.loadMore.setAttribute("data-after", response.after);
                s.subredditTitle.innerHTML = '';
                var subredditTitle = document.createTextNode('r/' + s.currentSubreddit);
                s.subredditTitle.appendChild(subredditTitle);

            },

            makePostElement: function (post) {
                var postDiv = document.createElement('div');
                postDiv.className = 'post';

                var postThumbnail = document.createElement('img');
                postThumbnail.setAttribute('src', post.thumbnail);
                postThumbnail.setAttribute('alt', 'placeholder');
                postThumbnail.className = 'post__thumbnail';
                postDiv.appendChild(postThumbnail);

                var postTitle = document.createElement('h3');
                postTitle.className = 'post__title';

                var postUrl = document.createElement('a');
                postUrl.setAttribute('href', post.url);
                postUrl.setAttribute('target', '_blank');
                var postTitleText = document.createTextNode(post.title);
                postUrl.appendChild(postTitleText);

                postTitle.appendChild(postUrl);
                postDiv.appendChild(postTitle);

                var postAuthor = document.createElement('p');
                postAuthor.className = 'post__author';
                var postAuthorText = document.createTextNode('By: ' + post.author);
                postAuthor.appendChild(postAuthorText);
                postDiv.appendChild(postAuthor);

                return postDiv;
            },

            error: function () {
                throw {
                    name: 'ConnectionError',
                    message: 'Failed to connect to API endpoint'
                };
            },

            loadSubreddit: function (url, onload, onerror) {
                var request = new XMLHttpRequest();
                request.open('GET', url);

                request.onload = function () {
                    if (request.status >= 200 && request.status < 400) {
                        // Success!
                        onload(request.responseText);
                    } else {
                        // We reached our target server, but it returned an error
                        throw {
                            name: 'LoadSubredditError',
                            message: 'Failed to retrieve currentSubreddit'
                        };
                    }
                };

                request.onerror = onerror;

                request.send();
            }
        };

    return self;

}(post));

