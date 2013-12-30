/*
This document loads all pages and handles all of the buttloads of AJAX calls :P
*/

localStorage.path_to_layouts = "http://localhost/sites/five_minute/page_layouts.php";
localStorage.path_to_interface = "http://localhost/sites/five_minute/ajax_interface.php";
localStorage.path_to_images = "img/flowers/";

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
		$("#single-flower-name").html(flowerData["arrangement_name"]);
		$("#single-flower-price").html("$" + flowerData["retail_price"]);
		$("#single-flower-desc").html(flowerData["flower_description"]);
		$("#single-flower-image").attr("src", localStorage.path_to_images  + flowerData["arrangement_code"] + "_low.jpg");
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
			$("#personalized-image-pic").attr("src", localStorage.path_to_images + personalizedArray[0]["arrangement_code"] + "_low.jpg");
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
		$("#personalized-image-pic").attr("src", localStorage.path_to_images + personalizedArray[newIndex]["arrangement_code"] + "_low.jpg");
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
		$("#personalized-image-pic").attr("src", localStorage.path_to_images + personalizedArray[newIndex]["arrangement_code"] + "_low.jpg");
		$("#personalized-image-name").html(personalizedArray[newIndex]["arrangement_name"]);
		$("#personalized-image-price").html("$" + personalizedArray[newIndex]["retail_price"]);
		$("#personalized-image-desc").html(personalizedArray[newIndex]["flower_description"]);
		$(".ajax-block").fadeOut();
	}
});

//Get saved billing and delivery information

$(document).ready(function() {
	$.post(localStorage.path_to_interface, {
		action: "read",
		pageLayout: "billing-selects",
		uuid: 1 //CHANGE THIS!!!!!!!!
	}, function(data) {
		ajaxData = $.trim(data);
		if (ajaxData == "none") {
			return false;
		} else {
			var savedBillingInfo = $.parseJSON(ajaxData);
			$(savedBillingInfo).each(function(index, element) {
			   $("#payment-saved-billing").append("<option value='" + index + "'>" + element["billing_address_1"] + ", " + element["billing_city"] + ", " + element["billing_state"] + "</option>").trigger("change"); 
			});
		}
	});
	
	$.post(localStorage.path_to_interface, {
		action: "read",
		pageLayout: "delivery-selects",
		uuid: 1 //CHANGE THIS!!!!!!!!
	}, function(data) {
		ajaxData = $.trim(data);
		if (ajaxData == "none") {
			return false;
		} else {
			var savedDeliveryInfo = $.parseJSON(ajaxData);
			$(savedDeliveryInfo).each(function(index, element) {
			   $("#payment-saved-delivery").append("<option value='" + index + "'>" + element["delivery_first_name"] + " " + element["delivery_last_name"] + "</option>").trigger("change"); 
			});
		}
	});
});

//Enter saved billing information into form from JSON array

$("#payment-saved-billing").on("change", function(event) {
	if ($(this).val() == "") {
		return false;
	} else {
		var savedBillingInfo = $.parseJSON(localStorage.savedBilling);
		var currentIndex = $(this).val();
		$("#billing-first-name").val(savedBillingInfo[currentIndex]["billing_first_name"]);
		$("#billing-last-name").val(savedBillingInfo[currentIndex]["billing_last_name"]);
		$("#billing-address-1").val(savedBillingInfo[currentIndex]["billing_address_1"]);
		$("#billing-address-2").val(savedBillingInfo[currentIndex]["billing_address_2"]);
		$("#billing-city").val(savedBillingInfo[currentIndex]["billing_city"]);
		$("#billing-zipcode").val(savedBillingInfo[currentIndex]["billing_zipcode"]);
	}
});

//Enter saved delivery information into form from JSON array

$("#payment-saved-delivery").on("change", function(event) {
	if ($(this).val() == "") {
		return false;
	} else {
		var savedDeliveryInfo = $.parseJSON(localStorage.savedDelivery);
		var currentIndex = $(this).val();
		$("#delivery-first-name").val(savedDeliveryInfo[currentIndex]["delivery_first_name"]);
		$("#delivery-last-name").val(savedDeliveryInfo[currentIndex]["delivery_last_name"]);
		$("#delivery-address-1").val(savedDeliveryInfo[currentIndex]["delivery_address_1"]);
		$("#delivery-address-2").val(savedDeliveryInfo[currentIndex]["delivery_address_2"]);
		$("#delivery-city").val(savedDeliveryInfo[currentIndex]["delivery_city"]);
		$("#delivery-zipcode").val(savedDeliveryInfo[currentIndex]["delivery_zipcode"]);
	}
});

//Load in saved people

$(document).on("pageshow", "#wizard", function() {
	showLoader();
});

$(document).on("pagebeforeshow", "#wizard", function() {
	$.post(localStorage.path_to_layouts + "?action=read&page-layout=recipient-list", {
		method: "read",
		action: "get-recipients",
		uuid: 1 //CHANGE THIS!!!
	}, function(data) {
		$("#recipient-select").html(data).trigger("create");
		hideLoader();
	});
});