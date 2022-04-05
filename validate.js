// hàm Validator
function Validator(options) {

    function getParent(inputElement,selector) {
        while(inputElement.parentElement){
            if(inputElement.parentElement.matches(selector)) {
                return inputElement.parentElement;
            }
            inputElement =inputElement.parentElement;
        }
    }

    var selectorRules = {};

    // hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorMessage
        const errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);

        // lặp qua từng rule & kiểm tra
        // nếu có lỗi thì dừng việc check
        var rules = selectorRules[rule.selector];
        for (var i = 0; i < rules.length; i++) {
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    // lấy element của form cần validate
    const formElement = document.querySelector(options.form);

    if (formElement) {

        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(rule => {
                var isValid = validate(formElement.querySelector(rule.selector), rule);
                if(!isValid){
                    isFormValid = false;
                }
            });
            
            if(isFormValid) {
                // Trường hợp submit với js
                if(typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce((values,input) => {
                        switch(input.type) {
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }

                                if(!Array.isArray(values[input.name])){
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
                    },{});
                    options.onSubmit(formValues);
                }
                // Trường hợp submit với hành vi mặt định
                else {
                    formElement.submit();
                }
            }
        }

        // lặp qua mỗi rule và xử lý xự kiện blur,input
        options.rules.forEach(rule => {

            // lưu lại các rules function testcho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(inputElement => {
            // xử lý khi blur ra khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                // xử lý khi người dùng nhập vào input
                inputElement.oninput = function () {
                    const errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                }
            })
            
        });
    }
}

// định nghĩa rules
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            if(typeof value === 'string'){
                return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
            } else {
                return value ? undefined : message || 'Vui lòng nhập trường này'
            }
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng tối thiệu ${min} kí tự`;
        }
    }
}

Validator.isConfirmed = function (selector, getPassword, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getPassword() ? undefined : message || 'Trường này không đúng';
        }
    }
}