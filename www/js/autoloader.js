//General loading functions

function showLoader() {
	$.mobile.loading('show', {
		text: 'Loading...',
		textVisible: true,
		theme: 'a'
	});
}

function hideLoader() {
	$.mobile.loading("hide");
}

//Get index occasions

$(document).on("pageshow", "#index", function() {
	showLoader();
	$("#occasion-list").load("http://localhost/sites/five_minute/page_layouts.php?action=read&page-layout=index-categories", function() {
		hideLoader();
	});
});

//Load categories page on index click

$(".index-categories-button").click(function() {
	$(this).html("whatever");
});