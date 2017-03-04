/**
 * Created by wembleyleach on 3/4/17.
 */
;var post = function (spec) {
    var self = {};

    self.thumbnail = spec.thumbnail || 'http://placehold.it/80';
    self.title = spec.title || 'Placehold.it really works!';
    self.author = spec.author || 'John Smith';

    self.toString = function () {
        return 'Thumbnail: ' + self.thumbnail +
            'Title: ' + self.title +
            'Author: ' + self.author;
    };

    return self;
};
var vanilla = (function (post) {

    var s,
        self = {
            settings: function () {
                return {
                    defaultSubreddit: 'apple',
                    container: document.querySelector('#js-container')
                };
            },

            appendToContainer: function (child) {
                s.container.appendChild(child);
            },

            bindUiEvents: function () {
                // s.container.addEventListener('click', this.writeToContainer);
            },

            init: function () {
                s = self.settings();
                self.bindUiEvents();
                self.loadSubreddit(s.defaultSubreddit, self.success, self.error);
            },

            success: function (resp) {
                var index,
                    response = JSON.parse(resp).data;

                for (index = 0; index < response.children.length; index += 1) {
                    var child = response.children[index].data;
                    var p = post({
                        thumbnail: child.thumbnail,
                        title: child.title,
                        author: child.author
                    });

                    var postElement = self.makePostElement(p);
                    self.appendToContainer(postElement);
                }

            },

            makePostElement: function(post) {
                var postDiv = document.createElement('div');
                postDiv.className = 'post';

                var postThumbnail = document.createElement('img');
                postThumbnail.setAttribute('src', post.thumbnail);
                postThumbnail.setAttribute('alt', 'placeholder');
                postThumbnail.className = 'post__thumbnail';
                postDiv.appendChild(postThumbnail);

                var postTitle = document.createElement('h3');
                postTitle.className = 'post__title';
                var postTitleText = document.createTextNode(post.title);
                postTitle.appendChild(postTitleText);
                postDiv.appendChild(postTitle);

                var postAuthor = document.createElement('p');
                postAuthor.className = 'post__author';
                var postAuthorText = document.createTextNode('By: '  + post.author);
                postAuthor.appendChild(postAuthorText);
                postDiv.appendChild(postAuthor);

                var hr = document.createElement('hr');
                postDiv.appendChild(hr);

                console.log(postDiv);
                return postDiv;
            },

            error: function () {
                throw {
                    name: 'ConnectionError',
                    message: 'Failed to connect to API endpoint'
                };
            },

            loadSubreddit: function (subreddit, onload, onerror) {
                var request = new XMLHttpRequest();
                var url = 'https://www.reddit.com/r/' + subreddit + '.json';
                request.open('GET', url);

                request.onload = function () {
                    if (request.status >= 200 && request.status < 400) {
                        // Success!
                        var resp = request.responseText;
                        onload(resp);
                    } else {
                        // We reached our target server, but it returned an error
                        throw {
                            name: 'LoadSubredditError',
                            message: 'Failed to retrieve defaultSubreddit'
                        };
                    }
                };

                request.onerror = onerror;

                request.send();
            }
        };

    return self;

}(post));

