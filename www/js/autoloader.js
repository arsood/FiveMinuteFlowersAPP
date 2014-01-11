function runLoader() { //Run the loader

/*
This document loads all pages and handles all of the buttloads of AJAX calls :P
*/

localStorage.path_to_layouts = "http://fiveminuteflowers.com/api/page_layouts.php";
localStorage.path_to_interface = "http://fiveminuteflowers.com/api/ajax_interface.php";
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

//Stylistic functions

function clearRatingColor() {
	$("#rating-down").attr("style", "");
	$("#rating-up").attr("style", "");
}

//Handle login page

$(document).on("pageshow", "#login", function() {
	$("#login-block-logo").fadeIn();
	
	$.post(localStorage.path_to_interface, {
		method: "read",
		action: "check-login",
		userUuid: device.uuid
	}, function(data) {
		var ajaxData = $.trim(data);
		if (ajaxData == "yes") {
			setTimeout(function() {
				$.mobile.changePage("#index", { transition: "fade" });
			}, 2000);
		} else {
			setTimeout(function() {
				$("#login-block-logo").fadeOut(function() {
					$("#login-field").fadeIn("slow");
				});
			}, 2000);
		}
	});
});

//Save our new user

function saveNewUser(email) {
	showLoader();
	
	$.post(localStorage.path_to_interface, {
		method: "write",
		action: "create-new-user",
		userEmail: email,
		userUuid: device.uuid
	}, function(data) {
		var ajaxData = $.trim(data);
		if (ajaxData == "ok") {
			$.mobile.changePage("#index", { transition: "fade" });
			hideLoader();
		} else {
			hideLoader();
			alert("There was an error processing your request");
		}
	});
}

//Get index occasions

$(document).on("pageshow", "#index", function() {
	showLoader();
	
	$("#occasion-list").load(localStorage.path_to_layouts + "?action=read&page-layout=index-categories", function() {
		hideLoader();
	});
});

//Set localStorage variables

function setBrowsePage(category) {
	localStorage.categoryChosen = category;
	$.mobile.changePage("#browse", { transition: "fade" });
}

function setSpecificFlower(flower) {
	localStorage.specificFlower = flower;
	$.mobile.changePage("#single", { transition: "pop" });
}

//Get occasion-specific flowers

$(document).on("pageshow", "#browse", function() {
	showLoader();
	$("#browse-image-blocks").fadeOut("fast");
	
	$("#browse-page-title").html(localStorage.categoryChosen);
	$("#browse-image-blocks").load(localStorage.path_to_layouts + "?action=read&page-layout=browse-images&category=" + encodeURIComponent(localStorage.categoryChosen), function() {
		$("#browse-image-blocks").fadeIn();
		hideLoader();
	});
});

//Get specific flower

$(document).on("pageshow", "#single", function() {
	showLoader();
	$("#single-page-content").fadeOut("fast");
	
	$.get(localStorage.path_to_interface + "?action=get-flower-info&arrangement=" + localStorage.specificFlower, function(data) {
		var ajaxData = $.trim(data);
		var flowerData = $.parseJSON(ajaxData);
		$("#single-flower-name").html(flowerData["arrangement_name"]);
		$("#single-flower-price").html("$" + flowerData["retail_price"]);
		$("#single-flower-desc").html(flowerData["flower_description"]);
		$("#single-flower-image").attr("src", localStorage.path_to_images  + flowerData["arrangement_code"] + "_low.jpg");
		$("#single-select").attr("onClick", "selectArrange('" + flowerData["arrangement_code"] + "', '" + flowerData["retail_price"] + "');");
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
	
	$.post(localStorage.path_to_interface, {
		getAction: "get-personalized-array",
		personalizedBudget: localStorage.personalBudget,
		personalizedOccasion: localStorage.personalOccasion,
		personalizedFlowerType: localStorage.personalFlowerType
	}, function(data) {
		var ajaxData = $.trim(data);
		if (ajaxData == "none") {
			alert("Nothing was found! Please try another search.");
			$.mobile.changePage("#wizard", { transition: "fade" });
		} else {
			localStorage.personalizedString = data;
			var personalizedArray = $.parseJSON(localStorage.personalizedString);
			localStorage.personalizedMaxArray = personalizedArray.length;
			localStorage.personalizedCurrentIndex = 0;
			$("#personalized-image-pic").attr("src", localStorage.path_to_images + personalizedArray[0]["arrangement_code"] + "_low.jpg");
			$("#personalized-image-name").html(personalizedArray[0]["arrangement_name"]);
			$("#personalized-image-price").html("$" + personalizedArray[0]["retail_price"]);
			$("#personalized-image-desc").html(personalizedArray[0]["flower_description"]);
			$("#personalized-select").attr("onClick", "selectPersonal('" + personalizedArray[0]["arrangement_code"] + "', '" + personalizedArray[0]["retail_price"] + "');");
			
			//Show the personalization page
			
			$("#personalized-page-content").fadeIn();
			hideLoader();
			renderPersonal();
		}
	});
});

//Go back and forth using array index values

$("#personalized-forward").click(function() {
	clearRatingColor();
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
		$("#personalized-select").attr("onClick", "selectPersonal('" + personalizedArray[newIndex]["arrangement_code"] + "', '" + personalizedArray[newIndex]["retail_price"] + "');");
		$(".ajax-block").fadeOut();
	}
});

$("#personalized-back").click(function() {
	clearRatingColor();
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
		$("#personalized-select").attr("onClick", "selectPersonal('" + personalizedArray[newIndex]["arrangement_code"] + "', '" + personalizedArray[newIndex]["retail_price"] + "');");
		$(".ajax-block").fadeOut();
	}
});

//Get saved billing and delivery information

$.post(localStorage.path_to_interface, {
	action: "read",
	pageLayout: "billing-selects",
	uuid: device.uuid
}, function(data) {
	var ajaxData = $.trim(data);
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
	uuid: device.uuid
}, function(data) {
	var ajaxData = $.trim(data);
	if (ajaxData == "none") {
		return false;
	} else {
		var savedDeliveryInfo = $.parseJSON(ajaxData);
		$(savedDeliveryInfo).each(function(index, element) {
		   $("#payment-saved-delivery").append("<option value='" + index + "'>" + element["delivery_first_name"] + " " + element["delivery_last_name"] + "</option>").trigger("change"); 
		});
	}
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

//Load in saved people to wizard

$(document).on("pageshow", "#wizard", function() {
	showLoader();
	
	$.post(localStorage.path_to_layouts + "?action=read&page-layout=recipient-list", {
		method: "read",
		action: "get-recipients",
		uuid: device.uuid
	}, function(data) {
		$("#recipient-select").html(data).trigger("create");
		hideLoader();
	});
});

//Load in saved people to account page

$(document).on("pageshow", "#account", function() {
	showLoader();
	
	//Get recipients
	
	$.post(localStorage.path_to_layouts + "?action=read&page-layout=recipient-list-account", {
		method: "read",
		action: "get-account-recipients",
		uuid: device.uuid
	}, function(data) {
		$("#account-recipients").html(data).trigger("create");
	});
	
	//Get billing
	
	$.post(localStorage.path_to_layouts + "?action=read&page-layout=billing-list-account", {
		method: "read",
		action: "get-account-billing",
		uuid: device.uuid
	}, function(data) {
		$("#account-billing").html(data).trigger("create");
		hideLoader();
	});
});

} //Finish loading everything