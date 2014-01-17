/*General application JS*/

localStorage.path_to_actions = "http://fiveminuteflowers.com/api/actions.php";
localStorage.path_to_interface = "http://fiveminuteflowers.com/api/ajax_interface.php";
localStorage.path_to_layouts = "http://fiveminuteflowers.com/api/page_layouts.php";
localStorage.path_to_images = "img/flowers/";

document.addEventListener("deviceready", onDeviceReady, true);

function onDeviceReady() {
	
var networkState = navigator.connection.type;

if (networkState == "none") {
	alert("Please connect to the internet to use this app :)");
	return false;
}

//Check for kill code

$.get("http://emboldenmedia.com/apps/fmf/kill_check.php", function(data){
	var ajaxData = $.trim(data);
	if (ajaxData == "kill") {
		window.location = "html/dialogs/kill-error.html";
	}
});

//Handle login page

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
		   $("#payment-saved-billing").listview("refresh");
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
		   $("#payment-saved-delivery").listview("refresh"); 
		});
	}
});

} //Finish off device ready stuff

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

//Handle creation of account

function createAccount() {
	var emailEntered = $("#account-email").val();
	
	if (emailEntered == "") {
		alert("Please enter an email address to get started");
		return false;
	}
	
	var atpos = emailEntered.indexOf("@");
	var dotpos = emailEntered.lastIndexOf(".");
	
	if (atpos<1 || dotpos < atpos + 2 || dotpos + 2 >= emailEntered.length) {
		alert("Please enter a valid email address");
		return false;
	} else {
		saveNewUser(emailEntered);		
	}
}

//Alter position of clock logo

resizeClock();

$(window).resize(function() {
	resizeClock();
});

function resizeClock() {
	$(".clock-logo").css("left", ($(window).width() / 2) - 85);
}

//Create cool looking card after new entry

$("#save-recipient").click(function() {
	var recName = document.getElementById("recipient-name").value;
	
	//Go to dialog if name is empty
	
	if (recName == "") {
		window.location="html/dialogs/wizard-field-error.html";
		return false;
	}
	
	//Fill in rec name
	
	$("#recipient-card-name").html(recName);
	
	//Take away previous listings
	
	$("#recipient-select").fadeOut("fast");
	
	//Animate rec card
	
	$("#recipient-enter").animate({
		"margin-top": "125px"
	}, 500, "swing", function() {
		$("#recipient-enter").css("margin-top", "20px");
		$("#recipient-info").fadeIn("slow", function() {
			$("#recipient-enter").fadeOut("fast", function() {
				$("#wizard-options").fadeIn();
			});
		});
	});
});

//Create cool card after list click

function setRec(recName) {
	$("#recipient-card-name").html(recName);
	$("#recipient-select").fadeOut(function() {
		$("#recipient-enter").fadeOut(function() {
			$("#recipient-info").fadeIn(function() {
				$("#wizard-options").fadeIn();
			});
		});
	});
}

//Start over button

$("#start-over").click(function() {
	location.reload();
});

//Show best sellers dialog

$("#best-sellers-link").click(function() {
	window.location = "html/dialogs/coming-soon.html";
});

//Add image borders for styled choices

$(".wizard-flower-block img").click(function() {
	$(".wizard-flower-block").attr("style", "");
	$(this).parents(".wizard-flower-block").css("border", "#09C 3px solid");
	$("#personal-flower-type").val($(this).attr("data-flower-type"));
});

//Change pointer height on show with a little animation

function renderPersonal() {
	setTimeout(function() {
		var imageHeight = $(".personalized-image").height();
		//Ajax loader graphic
		
		$("#loader-graphic").css("margin-top", (imageHeight/2) - 50);
		
		//Image pointers and image information
		
		$(".personalized-pointer").animate({
			"padding-top": (imageHeight/2) - 24
		}, 500, function() {
			setTimeout(function() {
				$("#personalized-image-name").fadeIn("slow");
				$("#personalized-image-price").fadeIn("slow");
			}, 1000);
		});
	}, 500);
}

//Thumb ratings

$("#rating-up").click(function() {
	$(this).css("color", "#edbe01");
	$("#rating-down").attr("style", "");
});

$("#rating-down").click(function() {
	$(this).css("color", "#900");
	$("#rating-up").attr("style", "");
});

//Scroll to occasions

$("#for-occasion").click(function() {
	$("body").animate({
		scrollTop: $("#occasion-list").offset().top
	}, 800);
});

//Validate billing information

function submitBilling() {
	if (
		$("#billing-first-name").val() == "" ||
		$("#billing-last-name").val() == "" ||
		$("#billing-address-1").val() == "" ||
		$("#billing-city").val() == "" ||
		$("#billing-state").val() == "" ||
		$("#billing-zipcode").val() == ""
	) {
		alert("Please enter all information");
		return false;
	} else {
		//AJAX here and next part on callback
		
		$.mobile.changePage("#delivery", { transition: "fade" });
	};
}

//Validate delivery information

function submitDelivery() {
	if (
		$("#delivery-first-name").val() == "" ||
		$("#delivery-last-name").val() == "" ||
		$("#delivery-address-1").val() == "" ||
		$("#delivery-city").val() == "" ||
		$("#delivery-state").val() == "" ||
		$("#delivery-zipcode").val() == ""
	) {
		alert("Please enter all information");
		return false;
	} else {
		$.mobile.changePage("#message", { transition: "fade" });
	};
}

//Confirm order

function confirmOrder() {
	if (
		$("#payment-card-num").val() == "" ||
		$("#payment-expire-month").val() == "" ||
		$("#payment-expire-year").val() == "" ||
		$("#payment-security-code").val() == ""
	) {
		alert("Please enter all information");
		return false;
	} else {
		showLoader();
		
		//Get Stripe token
		
		Stripe.card.createToken({
			name: $("#billing-first-name").val() + " " + $("#billing-last-name").val(),
			number: $('#payment-card-num').val(),
			cvc: $('#payment-security-code').val(),
			exp_month: $('#payment-expire-month').val(),
			exp_year: $('#payment-expire-year').val()
		}, function(status, response) {
			if (response.error) {
				alert(response.error.message);
				hideLoader();
				return false;
			} else {
				localStorage.stripeToken = response["id"];
				$(".success-flower img").attr("src", "img/flowers/" + localStorage.arrangementSelected + "_low.jpg");
				
				$("#confirm-arrangement-name").html(localStorage.arrangementName);
				$("#confirm-arrangement-price").html("Arrangement Price: " + "$" + localStorage.arrangementPrice);
				
				if ($("#personal-message").val() == "") {
					$("#confirm-personal-message").html("N/A");
				} else {
					$("#confirm-personal-message").html($("#personal-message").val());
				}
				
				var totalPrice = parseFloat(localStorage.arrangementPrice) + 6;
				$("#confirm-total").html("<strong>Total: $" + totalPrice.toFixed(2) + "</strong>");
				
				hideLoader();
				$.mobile.changePage("#confirm", { transition: "slide" });
			}
		});
	}
}

//Validate and submit entire order

function submitOrder() {
	showLoader();
	
	//Send the beast to the pits of the backend!
	
	$.post(localStorage.path_to_actions, {
		userUuid: device.uuid,
		arrangementSelected: localStorage.arrangementSelected,
		arrangementPrice: localStorage.arrangementPrice,
		paymentToken: localStorage.stripeToken,
		saveBilling: $("#save-billing-address-button").prop("checked"),
		saveDelivery: $("#save-delivery-address-button").prop("checked"),
		billingFirstName: $("#billing-first-name").val(),
		billingLastName: $("#billing-last-name").val(),
		billingAddress1: $("#billing-address-1").val(),
		billingAddress2: $("#billing-address-2").val(),
		billingCity: $("#billing-city").val(),
		billingState: $("#billing-state").val(),
		billingZipcode: $("#billing-zipcode").val(),
		deliveryFirstName: $("#delivery-first-name").val(),
		deliveryLastName: $("#delivery-last-name").val(),
		deliveryAddress1: $("#delivery-address-1").val(),
		deliveryAddress2: $("#delivery-address-2").val(),
		deliveryCity: $("#delivery-city").val(),
		deliveryState: $("#delivery-state").val(),
		deliveryZipcode: $("#delivery-zipcode").val(),
		personalMessage: $("#personal-message").val(),
		deliveryInstructions: $("#delivery-instructions").val()
	}, function() {
		hideLoader();
		$.mobile.changePage("#success", { transition: "fade" });
	});
}

//Select arrangement handler

function selectArrange(arrangement, price, name) {
	localStorage.arrangementSelected = arrangement;
	localStorage.arrangementPrice = price;
	localStorage.arrangementName = name;
	$.mobile.changePage("#billing", { transition: "fade" });
}

//Complete order and redirect to index while reloading DOM

function completeOrder() {
	$.mobile.changePage("#index", { transition: "fade" });
	location.reload();
}

//Remove saved recipients

function removeRec(id) {
	var removeConf = confirm("Are you sure you want to remove this person?");
	
	if (removeConf) {
		$.post(localStorage.path_to_interface, {
			userUuid: device.uuid,
			method: "write",
			action: "remove-recipient",
			recId: id
		}, function() {
			$("#saved-rec-" + id).fadeOut();
			$("#account-recipients").trigger("change");
		});
	}
}

//Remove saved recipients

function removeBill(id) {
	var removeConf = confirm("Are you sure you want to remove this address?");
	
	if (removeConf) {
		$.post(localStorage.path_to_interface, {
			userUuid: device.uuid,
			method: "write",
			action: "remove-billing",
			billId: id
		}, function() {
			$("#saved-bill-" + id).fadeOut();
			$("#account-billing").trigger("change");
		});
	}
}

/*
This document loads all pages and handles all of the buttloads of AJAX calls :P
*/

//Stylistic functions

function clearRatingColor() {
	$("#rating-down").attr("style", "");
	$("#rating-up").attr("style", "");
}

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
		$("#single-select").attr("onClick", "selectArrange('" + flowerData["arrangement_code"] + "', '" + flowerData["retail_price"] + "', '" + flowerData["arrangement_name"] + "');");
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
			$("#personalized-select").attr("onClick", "selectArrange('" + personalizedArray[0]["arrangement_code"] + "', '" + personalizedArray[0]["retail_price"] + "', '" + personalizedArray[0]["arrangement_name"] + "');");
			
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
		$("#personalized-select").attr("onClick", "selectArrange('" + personalizedArray[newIndex]["arrangement_code"] + "', '" + personalizedArray[newIndex]["retail_price"] + "', '" + personalizedArray[newIndex]["arrangement_name"] + "');");
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
		$("#personalized-select").attr("onClick", "selectArrange('" + personalizedArray[newIndex]["arrangement_code"] + "', '" + personalizedArray[newIndex]["retail_price"] + "', '" + personalizedArray[newIndex]["arrangement_name"] + "');");
		$(".ajax-block").fadeOut();
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