/*
This document loads all pages and handles all of the buttloads of AJAX calls :P
*/

localStorage.path_to_layouts = "http://localhost/sites/five_minute/page_layouts.php";
localStorage.path_to_interface = "http://localhost/sites/five_minute/ajax_interface.php";
localStorage.path_to_images = "C:/Users/arsoo_000/Documents/GitHub/FiveMinuteFlowersAPP/www/img/flowers/";

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
});

$(document).on("pagebeforeshow", "#index", function() {
	$("#occasion-list").load(localStorage.path_to_layouts + "?action=read&page-layout=index-categories", function() {
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
});

$(document).on("pagebeforeshow", "#browse", function() {
	$("#browse-page-title").html(localStorage.categoryChosen);
	$("#browse-image-blocks").load(localStorage.path_to_layouts + "?action=read&page-layout=browse-images&category=" + encodeURIComponent(localStorage.categoryChosen), function() {
		hideLoader();
	});
});

//Get specific flower

$(document).on("pageshow", "#single", function() {
	showLoader();
});

$(document).on("pagebeforeshow", "#single", function() {
	$.get(localStorage.path_to_interface + "?action=get-flower-info&arrangement=" + localStorage.specificFlower, function(data) {
		var flowerData = $.parseJSON(data);
		var flowerImageCode = flowerData["arrangement_code"];
		var flowerImage = flowerImageCode.replace("FLO", "flo");
		$("#single-flower-name").html(flowerData["arrangement_name"]);
		$("#single-flower-price").html("$" + flowerData["retail_price"]);
		$("#single-flower-desc").html(flowerData["flower_description"]);
		$("#single-flower-image").attr("src", localStorage.path_to_images  + flowerImage + "_low.jpg");
		$("#single-page-content").fadeIn();
		hideLoader();
	});
});

//Set options for personalization wizard

function setPersonalizedOptions() {
	localStorage.personalName = $("#recipient-card-name").html();
	localStorage.personalBudget = $("#personal-budget").val();
	localStorage.personalOccasion = $("#personal-occasion").val();
	localStorage.personalFlowerType = $("#personal-flower-type").val();
	$.mobile.changePage("#personalized", { transition: "flip" });
}

//Get personalized recommendations

$(document).on("pageshow", "#personalized", function() {
	showLoader();
});

$(document).on("pagebeforeshow", "#personalized", function() {
	$.post(localStorage.path_to_interface, {
		getAction: "get-personalized-array",
		personalizedBudget: localStorage.personalBudget,
		personalizedOccasion: localStorage.personalOccasion,
		personalizedFlowerType: localStorage.personalFlowerType
	}, function(data) {
		if (data != "none") {
			localStorage.personalizedString = data;
			var personalizedArray = $.parseJSON(localStorage.personalizedString);
			localStorage.personalizedMaxArray = personalizedArray.length;
			localStorage.personalizedCurrentIndex = 0;
			$("#personalized-image-pic").attr("src", localStorage.path_to_images + personalizedArray[0]["arrangement_code"].replace("FLO", "flo") + "_low.jpg");
			$("#personalized-image-name").html(personalizedArray[0]["arrangement_name"]);
			$("#personalized-image-price").html("$" + personalizedArray[0]["retail_price"]);
			$("#personalized-image-desc").html(personalizedArray[0]["flower_description"]);
			
			//Show the personalization page
			
			$("#personalized-page-content").fadeIn();
			hideLoader();
			renderPersonal();
		}
	});
});

//Go back and forth using array index values

$("#personalized-forward").click(function() {
	var newIndex = parseInt(localStorage.personalizedCurrentIndex) + 1;
	if (newIndex > parseInt(localStorage.personalizedMaxArray) - 1) {
		return false;
	} else {
		var personalizedArray = $.parseJSON(localStorage.personalizedString);
		localStorage.personalizedCurrentIndex = newIndex;
		$(".ajax-block").fadeIn();
		$("#personalized-image-pic").attr("src", localStorage.path_to_images + personalizedArray[newIndex]["arrangement_code"].replace("FLO", "flo") + "_low.jpg");
		$("#personalized-image-name").html(personalizedArray[newIndex]["arrangement_name"]);
		$("#personalized-image-price").html("$" + personalizedArray[newIndex]["retail_price"]);
		$("#personalized-image-desc").html(personalizedArray[newIndex]["flower_description"]);
		$(".ajax-block").fadeOut();
	}
});

$("#personalized-back").click(function() {
	var newIndex = parseInt(localStorage.personalizedCurrentIndex) - 1;
	if (newIndex < 0) {
		return false;
	} else {
		var personalizedArray = $.parseJSON(localStorage.personalizedString);
		localStorage.personalizedCurrentIndex = newIndex;
		$(".ajax-block").fadeIn();
		$("#personalized-image-pic").attr("src", localStorage.path_to_images + personalizedArray[newIndex]["arrangement_code"].replace("FLO", "flo") + "_low.jpg");
		$("#personalized-image-name").html(personalizedArray[newIndex]["arrangement_name"]);
		$("#personalized-image-price").html("$" + personalizedArray[newIndex]["retail_price"]);
		$("#personalized-image-desc").html(personalizedArray[newIndex]["flower_description"]);
		$(".ajax-block").fadeOut();
	}
});