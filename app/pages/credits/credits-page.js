/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/
const CreditsViewModel = require("./credits-view-model");


function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = new CreditsViewModel();
}


module.exports = {
    onNavigatingTo: onNavigatingTo,
}
