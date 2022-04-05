function validator(formSelector) {
    var _this =this;
    console.log(_this);
    function getParent(element, selector) {
        if (element.parentElement.matches(selector)) {
            return element.parentElement;
        }
        element = element.parentElement;
    }

    var formRules = {}

    /**
     * Quy ước tạo rules
     * -Nếu có lỗi thì return 'error message'
     * -Nếu không có lỗi thì return 'undifined'
     */
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${max} ký tự`
            }
        }
    }
    // lấy form element trong DOM theo 'formSelector'
    var formElement = document.querySelector(formSelector)

    // Chỉ xử lý khi có element trong DOM
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')
        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                var isRuleHasValue = rule.includes(':');
                var ruleInfo
                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            // Lắng nghe những xự kiện blur,change,...
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
    }

    function handleValidate(event) {
        var rules = formRules[event.target.name];

        var errorMessage;
        rules.some(rule => {
            errorMessage = rule(event.target.value);
            return rule(event.target.value);
        });

        // hiển thị message lỗi ra UI
        if (errorMessage) {
            var formGroup = getParent(event.target, '.form-group');

            if (formGroup) {
                var formMessage = formGroup.querySelector('.form-message')
                formGroup.classList.add('invalid');

                if (formMessage) {
                    formMessage.innerText = errorMessage;
                }
            }
        }

        return !errorMessage;
    }
    // hàm clear message lỗi
    function handleClearError(event) {
        var formGroup = getParent(event.target, '.form-group');
        if (formGroup.classList.contains('invalid')) {
            formGroup.classList.remove('invalid');
            var formMessage = formGroup.querySelector('.form-message')

            if (formMessage) {
                formMessage.innerText = '';
            }
        }
    }

    // xử lý hành vi submit form
    formElement.onsubmit = function (event) {
        event.preventDefault();
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;
        for (var input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false
            }
        }
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]');
                var formValues = Array.from(enableInputs).reduce((values, input) => {
                    switch (input.type) {
                        case 'checkbox':
                            if (!input.matches(':checked')) {
                                values[input.name] = '';
                                return values;
                            }

                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            values[input.name].push(input.value);
                            break;
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }
                    return values;
                }, {});
                _this.onSubmit(formValues);
            } else {
                formElement.submit();
            }
        }
    }
}