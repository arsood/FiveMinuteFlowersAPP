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

//Set localStorage variables

function setBrowsePage(category) {
	localStorage.categoryChosen = category;
	window.location = "#browse";
}

function setSpecificFlower(flower) {
	localStorage.specificFlower = flower;
	window.location = "#single";
}

//Get occasion-specific flowers

$(document).on("pageshow", "#browse", function() {
	showLoader();
	$("#browse-page-title").html(localStorage.categoryChosen);
	$("#browse-image-blocks").load("http://localhost/sites/five_minute/page_layouts.php?action=read&page-layout=browse-images&category=" + encodeURIComponent(localStorage.categoryChosen), function() {
		hideLoader();
	});
});

//Get specific flower

$(document).on("pageshow", "#single", function() {
	showLoader();
	$.get("http://localhost/sites/five_minute/ajax_interface.php?action=get-flower-info&arrangement=" + localStorage.specificFlower, function(data) {
		var flowerData = $.parseJSON(data);
		var flowerImageCode = flowerData["arrangement_code"];
		var flowerImage = flowerImageCode.replace("FLO", "flo");
		$("#single-flower-name").html(flowerData["arrangement_name"]);
		$("#single-flower-price").html("$" + flowerData["retail_price"]);
		$("#single-flower-desc").html(flowerData["flower_description"]);
		$("#single-flower-image").attr("src", "C:/Users/arsoo_000/Documents/GitHub/FiveMinuteFlowersAPP/www/img/flowers/"  + flowerImage + "_low.jpg");
		hideLoader();
	});
});