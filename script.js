document.addEventListener('DOMContentLoaded', function() {
    // Key map
    var ENTER = 13;
    var ESCAPE = 27;
    var SPACE = 32;
    var UP = 38;
    var DOWN = 40;
    var TAB = 9;

    function closest(element, selector) {
        if (Element.prototype.closest) {
            return element.closest(selector);
        }
        do {
            if (Element.prototype.matches && element.matches(selector) ||
                Element.prototype.msMatchesSelector && element.msMatchesSelector(selector) ||
                Element.prototype.webkitMatchesSelector && element.webkitMatchesSelector(selector)) {
                return element;
            }
            element = element.parentElement || element.parentNode;
        } while (element !== null && element.nodeType === 1);
        return null;
    }

    // social share popups
    Array.prototype.forEach.call(document.querySelectorAll('.share a'), function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(this.href, '', 'height = 500, width = 500');
        });
    });

    // In some cases we should preserve focus after page reload
    function saveFocus() {
        var activeElementId = document.activeElement.getAttribute("id");
        sessionStorage.setItem('returnFocusTo', '#' + activeElementId);
    }
    var returnFocusTo = sessionStorage.getItem('returnFocusTo');
    if (returnFocusTo) {
        sessionStorage.removeItem('returnFocusTo');
        var returnFocusToEl = document.querySelector(returnFocusTo);
        returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
    }

    // show form controls when the textarea receives focus or backbutton is used and value exists
    var commentContainerTextarea = document.querySelector('.comment-container textarea'),
        commentContainerFormControls = document.querySelector('.comment-form-controls, .comment-ccs');

    if (commentContainerTextarea) {
        commentContainerTextarea.addEventListener('focus', function focusCommentContainerTextarea() {
            commentContainerFormControls.style.display = 'block';
            commentContainerTextarea.removeEventListener('focus', focusCommentContainerTextarea);
        });

        if (commentContainerTextarea.value !== '') {
            commentContainerFormControls.style.display = 'block';
        }
    }

    // Expand Request comment form when Add to conversation is clicked
    var showRequestCommentContainerTrigger = document.querySelector('.request-container .comment-container .comment-show-container'),
        requestCommentFields = document.querySelectorAll('.request-container .comment-container .comment-fields'),
        requestCommentSubmit = document.querySelector('.request-container .comment-container .request-submit-comment');

    if (showRequestCommentContainerTrigger) {
        showRequestCommentContainerTrigger.addEventListener('click', function() {
            showRequestCommentContainerTrigger.style.display = 'none';
            Array.prototype.forEach.call(requestCommentFields, function(e) { e.style.display = 'block'; });
            requestCommentSubmit.style.display = 'inline-block';

            if (commentContainerTextarea) {
                commentContainerTextarea.focus();
            }
        });
    }

    // Mark as solved button
    var requestMarkAsSolvedButton = document.querySelector('.request-container .mark-as-solved:not([data-disabled])'),
        requestMarkAsSolvedCheckbox = document.querySelector('.request-container .comment-container input[type=checkbox]'),
        requestCommentSubmitButton = document.querySelector('.request-container .comment-container input[type=submit]');

    if (requestMarkAsSolvedButton) {
        requestMarkAsSolvedButton.addEventListener('click', function() {
            requestMarkAsSolvedCheckbox.setAttribute('checked', true);
            requestCommentSubmitButton.disabled = true;
            this.setAttribute('data-disabled', true);
            // Element.closest is not supported in IE11
            closest(this, 'form').submit();
        });
    }

    // Change Mark as solved text according to whether comment is filled
    var requestCommentTextarea = document.querySelector('.request-container .comment-container textarea');

    var usesWysiwyg = requestCommentTextarea && requestCommentTextarea.dataset.helper === "wysiwyg";

    function isEmptyPlaintext(s) {
        return s.trim() === '';
    }

    function isEmptyHtml(xml) {
        var doc = new DOMParser().parseFromString(`<_>${xml}</_>`, "text/xml");
        var img = doc.querySelector("img");
        return img === null && isEmptyPlaintext(doc.children[0].textContent);
    }

    var isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;

    if (requestCommentTextarea) {
        requestCommentTextarea.addEventListener('input', function() {
            if (isEmpty(requestCommentTextarea.value)) {
                if (requestMarkAsSolvedButton) {
                    requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-translation');
                }
                requestCommentSubmitButton.disabled = true;
            } else {
                if (requestMarkAsSolvedButton) {
                    requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-and-submit-translation');
                }
                requestCommentSubmitButton.disabled = false;
            }
        });
    }

    // Disable submit button if textarea is empty
    if (requestCommentTextarea && isEmpty(requestCommentTextarea.value)) {
        requestCommentSubmitButton.disabled = true;
    }

    // Submit requests filter form on status or organization change in the request list page
    Array.prototype.forEach.call(document.querySelectorAll('#request-status-select, #request-organization-select'), function(el) {
        el.addEventListener('change', function(e) {
            e.stopPropagation();
            saveFocus();
            closest(this, 'form').submit();
        });
    });

    // Submit requests filter form on search in the request list page
    var quickSearch = document.querySelector('#quick-search');
    quickSearch && quickSearch.addEventListener('keyup', function(e) {
        if (e.keyCode === ENTER) {
            e.stopPropagation();
            saveFocus();
            closest(this, 'form').submit();
        }
    });

    function toggleNavigation(toggle, menu) {
        var isExpanded = menu.getAttribute('aria-expanded') === 'true';
        menu.setAttribute('aria-expanded', !isExpanded);
        toggle.setAttribute('aria-expanded', !isExpanded);
    }

    function closeNavigation(toggle, menu) {
        menu.setAttribute('aria-expanded', false);
        toggle.setAttribute('aria-expanded', false);
        toggle.focus();
    }

    var menuButton = document.querySelector('.header .menu-button-mobile');
    var menuList = document.querySelector('#user-nav-mobile');

    menuButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleNavigation(this, menuList);
    });


    menuList.addEventListener('keyup', function(e) {
        if (e.keyCode === ESCAPE) {
            e.stopPropagation();
            closeNavigation(menuButton, this);
        }
    });

    // Toggles expanded aria to collapsible elements
    var collapsible = document.querySelectorAll('.collapsible-nav, .collapsible-sidebar');

    Array.prototype.forEach.call(collapsible, function(el) {
        var toggle = el.querySelector('.collapsible-nav-toggle, .collapsible-sidebar-toggle');

        el.addEventListener('click', function(e) {
            toggleNavigation(toggle, this);
        });

        el.addEventListener('keyup', function(e) {
            if (e.keyCode === ESCAPE) {
                closeNavigation(toggle, this);
            }
        });
    });

    // Submit organization form in the request page
    var requestOrganisationSelect = document.querySelector('#request-organization select');

    if (requestOrganisationSelect) {
        requestOrganisationSelect.addEventListener('change', function() {
            closest(this, 'form').submit();
        });
    }

    // If multibrand search has more than 5 help centers or categories collapse the list
    var multibrandFilterLists = document.querySelectorAll(".multibrand-filter-list");
    Array.prototype.forEach.call(multibrandFilterLists, function(filter) {
        if (filter.children.length > 6) {
            // Display the show more button
            var trigger = filter.querySelector(".see-all-filters");
            trigger.setAttribute("aria-hidden", false);

            // Add event handler for click
            trigger.addEventListener("click", function(e) {
                e.stopPropagation();
                trigger.parentNode.removeChild(trigger);
                filter.classList.remove("multibrand-filter-list--collapsed")
            })
        }
    });

    // If there are any error notifications below an input field, focus that field
    var notificationElm = document.querySelector(".notification-error");
    if (
        notificationElm &&
        notificationElm.previousElementSibling &&
        typeof notificationElm.previousElementSibling.focus === "function"
    ) {
        notificationElm.previousElementSibling.focus();
    }

    // Dropdowns

    function Dropdown(toggle, menu) {
        this.toggle = toggle;
        this.menu = menu;

        this.menuPlacement = {
            top: menu.classList.contains("dropdown-menu-top"),
            end: menu.classList.contains("dropdown-menu-end")
        };

        this.toggle.addEventListener("click", this.clickHandler.bind(this));
        this.toggle.addEventListener("keydown", this.toggleKeyHandler.bind(this));
        this.menu.addEventListener("keydown", this.menuKeyHandler.bind(this));
    }

    Dropdown.prototype = {

        get isExpanded() {
            return this.menu.getAttribute("aria-expanded") === "true";
        },

        get menuItems() {
            return Array.prototype.slice.call(this.menu.querySelectorAll("[role='menuitem']"));
        },

        dismiss: function() {
            if (!this.isExpanded) return;

            this.menu.setAttribute("aria-expanded", false);
            this.menu.classList.remove("dropdown-menu-end", "dropdown-menu-top");
        },

        open: function() {
            if (this.isExpanded) return;

            this.menu.setAttribute("aria-expanded", true);
            this.handleOverflow();
        },

        handleOverflow: function() {
            var rect = this.menu.getBoundingClientRect();

            var overflow = {
                right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
                bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight
            };

            if (overflow.right || this.menuPlacement.end) {
                this.menu.classList.add("dropdown-menu-end");
            }

            if (overflow.bottom || this.menuPlacement.top) {
                this.menu.classList.add("dropdown-menu-top");
            }

            if (this.menu.getBoundingClientRect().top < 0) {
                this.menu.classList.remove("dropdown-menu-top")
            }
        },

        focusNextMenuItem: function(currentItem) {
            if (!this.menuItems.length) return;

            var currentIndex = this.menuItems.indexOf(currentItem);
            var nextIndex = currentIndex === this.menuItems.length - 1 || currentIndex < 0 ? 0 : currentIndex + 1;

            this.menuItems[nextIndex].focus();
        },

        focusPreviousMenuItem: function(currentItem) {
            if (!this.menuItems.length) return;

            var currentIndex = this.menuItems.indexOf(currentItem);
            var previousIndex = currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;

            this.menuItems[previousIndex].focus();
        },

        clickHandler: function() {
            if (this.isExpanded) {
                this.dismiss();
            } else {
                this.open();
            }
        },

        toggleKeyHandler: function(e) {
            switch (e.keyCode) {
                case ENTER:
                case SPACE:
                case DOWN:
                    e.preventDefault();
                    this.open();
                    this.focusNextMenuItem();
                    break;
                case UP:
                    e.preventDefault();
                    this.open();
                    this.focusPreviousMenuItem();
                    break;
                case ESCAPE:
                    this.dismiss();
                    this.toggle.focus();
                    break;
            }
        },

        menuKeyHandler: function(e) {
            var firstItem = this.menuItems[0];
            var lastItem = this.menuItems[this.menuItems.length - 1];
            var currentElement = e.target;

            switch (e.keyCode) {
                case ESCAPE:
                    this.dismiss();
                    this.toggle.focus();
                    break;
                case DOWN:
                    e.preventDefault();
                    this.focusNextMenuItem(currentElement);
                    break;
                case UP:
                    e.preventDefault();
                    this.focusPreviousMenuItem(currentElement);
                    break;
                case TAB:
                    if (e.shiftKey) {
                        if (currentElement === firstItem) {
                            this.dismiss();
                        } else {
                            e.preventDefault();
                            this.focusPreviousMenuItem(currentElement);
                        }
                    } else if (currentElement === lastItem) {
                        this.dismiss();
                    } else {
                        e.preventDefault();
                        this.focusNextMenuItem(currentElement);
                    }
                    break;
                case ENTER:
                case SPACE:
                    e.preventDefault();
                    currentElement.click();
                    break;
            }
        }
    }

    var dropdowns = [];
    var dropdownToggles = Array.prototype.slice.call(document.querySelectorAll(".dropdown-toggle"));

    dropdownToggles.forEach(function(toggle) {
        var menu = toggle.nextElementSibling;
        if (menu && menu.classList.contains("dropdown-menu")) {
            dropdowns.push(new Dropdown(toggle, menu));
        }
    });

    document.addEventListener("click", function(evt) {
        dropdowns.forEach(function(dropdown) {
            if (!dropdown.toggle.contains(evt.target)) {
                dropdown.dismiss();
            }
        });
    });


});

(function($) {
    "use strict";


    function CoreThemeCore() {
        var self = this;
        self.init();
    };

    CoreThemeCore.prototype = {
        /**
         *  Initialize
         */
        init: function() {
            var self = this;


            // Get Menu
            // self.getMenu();

            //Append Articles
            if (0 < $('#articles').length) {
                self.getArticles();
            }
            //Set CLick event for Paginations
            self.getPageArticles();

        },
        /**
         *  Extensions: Load scripts
         */

        getPageArticles: function() {
            var self = this;
            //jQuery('').data('href')

            $('#pagination').on("click", 'div[class*="pagination:number"]', function(e) {
                e.preventDefault();
                let lang = $('html').attr('lang').toLowerCase();
                let Qdata = $(this).data('query');
                if (Qdata != "#") {
                    $(".se-pre-con").show();
                    let articlesUrl = 'https://www.settlein.support/api/v2/help_center/' + lang + '/articles' + Qdata;
                    $.ajax({
                        url: articlesUrl,
                        type: 'GET',
                        dataType: 'json',
                        success: function(data) {
                            self.showArticles(data, lang);
                            $(".se-pre-con").fadeOut("slow");
                        },
                        error: function(request, error) {
                            $(".se-pre-con").fadeOut("slow");
                            console.log("Request: " + JSON.stringify(request));
                        }
                    });
                }

            });

        },
        getArticles: function() {
            var self = this;
            $(".se-pre-con").show();
            let lang = $('html').attr('lang').toLowerCase();
            let articlesUrl = 'https://www.settlein.support/api/v2/help_center/' + lang + '/articles?page=1&per_page=4';
            $.ajax({
                url: articlesUrl,
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    self.showArticles(data, lang);
                    $(".se-pre-con").fadeOut("slow");
                },
                error: function(request, error) {
                    $(".se-pre-con").fadeOut("slow");
                    console.log("Request: " + JSON.stringify(request));
                }
            });
        },

        getArticlesBySectionId: function() {
            // let search_string = $()topics-dropdown
            // getArticles('https://www.settlein.support/api/v2/help_center/en-us/sections/4926790142615/articles')
        },

        showArticles: function(data, lang) {
            var self = this;
            const article = ({ html_url, id, title, body }) => `
                <div class="col-lg-6 margin-bottom-20">
                <div id="article-wrap-${id}" class="article-img-left">
                <div id="img-wrap-${id}" class="item_img">
                    <img id="article-${id}" src="" width="100%" height="100%" alt="${title}" title="${title}"/>
                </div>
                <div class="item-text">
                    <div class="article-title"><a href="${html_url}">${title}</a></div>
                    <div class="article-description">
                    ${body}
                    </div>
                    <a href="${html_url}" class="read-story-button" role="button">
                    <span class="button-content-wrapper">
                    <span class="button-text">Read Story</span>
                        <span class="button-icon align-icon-right">
                        <i aria-hidden="true" class="fa fa-arrow-right"></i> </span>
                    </span>
                    </a>
                </div>
                </div>
            </div>
                `;
            let articlesContainer = $('#articles');
            let getImage = [];
            articlesContainer.html('');
            data['articles'].forEach(element => {
                // console.log(element['url'] + " " + element['title']);
                let excerpt = $(element['body']).text().trim().substring(0, 150).split(" ").slice(0, -1).join(" ") + "...";
                articlesContainer.append([{
                    html_url: element['html_url'],
                    id: element['id'],
                    title: element['title'],
                    body: excerpt
                }, ].map(article).join(''));

                getImage[element['id']] = $.ajax({
                    // url: 'https://www.settlein.support/hc/api/v2/articles/' + element['id'] + '/attachments.json',
                    url: 'https://www.settlein.support/api/v2/help_center/' + lang + '/articles/' + element['id'] + '/attachments.json',
                    type: 'GET',
                    dataType: 'json'
                });
                $.when(getImage[element['id']]).done(function(imageUrl) {
                    if (typeof imageUrl.article_attachments[0] !== 'undefined') {
                        let urlimg = imageUrl.article_attachments[0].content_url;
                        if (self.checkURL(urlimg) && (typeof urlimg !== 'undefined')) {
                            $('#article-' + element['id']).attr('src', imageUrl.article_attachments[0].content_url);
                        } else {
                            $('#img-wrap-' + element['id']).remove();
                            $('#article-wrap-' + element['id']).css({ 'padding-left': '25px' });
                        }
                    } else {
                        $('#img-wrap-' + element['id']).remove();
                        $('#article-wrap-' + element['id']).css({ 'padding-left': '25px' });
                    }
                });

            });

            let prev = "#"
            if ((data['previous_page'] != null) && (data['page'] - 1) > 0) {
                prev = '?page=' + (data['page'] - 1) + '&per_page=4';
            };
            let next = "#"
            if ((data['next_page'] != null) && data['page'] < data['page_count']) {
                next = '?page=' + (data['page'] + 1) + '&per_page=4';
            };

            let active = '';
            let prevlabel = $('#prevlabel').html();
            let pagination = `<div data-query="${prev}" class="pagination:number arrow">
            <svg width="18" height="18">
              <use xlink:href="#left" />
            </svg>
            <span class="arrow:text">${prevlabel}</span>
          </div>`;

            let count = data['page_count'];
            let skip = false;
            let i = 1;
            if (count > 10) {
                skip = true;
                if (data['page'] > 10) {
                    i = data['page'] - 5;
                }
            }
            for (i; i < (count + 1); i++) {
                if (data['page'] == i) {
                    pagination += `<div data-query="?page=${i}&per_page=4" class="pagination:number pagination:active">
                    ${i}
                    </div>`;
                } else {
                    pagination += `<div data-query="?page=${i}&per_page=4" class="pagination:number">
                    ${i}
                    </div>`;
                }

                if (skip && i == 11) {
                    pagination += `<span>...</span><div data-query="?page=${count}&per_page=4" class="pagination:number">
                    ${i}
                    </div>`;
                    i = count + 1;
                }
            }
            pagination += `<div data-query="${next}" class="pagination:number arrow">
            <svg width="18" height="18">
              <use xlink:href="#right" />
            </svg>
          </div>`;

            $('#pagination').html(pagination);

        },
        checkURL: function(url) {
            var arr = ["jpeg", "jpg", "gif", "png"];
            if (typeof url !== 'undefined') {
                var ext = url.substring(url.lastIndexOf(".") + 1);
                if ($.inArray(ext, arr)) {
                    return true;
                }
                return false;
            }
            return false
        },
        getMenuLanguageCornav: function(lang) {
            let language = (lang.toLowerCase());
            if (language == "sw") {
                language = "sw-ke";
            }
            if (language == "fa-af") {
                language = "fa";
            }
            return language;
        },
        getMenu: function() {
            var self = this;
            let lang = self.getMenuLanguageCornav($('html').attr('lang'));

            $.ajax({
                url: 'https://settleinus.org/wp-json/wp/v2/menu',
                type: 'GET',
                data: {
                    'lang': lang
                },
                dataType: 'json',
                cache: true
            }).done(function(response) {
                // The response is available here.
                let $content = '';
                response.forEach(element => {
                    $content += '<li class=""><a href="' + element['url'] + '" class="" >' + element['title'] + "</a></li>";
                });
                $('#user-nav ul.user-nav-list').html($content);
                $('#user-nav-mobile ul.menu-list-mobile-items').html($content);
            });

            // $.ajax({
            //     url: 'https://settleinus.org/wp-json/wp/v2/menu',
            //     type: 'GET',
            //     data: {
            //         'lang': lang.substring(0, 2)
            //     },
            //     dataType: 'json',
            //     success: function(data) {
            //         let $content = '';
            //         data.forEach(element => {
            //             $content += '<li class=""><a href="' + element['url'] + '" class="" >' + element['title'] + "</a></li>";
            //         });
            //         $('#user-nav ul.user-nav-list').html($content);
            //         $('#user-nav-mobile ul.menu-list-mobile-items').html($content);

            //     },
            //     error: function(request, error) {
            //         console.log("Request: " + JSON.stringify(request));
            //     }
            // });

        },


    }

    $.coreThemeCore = CoreThemeCore.prototype;



    $(document).ready(function() {
        // Initialize script
        new CoreThemeCore();

    });

    var localCache = {
        /**
         * timeout for cache in millis
         * @type {number}
         */
        timeout: 30000000,
        /** 
         * @type {{_: number, data: {}}}
         **/
        data: {},
        remove: function(url) {
            delete localCache.data[url];
        },
        exist: function(url) {
            return !!localCache.data[url] && ((new Date().getTime() - localCache.data[url]._) < localCache.timeout);
        },
        get: function(url) {
            console.log('Getting in cache for url' + url);
            return localCache.data[url].data;
        },
        set: function(url, cachedData, callback) {
            localCache.remove(url);
            localCache.data[url] = {
                _: new Date().getTime(),
                data: cachedData
            };
            if ($.isFunction(callback)) callback(cachedData);
        }
    };

    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        if (options.cache) {
            var complete = originalOptions.complete || $.noop,
                url = originalOptions.url;
            //remove jQuery cache as we have our own localCache
            options.cache = false;
            options.beforeSend = function() {
                if (localCache.exist(url)) {
                    complete(localCache.get(url));
                    return false;
                }
                return true;
            };
            options.complete = function(data, textStatus) {
                localCache.set(url, data, complete);
            };
        }
    });

})(jQuery);