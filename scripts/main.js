newPage = function(){
	app.pages.push({
		"title":"untitled",
		"markdown":"Type in *Markdown* and see the result instantly."
	})
	if (app.pages.length>1){
		app.selected = app.pages.length -1;
	}
	else {
		app.selected = 0
	}
}

document.addEventListener('DOMContentLoaded', function(){
	app = document.querySelector("#auto-bind");
	app.selected=0;
	app.pages = [];
	newPage();

    var elem = document.getElementById('fab');
    elem.addEventListener('click',function(){
    	newPage();
    });
});