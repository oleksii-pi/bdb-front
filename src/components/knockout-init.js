var ko = require('knockout');

//// extenders

ko.extenders.logChange = function(target, option) {
    target.subscribe(function(newValue) {
        console.log(option + ": " + newValue);
    });
    return target;
};

// if next extender will replace original observable
// dataType should be reassigned
// newObservable.dataType = originalObservable.dataType; // fix "forgetting" dataType

ko.extenders.dataType = function(target, option) {
    target.dataType = option;
    if (target.dataType == 'integer') {
        var result = createIntegerInterceptor(target);
        result.dataType = target.dataType;
        return result;
    } else {
        return target;
    }
};

// https://gist.github.com/hereswhatidid/8205263
var createIntegerInterceptor = function (target) {
    var result = ko.computed({
        read: target,  //always return the original observables value
        write: function (newValue) {
            var current = target(),
                newValueAsInteger = isNaN(newValue) ? 0 : parseInt(+newValue, 10);

            //only write if it changed
            if (newValueAsInteger !== current) {
                target(newValueAsInteger);
            } else {
                //if the tested value is the same, but a different value was written, force a notification for the current field
                if (newValue !== current) {
                    target.notifySubscribers(newValueAsInteger);
                }
            }
        }
    }).extend({notify: 'always'});

    //initialize with current value to make sure it is rounded appropriately
    result(target());
    return result;
};

ko.extenders.range = function(target, paramRange) {
    //create a writable computed observable to intercept writes to our observable
    var result = ko.pureComputed({
        read: target,  //always return the original observables value
        write: function(newValue) {
            var current = target();
            var valueToWrite = newValue;
            if (typeof paramRange.min !== 'undefined' && (valueToWrite < paramRange.min)) {
                valueToWrite = paramRange.min;
            }
            if (typeof paramRange.max !== 'undefined'  && (valueToWrite > paramRange.max)) {
                valueToWrite = paramRange.max;
            }

            //only write if it changed
            if (valueToWrite !== current) {
                target(valueToWrite);
            } else {
                //if the rounded value is the same, but a different value was written, force a notification for the current field
                if (newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        }
    }).extend({ notify: 'always' });

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    result.dataType = target.dataType; // fix "forgetting" dataType

    //return the new computed observable
    return result;
};

ko.extenders.precision = function(target, paramPrecision) {
    //create a writable computed observable to intercept writes to our observable
    var result = ko.pureComputed({
        read: target,  //always return the original observables value
        write: function(newValue) {
            var current = target(),
                roundingMultiplier = Math.pow(10, paramPrecision),
                newValueAsNum = isNaN(newValue) ? 0 : +newValue,
                valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

            //only write if it changed
            if (valueToWrite !== current) {
                target(valueToWrite);
            } else {
                //if the rounded value is the same, but a different value was written, force a notification for the current field
                if (newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        }
    }).extend({ notify: 'always' });

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    result.dataType = target.dataType; // fix "forgetting" dataType

    //return the new computed observable
    return result;
};

//// bindingHandlers

ko.bindingHandlers.stringValue = {
    init : function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.unwrap(valueAccessor());

        var fixHeight = function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight)+'px'
        };
        element.setAttribute('rows', '1');

        $(element).val(value);
        fixHeight.call(element);

        // case 1: inherit valueUpdate binding, base subscriptions to propertychange, focus, blur
        //ko.bindingHandlers.value.init(element, valueAccessor, allBindings);
        // OR
        // case 2: manual subscribe to changes that you are interested to as you like to do it
        $(element).on('input', function() {
            valueAccessor()($(this).val());
        });
    },
    update : function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.unwrap(valueAccessor());
        $(element).val(value);

        var fixHeight = function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight)+'px'
        };
        fixHeight.call(element);
    }
};

ko.bindingHandlers.integerValue = {
    init : function(element, valueAccessor, allBindingsAccessor) {

        $(element).on("keydown", function (event) {
            var key = event.keyCode;
            //console.log(key);
            var value = ko.unwrap(valueAccessor());
            var intValue = parseInt(value);

            // up
            if (key == 38) {
                valueAccessor()(intValue + 1);
                return;
            }
            // down
            if (key == 40) {
                valueAccessor()(intValue - 1);
                return;
            }

            // Allow: backspace, delete, tab, escape, enter, minus
            if (key == 46 || key == 8 || key == 9 || key == 27 || key == 13 || key == 189 ||
                // Allow: Ctrl/Command + A, C, V, X, Z
                ((event.ctrlKey || event.metaKey) && [65, 67, 86, 88, 90].indexOf(key) != -1) ||
                // Allow: . ,
                //(key == 188 || key == 190 || key == 110) ||
                // Allow: home, end, left, right
                (key >= 35 && key <= 39)) {
                // let it happen, don't do anything
                return;
            } else {
                // Ensure that it is a number and stop the keypress
                if (event.shiftKey || (key < 48 || key > 57) && (key < 96 || key > 105)) {
                    event.preventDefault();
                }
            }
        });

        var underlyingObservable = valueAccessor();
        var interceptor = ko.pureComputed({
            read: underlyingObservable,
            write: function(newValue) {
                if (newValue == '-' || newValue == '') {
                    underlyingObservable(0);
                    return;
                }

                if (!isNaN(newValue) && !isNaN(parseInt(newValue))) {
                    underlyingObservable(parseInt(newValue));
                } else {
                    underlyingObservable(0);
                    underlyingObservable.notifySubscribers();
                }
            }
        }).extend({ notify: 'always' });
        ko.bindingHandlers.value.init(element, function() { return interceptor }, allBindingsAccessor);
    },
    update : ko.bindingHandlers.value.update
};

ko.bindingHandlers.floatValue = {
    init : function(element, valueAccessor, allBindingsAccessor) {

        $(element).on("keydown", function (event) {
            var key = event.keyCode;

            var value = ko.unwrap(valueAccessor());
            var floatValue = parseFloat(value);

            // up
            if (key == 38) {
                valueAccessor()(floatValue + 1);
                return;
            }
            // down
            if (key == 40) {
                valueAccessor()(floatValue - 1);
                return;
            }

            // Allow: backspace, delete, tab, escape, and enter
            if (key == 46 || key == 8 || key == 9 || key == 27 || key == 13 || key == 189 ||
                // Allow: Ctrl/Command + A, C, V, X, Z
                ((event.ctrlKey || event.metaKey) && [65, 67, 86, 88, 90].indexOf(key) != -1) ||
                // Allow: . ,
                (key == 188 || key == 190 || key == 110) ||
                // Allow: home, end, left, right
                (key >= 35 && key <= 39)) {
                // let it happen, don't do anything
                return;
            } else {
                // Ensure that it is a number and stop the keypress
                if (event.shiftKey || (key < 48 || key > 57) && (key < 96 || key > 105)) {
                    event.preventDefault();
                }
            }
        });

        var underlyingObservable = valueAccessor();
        var interceptor = ko.pureComputed({
            read: underlyingObservable,
            write: function(newValue) {
                if (newValue == '-' || newValue == '') {
                    underlyingObservable(0);
                    return;
                }
                if (!isNaN(newValue) && !isNaN(parseFloat(newValue))) {
                    underlyingObservable(parseFloat(newValue));
                } else {
                    underlyingObservable(0);
                    underlyingObservable.notifySubscribers(0);
                }
            }
        }).extend({ notify: 'always' });
        ko.bindingHandlers.value.init(element, function() { return interceptor }, allBindingsAccessor);
    },
    update : ko.bindingHandlers.value.update
};