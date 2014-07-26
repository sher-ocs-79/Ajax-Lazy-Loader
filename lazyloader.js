/**
 * AjaxLazyLoader
 * @author SherOcs <sher_ocs@yahoo.com>
 * @copyright 2014
 * @license BSD
 * @version 1.0.0
 */
var AjaxLazyLoader = function() {

    var lazy_settings = {
        text_no_more: 'No more items to display',
        load_more: {
            element: ''
        },
        config: {
            fetch_limit: 0,
            total_count: 0,
            display_limit: 0
        },
        request: function(delay, data, container) {
            /*  implement your custom ajax request  */
        }
    };

    this._fetch = function()
    {
        var container = this._container;

        batch_fetch_limit = parseInt(lazy_settings.config.fetch_limit);                                                 // subsequent executed batches limit
        lazy_limit = parseInt(lazy_settings.config.display_limit);                                                      // limit number of items per batch
        lazy_count = parseInt(lazy_settings.config.total_count);                                                        // total items

        batch_loop_ctr = container.attr('data-current_count') ? parseInt(container.attr('data-current_count')) : 1;     // current batch for process

        batch_loop_total = Math.ceil(lazy_count/lazy_limit);                                                            // total number of batch to execute
        //batch_interval_total = Math.ceil(batch_loop_total/batch_fetch_limit);

        if (batch_loop_ctr < batch_loop_total) {
            var data = {};
            for(batch=1; batch <= batch_fetch_limit && batch < batch_loop_total; batch++) {
                data.limit = lazy_limit;
                data.page = batch_loop_ctr+1;
                lazy_settings.request(batch+1, data, container);
                batch_loop_ctr += 1;
            }
        }

        $(container).attr('data-current_count', batch_loop_ctr);
    };

    this._isDone = function()
    {
        var container = this._container;

        lazy_limit = parseInt(lazy_settings.config.display_limit);
        lazy_count = parseInt(lazy_settings.config.total_count);
        batch_loop_ctr = container.attr('data-current_count') ? parseInt(container.attr('data-current_count')) : 1;
        batch_loop_total = Math.ceil(lazy_count/lazy_limit);

        return !(batch_loop_ctr < batch_loop_total);
    };

    this._notifyComplete = function()
    {
        var load_more = this._getElementLoadMore(this._container);
        if (load_more.length) {
            load_more.find('span').text(lazy_settings.text_no_more);
        }
    };

    this._getElementLoadMore = function(element)
    {
        if (typeof lazy_settings.load_more.element == 'function') {
            return lazy_settings.load_more.element(element);
        } else {
            return lazy_settings.load_more.element;
        }
    };

    this._settings = lazy_settings;
    this._container = {};
};

AjaxLazyLoader.prototype.lock = false;

AjaxLazyLoader.prototype.init = function(container, settings) {

    this._container = typeof container == 'function' ? container() : container;
    $.extend(this._settings, settings || {});

    if (this._settings.load_more.element.length) {

        var _this = this;

        $(window).scroll(function() {
            if($(window).scrollTop() == $(document).height() - $(window).height()) {

                if (AjaxLazyLoader.lock) return;

                if (!_this._isDone()) {
                    AjaxLazyLoader.lock = true;
                    _this._fetch();
                } else {
                    _this._notifyComplete();
                }

                _this._getElementLoadMore().show();
            }
        });
    }
};

AjaxLazyLoader.prototype.notifyLoaded = function(container, forceLock) {
    AjaxLazyLoader.lock = forceLock || false;
    this._getElementLoadMore(container).hide();
};