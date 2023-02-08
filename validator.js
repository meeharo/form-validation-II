function Validator (formSelector) {
    var formElement = document.querySelector(formSelector);
    var formRules = {};
    var _this = this;

    function getParent (element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
        } element = element.parentElement;
    }

    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },

        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập lại email'
        },

        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập lại tối thiểu ${min} ký tự`
            }
        }
    }

    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')
    
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|')
            
            for (var rule of rules) {
                var isRuleHasValue = rule.includes(':')
                var ruleInfo;

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }
                var ruleFunc = validatorRules[rule]
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
                
            }
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
        var formGroup;
        var formMessage; 

        function handleValidate (event) {
            formGroup = getParent(event.target, '.form-group')
            formMessage = formGroup.querySelector('.form-message')

            var rules = formRules[event.target.name]
            for (var rule of rules) {
                errorMessage = rule(event.target.value)

                if (errorMessage) {
                    formMessage.innerText = errorMessage
                    formGroup.classList.add('invalid')
                }
            }
            return !errorMessage
        }

        function handleClearError (event) {
            formGroup = getParent(event.target, '.form-group')
            formMessage = formGroup.querySelector('.form-message')

            if (formGroup.classList.contains('invalid')) {
                formMessage.innerText = ''
                formGroup.classList.remove('invalid')
            }
        }

    }

    formElement.onsubmit = function (event) {
        event.preventDefault()

        var inputs = formElement.querySelectorAll('[name][rules]')
        var isFormValid = true;
        for (var input of inputs) {
            if (!handleValidate({ target: input})) {
                isFormValid = false;
            }
        }

         if (isFormValid) {
            if (typeof _this.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]')
                var formValues = Array.from(enableInputs).reduce(function(values, input){
                    values[input.name] = [input.value]
                    return values;
                }, {})
                _this.onSubmit(formValues)
            } else {
                formElement.submit()
            }
        } 
        
    }

}