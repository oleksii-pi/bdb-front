var ko = require('knockout');

ko.bindingHandlers.numericValue = {
    init : function(element, valueAccessor, allBindingsAccessor) {

        $(element).on("keydown", function (event) {
            let key = event.keyCode;

            if (key == 38) {
                $(element).val(+$(element).val() + 1);
                return;
            }
            if (key == 40) {
                $(element).val(+$(element).val() - 1);
                return;
            }

            // Allow: backspace, delete, tab, escape, and enter
            if (key == 46 || key == 8 || key == 9 || key == 27 || key == 13 ||
                // Allow: Ctrl+A
                (key == 65 && event.ctrlKey === true) ||
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
        var interceptor = ko.dependentObservable({
            read: underlyingObservable,
            write: function(value) {
                if (!isNaN(value)) {
                    underlyingObservable(parseFloat(value));
                }
            }
        });
        ko.bindingHandlers.value.init(element, function() { return interceptor }, allBindingsAccessor);
    },
    update : ko.bindingHandlers.value.update
};
